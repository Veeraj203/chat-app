'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://YOUR_PROJECT.supabase.co', 'YOUR_PUBLIC_ANON_KEY')

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    fetchMessages()
    const channel = supabase
      .channel('chat-room')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => fetchMessages())
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchMessages() {
    const { data } = await supabase.from('messages').select('*').order('created_at')
    setMessages(data)
  }

  async function sendMessage() {
    if (newMessage.trim() === "") return
    await supabase.from('messages').insert([{ text: newMessage, sender: "you" }])
    setNewMessage("")
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="border p-4 h-96 overflow-y-scroll bg-gray-100 rounded">
      {messages?.map((msg, idx) => (
  <div key={idx} className={msg.sender === "you" ? "text-right" : "text-left"}>
    <p className="my-1 px-2 py-1 inline-block rounded bg-white shadow">
      {msg.text}
    </p>
  </div>
))}
      </div>
      <div className="flex mt-2 gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border p-2 rounded"
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded">
          Send
        </button>
      </div>
    </div>
  )
}
