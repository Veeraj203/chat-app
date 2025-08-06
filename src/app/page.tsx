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

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      setMessages(data);
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() === "") return;

    const { error } = await supabase.from("messages").insert([
      {
        content: newMessage,
      },
    ]);

    if (error) {
      console.error("Error sending message:", error);
    } else {
      setNewMessage("");
    }
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel("chat-room")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    // ✅ Sync cleanup function (no async/await here)
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-gray-100">
      <div className="w-full max-w-md mx-auto bg-white rounded shadow p-4 space-y-4">
        <h1 className="text-2xl font-bold text-center">Private Chat</h1>

        <div className="overflow-y-auto h-96 border p-2 rounded">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="border-b py-1 text-gray-800 text-sm"
            >
              {msg.content}
            </div>
          ))}
        </div>

        <div className="flex space-x-2">
          <input
            className="flex-1 border rounded px-2 py-1"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="Type your message..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 py-1 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}