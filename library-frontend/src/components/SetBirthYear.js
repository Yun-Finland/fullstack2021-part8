import { useMutation } from '@apollo/client'
import React, { useState } from 'react'

import { ALL_AUTHORS, UPDATE_BIRTH } from '../queries'

const SetBirthYear = ({ authors }) => {
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
          <select value={name} onChange={({target})=>setName(target.value)}>
            {authors.map(n => <option key={n.name} label={n.name} value={n.name}>{n.name}</option>)}
          </select>
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

export default SetBirthYear
