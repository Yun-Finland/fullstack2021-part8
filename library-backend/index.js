const config = require('./utils/config')
const { ApolloServer, UserInputError, gql, AuthenticationError } = require('apollo-server')
const jwt = require('jsonwebtoken')

const { PubSub } = require('apollo-server')
const pubsub = new PubSub()

const mongoose = require('mongoose')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')

console.log('connecting to', config.MONGODB_URI)
const JWT_SECRET = process.env.SECRET

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(()=> {
    console.log('connnected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:',error.message)
  })

const typeDefs = gql`
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String!]!
  }

  type Query {
    bookCount(name: String): Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
    ) : Book

    addAuthor(
      name: String!
      born: Int
    ): Author

    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author

    createUser(
      username: String!
      favoriteGenre: String!
    ): User

    login(
      username: String!
      password: String!
    ): Token
  }

  type Subscription {
    bookAdded: Book!
  }
`

const resolvers = {
  Query: {
    bookCount: async (root, args) => {
      const books = await Book.find({}).populate('author')

      if (!args.name){
        return books.length
      }

      const returnedBooks = books.filter(book => book.author.name === args.name)
 
      return returnedBooks.length      
    },

    authorCount: async () => {
      const authors = await Author.find({})

      return authors.length
    },

    allBooks: async (root, args) => {
      const books = await Book.find({}).populate('author')

      // if no parameters given
      if((!args.author)&&(!args.genre)){
        return books

      // return all books by certain author name
      }else if((args.author) && (!args.genre)){
        const returnedBooks = books.filter(book => book.author.name === args.author )
        return returnedBooks

      // return all books by certain genre
      }else if((!args.author) && (args.genre)){
        const returnedBooks = books.filter(book => book.genres.includes(args.genre))
        return returnedBooks

      }else{
        const returnedBooks = books.filter(book => book.author.name === args.author)
        const newReturnedBooks = returnedBooks.filter(book => book.genres.includes(args.genre))
        return newReturnedBooks
      }
    },

    allAuthors: async () => {
      const authors = await Author.find({})
      const books = await Book.find({}).populate('author')
      
      const returnedAuthors = authors.map(authorTemp => {
        const returnedBooks = books.filter(book => book.author.name === authorTemp.name)
        authorTemp.bookCount = returnedBooks.length
        return authorTemp
      })
      
      return returnedAuthors
    },

    me: (root, args, context) => {
      return context.currentUser
    }
  },

  Mutation: {
    addBook: async (root, args, context) => {
      const books = await Book.find({})
      const authors = await Author.find({})
      const currentUser = context.currentUser

      if(!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
      
      // check if the book already exists or not      
      if(books.filter(n => n.title === args.title).length){
        throw new UserInputError('Book exists already', {
          invalidArgs: args.title
        })
      }    
      
      // check if the author exists or not, if not, create new author first  
      let returnedAuthor = authors.find(n => n.name === args.author)
      
      if(returnedAuthor === undefined ){
        returnedAuthor = new Author({ name: args.author })
        
        try {
          await returnedAuthor.save()
        }catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
      }
      
      const newBook = new Book({ ...args, author: returnedAuthor._id })

      try {
        await newBook.save()
      }catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      const newBooks = await Book.find({}).populate('author')
      const returnedBook = newBooks.find(n => n.title = newBook.title)

      pubsub.publish('BOOK_ADDED', { bookAdded: returnedBook })
      return returnedBook
    },

    addAuthor: async (root, args) => {
      const authors = await Author.find({})

      let newAuthor = authors.findOne(n => n.name === args.author)
      
      if(newAuthor === undefined){
        newAuthor = new Author({ ...args })
        
        try {
          await newAuthor.save()
        }catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
      }

      return newAuthor
    },

    editAuthor: async (root, args, { currentUser }) => {
      const author = await Author.findOne({ name: args.name })
      
      if(!currentUser) {
        throw new AuthenticationError("not authenticated")
      }

      if(author === undefined){
        return null
      }
      
      author.born = args.setBornTo

      try{
        await author.save()
      }catch(error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      return author
    },

    createUser : async (root, args) => {
      const user = new User({ ...args })

      try {
        await user.save()
      }catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      return user
    },

    login: async (root, args) => {
      const user = await User.findOne({username: args.username})
      
      if(!user || args.password !== 'yunpassword'){
        throw new UserInputError('wrong credentials')
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value:jwt.sign(userForToken, JWT_SECRET )}
    }
  },

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    }
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({req}) => {
    const auth = req? req.headers.authorization : null
    if(auth && auth.toLowerCase().startsWith('bearer ')){
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )

      const currentUser = await User.findById(decodedToken.id)
      
      return { currentUser }
    }
  }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})