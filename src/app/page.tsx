'use client'

import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'


type Message = {
  id: number
  sender: string
  content: string
  created_at: string
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [name, setName] = useState("Me") // Change this to her name on her system
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    fetchMessages()

    const channel = supabase
      .channel('chat-room')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        payload => {
          setMessages(prev => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchMessages() {
    const { data } = await supabase.from("messages").select("*").order("id")
    setMessages(data as Message[])
  }

  async function sendMessage() {
    if (!newMessage.trim()) return
    await supabase.from("messages").insert([{ name, text: newMessage }])
    setNewMessage("")
    setIsTyping(false)
  }

  return (
    <div className="flex flex-col h-screen bg-[#ece5dd]">
      <div className="bg-[#075e54] text-white py-4 px-6 text-xl font-bold shadow flex items-center gap-3">
        <img src="https://i.pravatar.cc/40?img=47" className="w-10 h-10 rounded-full" alt="Her" />
        Chat with Her ❤️
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.name === name ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`relative max-w-xs px-4 py-2 rounded-lg shadow text-sm
              ${msg.name === name
                ? 'bg-[#dcf8c6] text-black rounded-br-none'
                : 'bg-white text-black rounded-bl-none'}
            `}>
              {msg.name !== name && (
                <div className="flex items-center gap-2 mb-1">
                  <img src="https://i.pravatar.cc/20?img=47" className="w-5 h-5 rounded-full" alt="Her" />
                  <span className="font-semibold text-[11px] text-green-700">{msg.name}</span>
                </div>
              )}
              <div>{msg.text}</div>
              <div className="text-[10px] text-gray-500 text-right mt-1">
                {new Date(msg.inserted_at || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-xs px-4 py-2 rounded-lg shadow text-sm bg-white text-black rounded-bl-none">
              <div className="italic text-gray-500">Typing...</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center p-3 bg-[#f0f0f0]">
        <input
          value={newMessage}
          onChange={e => {
            setNewMessage(e.target.value)
            setIsTyping(true)
          }}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message"
          className="flex-1 p-2 rounded-full border border-gray-300 mr-2"
        />
        <button
          onClick={sendMessage}
          className="bg-[#075e54] text-white px-4 py-2 rounded-full font-semibold"
        >
          Send
        </button>
      </div>
    </div>
  )
}
