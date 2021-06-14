import { useMutation } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { LOGIN } from '../queries'

const LoginForm = ({show, setToken, setPage, setMessage}) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [ login, result ] = useMutation(LOGIN, {
    onError: (error) => {
      setMessage({content: error.graphQLErrors[0].message, 
        style: "error"
      })
    }
  })

  useEffect(() => {
    if (result.data){
      const token = result.data.login.value
      setToken(token)
      localStorage.setItem('library-user-token', token)
    }
  }, [result.data]) // eslint-disable-line
  
  const submit = (event) => {
    event.preventDefault()
    
    login({ variables: { username, password }})
    setPage('authors')
    setPassword('')
    setUsername('')
  }

  if(!show){
    return null
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={submit}>
        <div> 
          username
          <input value={username}
            onChange = {({target})=> setUsername(target.value)}
          />
        </div> 
        <div>
          password
          <input value={password}
            onChange = { ({target}) => setPassword(target.value)}
          />
        </div>
        <button type='submit'>login</button>
      </form>
    </div>
  )
}

export default LoginForm