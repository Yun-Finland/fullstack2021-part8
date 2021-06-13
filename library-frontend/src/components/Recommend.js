import React from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS, ME} from '../queries'

const Recommend = ({show})=> {
  const book_Result = useQuery(ALL_BOOKS)
  const user_Result = useQuery(ME)

  if(!show){
    return null
  }

  const books = book_Result.data.allBooks
  const user = user_Result.data.me 

  const returnedBooks = books.filter(book => book.genres.includes(user.favoriteGenre))

  return (
    <div>
      <h1>Recommendations</h1>
      <h3>books in your favorite genre patterns</h3>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {returnedBooks
            .map(a =>
              <tr key={a.title}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>)
          }
        </tbody>
      </table>
    </div>
  )
}

export default Recommend