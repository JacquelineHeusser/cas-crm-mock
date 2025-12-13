'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Loader2, ExternalLink } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

interface Citation {
  type: 'policy' | 'web' | 'law';
  title: string;
  url: string;
  metadata?: any;
  category?: string;
  lawCode?: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chatbot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: input,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer,
        citations: data.citations,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuche es erneut.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-600 mt-8">
            <p className="text-lg font-light text-[#1A1A1A] mb-2">Willkommen beim Versicherungs-Assistenten!</p>
            <p className="text-sm">Stelle Fragen zu Policen, Versicherungen oder rechtlichen Grundlagen.</p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              <button
                onClick={() => setInput('Was ist eine Cyberversicherung?')}
                className="bg-[#D9E8FC] text-[#0032A0] hover:bg-[#C5D9F0] rounded-lg px-4 py-3 text-left text-sm transition-colors"
              >
                Was ist eine Cyberversicherung?
              </button>
              <button
                onClick={() => setInput('Was ist eine Hausratversicherung?')}
                className="bg-[#D9E8FC] text-[#0032A0] hover:bg-[#C5D9F0] rounded-lg px-4 py-3 text-left text-sm transition-colors"
              >
                Was ist eine Hausratversicherung?
              </button>
              <button
                onClick={() => setInput('Was kannst du mir über meine Police sagen?')}
                className="bg-[#D9E8FC] text-[#0032A0] hover:bg-[#C5D9F0] rounded-lg px-4 py-3 text-left text-sm transition-colors"
              >
                Was kannst du mir über meine Police sagen?
              </button>
              <button
                onClick={() => setInput('Wie kann ich meine Police optimieren?')}
                className="bg-[#D9E8FC] text-[#0032A0] hover:bg-[#C5D9F0] rounded-lg px-4 py-3 text-left text-sm transition-colors"
              >
                Wie kann ich meine Police optimieren?
              </button>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl rounded-lg p-4 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-[#008C95] text-white'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>
                  {msg.content}
                </ReactMarkdown>
              </div>

              {/* Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs font-semibold mb-2 text-gray-700">Quellen:</p>
                  <div className="space-y-1">
                    {msg.citations.map((cite, j) => (
                      <a
                        key={j}
                        href={cite.url}
                        target={cite.type === 'web' || cite.type === 'law' ? '_blank' : undefined}
                        rel={cite.type === 'web' || cite.type === 'law' ? 'noopener noreferrer' : undefined}
                        className="flex items-center gap-2 text-xs hover:underline text-[#0032A0]"
                      >
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        <span className="flex-1">{cite.title}</span>
                        {cite.type === 'web' && cite.category && (
                          <span className="px-2 py-0.5 text-xs bg-[#D9E8FC] text-[#0032A0] rounded-full">{cite.category}</span>
                        )}
                        {cite.type === 'law' && cite.lawCode && (
                          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">{cite.lawCode}</span>
                        )}
                        {cite.type === 'policy' && (
                          <span className="px-2 py-0.5 text-xs bg-[#CADB2D] text-[#0032A0] rounded-full">Police</span>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <Loader2 className="w-5 h-5 animate-spin text-[#008C95]" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Stelle eine Frage zu Policen oder Versicherungen..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008C95] focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-[#008C95] text-white hover:bg-[#006B73] rounded-lg px-6 py-2 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !input.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
