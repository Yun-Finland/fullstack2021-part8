import React from 'react'

const Notification =({ message, setMessage }) => {
  if(message.content === null){
    return null
  }

  setTimeout(() => {
    setMessage({ content: null, style: null })
  },5000)

  return (
    <div className = {message.style} >
      {message.content}
    </div>
  )
}

export default Notification