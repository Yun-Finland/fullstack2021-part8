import { useQuery, useSubscription } from '@apollo/client'
import React, { useState } from 'react'
import { ALL_BOOKS, BOOK_ADDED } from '../queries'

const ButtonFilter = ({ genres, setFilter }) => {
  const newGenres = new Set(genres)
  const returnedGenres = Array.from(newGenres)
  
  return (
    <div>
      {returnedGenres
        .map(genre => 
          <button 
            value={genre}
            onClick={()=>setFilter(genre)}
            key={genre}>{genre}
          </button>
      )}
      <button onClick={()=>setFilter(null)}>all genres</button>
    </div>
  )
}

const Books = (props) => {
  const result = useQuery(ALL_BOOKS)
  const [newFilter, setFilter ] = useState(null)

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: () => {
      result.refetch()
    }
  })

  if (!props.show) {
    return null
  }
  
  const books = result.data.allBooks
  const returnedGenres = books.reduce((newGenres,book) => {
      return newGenres.concat(book.genres)
    }, [])

  const returnedBooks = newFilter 
    ? books.filter(n=> n.genres.includes(newFilter))
    : books
  
  return (
    <div>
      <h2>books</h2>

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
      <ButtonFilter 
        genres={returnedGenres} 
        setFilter={setFilter}
      />
    </div>
  )
}

export default Books