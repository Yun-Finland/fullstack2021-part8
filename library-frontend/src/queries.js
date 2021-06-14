import { gql } from '@apollo/client'

export const ME = gql`
  query {
    me {
      username
      favoriteGenre
    }
  }
`

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    }
  }` 

export const ALL_BOOKS = gql`
  query getBooks($genre: String){
    allBooks (
      genre: $genre
    ) {
      title
      published
      author {
        name
      }
      genres
    }
  }
`

export const ADD_BOOK = gql`
  mutation createBook($title: String!, $author: String!, $published: Int!, $genres: [String!]! ) {
    addBook (
      title: $title,
      author: $author,
      published: $published,
      genres:$genres
    ) {
      title
      author {
        name
      }
      published
      genres,
      id
    }
  }
`
export const UPDATE_BIRTH = gql`
  mutation update_birthyear($name: String!, $setBornTo: Int!){
    editAuthor(
      name: $name,
      setBornTo: $setBornTo
    ){
      name
      id
      born
      bookCount
    }
  }
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!){
    login(username: $username, password: $password) {
      value
    }
  }
`