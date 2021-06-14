import React,{useEffect} from 'react'
import { useLazyQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'

const Recommend = ({ show, user })=> {

  const [getBooks, result] = useLazyQuery(ALL_BOOKS)

  useEffect(()=>{
    if(user){
      getBooks({variables: {genre: user.favoriteGenre}})
    }
  }, [user, getBooks])
  
  if(!show || !user){
    return null
  }

  const books = result.data.allBooks
  
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
          {books
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