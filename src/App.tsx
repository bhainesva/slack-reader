import React, { useEffect, useState } from 'react';
import './App.css';
import "./Message.css"

interface Message {
  text: string
  user: string
  replyCount: number
  ts: string
}

interface UserMap {
  [key: string]: string
}

function MessageBlock(props: {message: Message, users: UserMap, onReplyClick: (ts: string) => void}) {
  const { message, users, onReplyClick } = props;

  function userReplacer(match: string, p1: string) {
    return `@${users[p1]}`;
  }

  const userRegex = /<@([A-Z0-9]+)>/;
  const text = message.text.replace(userRegex, userReplacer)
  const time = new Date(Number(message.ts) * 1000);

  return (
    <div className="Message">
      <div className="Message-text">
        {message.user}: {text}
      </div>
      { message.replyCount !== 0 && <button className="Message-replyCount" onClick={() => onReplyClick(message.ts)}>{message.replyCount}</button>}
      {<div className="Message-time">{time.toLocaleString("en-US")}</div>}
    </div>
  )
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState({})
  const [replies, setReplies] = useState<Message[]>([])
  const reverseMessages = [...messages].reverse()

  useEffect(() => {
    fetch("http://localhost:8080/messages")
      .then(r => r.json())
      .then(data => setMessages(data || []))
      .catch(console.log)
  }, [setMessages])

  useEffect(() => {
    fetch("http://localhost:8080/users")
      .then(r => r.json())
      .then(data => setUsers(data || {}))
      .catch(console.log)
  }, [setUsers])

  const loadNewer = () => {
    fetch("http://localhost:8080/new")
      .then(r => r.json())
      .then(data => {
        setMessages([...(data || []), ...messages])
      })
      .catch(console.log)
  }

  const loadOlder = () => {
    fetch("http://localhost:8080/old")
      .then(r => r.json())
      .then(data => {
        setMessages([...messages, ...(data || [])])
      })
      .catch(console.log)
  }

  const clearReplies = () => setReplies([]);

  const loadReplies = (ts: string) => fetch(`http://localhost:8080/replies?ts=${ts}`)
      .then(r => r.json())
      .then(data => {
        setReplies(data || [])
      })
      .catch(console.log)

  return (
    <div className="App">
      <div> Messages </div>
      <button onClick={loadOlder}>Load Older</button>
      {MessageList(reverseMessages, users, loadReplies)}
      {replies.length !== 0 && (
        <div className="Modal">
          <button onClick={clearReplies}>Close</button>
          {MessageList(replies, users, () => [])}
        </div>
      )}
      <button onClick={loadNewer}>Load Newer</button>
    </div>
  );
}

function MessageList(messages: Message[], users: UserMap, loadReplies: (ts: string) => void) {
  return (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      {messages.map(m => <MessageBlock onReplyClick={loadReplies} key={m.ts} message={m} users={users}/>)}
    </div>
  )
}

export default App;
