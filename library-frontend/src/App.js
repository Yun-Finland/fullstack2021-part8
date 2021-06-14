
import { useApolloClient, useQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommend from './components/Recommend'
import {  ME } from './queries'

const App = () => {
  const [ page, setPage ] = useState('authors')
  const [ token, setToken ] = useState(null)
  const [ user, setUser ] = useState(null)
  const client = useApolloClient()
  const user_result = useQuery(ME)

  useEffect(()=> {
    const checkToken = window.localStorage.getItem('library-user-token')
    if(checkToken){
      setToken(checkToken)
    }
  }, [])

  useEffect(()=> {
    if(user_result.data){
      setUser(user_result.data.me)
    }
  },[user_result.data])

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  if(!token){
    return (
      <div>
        <div>
          <button onClick={() => setPage('authors')}>authors</button>
          <button onClick={() => setPage('books')}>books</button>
          <button onClick={() => setPage('login')}>login</button>
        </div>

        <Authors
          show={page === 'authors'}
          token = {token}
        />

        <Books
          show={page === 'books'}
        />

        <LoginForm
          show={page === 'login'}
          setToken = {setToken}
        />
      </div>
    )
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={() => setPage('recommend')}>recommend</button>
        <button onClick={logout}>log out</button>          
      </div>

      <Authors
        show={page === 'authors'}
        token = {token}
      />

      <Books
        show={page === 'books'}
      />

      <NewBook
        show={page === 'add'}
      />

      <Recommend
        show = { page === 'recommend'}
        user = { user }
      />

    </div>
  )
}

export default App