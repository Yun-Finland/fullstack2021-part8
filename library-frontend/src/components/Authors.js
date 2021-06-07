  
import { useMutation, useQuery } from '@apollo/client'
import React, { useState } from 'react'

import { ALL_AUTHORS, UPDATE_BIRTH } from '../queries'

const SetBirthYear = () => {
  const [name, setName] = useState('')
  const [setBornTo, setBornYear ] = useState('')

  const [update_birthyear] = useMutation(UPDATE_BIRTH, {
    refetchQueries: [{query: ALL_AUTHORS}]
  })

  const updateBirthYear = (event) => {
    event.preventDefault();
    update_birthyear({variables: { name, setBornTo } })
    setName('')
    setBornYear('')
  }

  return (
    <div>
      <h2>Set birthyear</h2>
      <form onSubmit={ updateBirthYear }>
        <div>
          name
          <input 
            value={name} 
            onChange ={({target})=> setName(target.value)}
          />
        </div>
        <div>
          born
          <input 
            type="number" 
            value={setBornTo} 
            onChange ={({target})=> setBornYear(parseInt(target.value))} 
          />
        </div>       
        <button type="submit">update author</button>
      </form>
    </div>
  )
}

const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS)

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
      <SetBirthYear />
    </div>
  )
}

export default Authors
