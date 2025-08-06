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
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [name] = useState("Me"); // Change this to her name on her device
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel("chat-room")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        payload => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .order("id");

    setMessages(data as Message[]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    await supabase.from("messages").insert([{ sender: name, content: newMessage }]);
    setNewMessage("");
    setIsTyping(false);
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#ece5dd]">
      {/* Header */}
      <div className="bg-[#075e54] text-white py-4 px-6 text-xl font-bold shadow flex items-center gap-3">
        <img src="https://i.pravatar.cc/40?img=47" className="w-10 h-10 rounded-full" alt="Her" />
        Chat with Her ❤️
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === name ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`relative max-w-xs px-4 py-2 rounded-lg shadow text-sm ${
                msg.sender === name
                  ? "bg-[#dcf8c6] text-black rounded-br-none"
                  : "bg-white text-black rounded-bl-none"
              }`}
            >
              {msg.sender !== name && (
                <div className="flex items-center gap-2 mb-1">
                  <img
                    src="https://i.pravatar.cc/20?img=47"
                    className="w-5 h-5 rounded-full"
                    alt="Her"
                  />
                  <span className="font-semibold text-[11px] text-green-700">
                    {msg.sender}
                  </span>
                </div>
              )}
              <div>{msg.content}</div>
              <div className="text-[10px] text-gray-500 text-right mt-1">
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
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

      {/* Input Area */}
      <div className="flex items-center p-3 bg-[#f0f0f0]">
        <input
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            setIsTyping(true);
          }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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
    </main>
  );
}