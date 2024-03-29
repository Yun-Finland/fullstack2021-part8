import { useQuery, useSubscription } from '@apollo/client'
import React from 'react'

import { ALL_AUTHORS, BOOK_ADDED } from '../queries'
import SetBirthYear from './SetBirthYear'

const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS)

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: () => {
      result.refetch()
    }
  })

  if (!props.show) {
    return null
  }

  if(result.loading){
    return <div>loading...</div>
  }
  
  const authors = result.data.allAuthors

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
      {props.token ? <SetBirthYear authors={authors} /> :null}
    </div>
  )
}

export default Authors
