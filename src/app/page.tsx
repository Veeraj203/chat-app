'use client'

import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'


type Message = {
  id: number;
  content: string;
  sender: string;
  created_at: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMessages((prev) => [...prev, payload.new as Message]);
        } else if (payload.eventType === 'DELETE') {
          setMessages((prev) => prev.filter((m) => m.id !== (payload.old as Message).id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && data) {
      setMessages(data);
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !name.trim()) return;

    const { error } = await supabase.from('messages').insert({
      sender: name.trim(),
      content: newMessage.trim(),
    });

    if (!error) {
      setNewMessage('');
    }
  };

  const deleteMessage = async (id: number) => {
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) {
      console.error('Error deleting message:', error.message);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {!name ? (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <h1 className="text-xl font-bold">Enter your name to chat</h1>
          <input
            type="text"
            className="p-2 border rounded"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      ) : (
        <>
          <header className="bg-green-600 text-white p-4 shadow text-center text-lg font-semibold">
            HerChat with Her ❤️
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <p>Loading...</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === name ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`relative max-w-xs px-4 py-2 rounded-lg shadow text-sm ${
                      msg.sender === name
                        ? 'bg-[#dcf8c6] text-black rounded-br-none'
                        : 'bg-white text-black rounded-bl-none'
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

                    <div className="group flex items-center justify-between gap-2">
                      <div className="break-words max-w-[85%]">{msg.content}</div>
                      {msg.sender === name && (
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          className="text-red-400 text-xs hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                          title="Delete message"
                        >
                          🗑️
                        </button>
                      )}
                    </div>

                    <div className="text-[10px] text-gray-500 text-right mt-1">
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-white flex items-center gap-2 shadow-md">
            <input
              type="text"
              placeholder="Type a message"
              className="flex-1 px-4 py-2 border rounded-full"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full"
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}