'use client'

import { useState, useRef, useEffect } from 'react'

const PHASES = [
  { id: 1, label: 'Ce que tu sais faire', icon: '💡', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 2, label: 'Ce que tu aimes', icon: '❤️', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { id: 3, label: 'Ce dont on a besoin', icon: '🌍', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  { id: 4, label: 'Ce pour quoi on paie', icon: '💰', color: 'bg-amber-100 text-amber-700 border-amber-200' },
]

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function Home() {
  const [currentPhase, setCurrentPhase] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [phaseHistories, setPhaseHistories] = useState<Message[][]>([[], [], [], []])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSynthesis, setShowSynthesis] = useState(false)
  const [done, setDone] = useState(false)
  const [started, setStarted] = useState(false)
  const [email, setEmail] = useState('')
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const callAPI = async (msgs: Message[], phase: number, isSynthesis = false, allHistory: Message[] = []) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: msgs, phase, isSynthesis, allHistory })
    })
    const data = await response.json()
    if (data.error) throw new Error(data.error)
    return data.content as string
  }

  const startPhase = async (phaseIndex: number, currentMessages: Message[] = []) => {
    setIsLoading(true)
    try {
      const reply = await callAPI([{ role: 'user', content: 'Commence la session.' }], phaseIndex)
      const newMsg: Message = { role: 'assistant', content: reply }
      setMessages([...currentMessages, newMsg])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erreur de connexion. Réessaie.' }])
    }
    setIsLoading(false)
  }

  const handleStart = async () => {
    if (!emailSubmitted && !email) return
    setStarted(true)
    await startPhase(0)
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return
    const userMsg: Message = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const reply = await callAPI(newMessages, currentPhase)
      const assistantMsg: Message = { role: 'assistant', content: reply }
      const updatedMessages = [...newMessages, assistantMsg]
      setMessages(updatedMessages)

      if (reply.includes('complète ✓') || reply.includes('complete ✓')) {
        const newHistories = [...phaseHistories]
        newHistories[currentPhase] = updatedMessages
        setPhaseHistories(newHistories)

        const nextPhase = currentPhase + 1
        if (nextPhase < PHASES.length) {
          setTimeout(async () => {
            const transitionMsg: Message = {
              role: 'assistant',
              content: `---\n✨ Passons à la dimension suivante : **${PHASES[nextPhase].label}**`
            }
            setCurrentPhase(nextPhase)
            const msgs = [...updatedMessages, transitionMsg]
            setMessages(msgs)
            await startPhase(nextPhase, msgs)
          }, 800)
        } else {
          setDone(true)
          setShowSynthesis(true)
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: '🎉 Tu as exploré les 4 dimensions de ton Ikigaï ! Clique sur le bouton ci-dessous pour générer ta synthèse personnalisée.'
          }])
        }
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erreur. Réessaie.' }])
    }
    setIsLoading(false)
  }

  const generateSynthesis = async () => {
    setShowSynthesis(false)
    setIsLoading(true)
const allHistory = phaseHistories.flat().filter(m => m.content !== 'Commence la session.' && m.content.trim() !== '')
const historyToSend = allHistory.length > 0 ? allHistory : messages.filter(m => m.content.trim() !== '')    try {
const synthesis = await callAPI([], 0, true, historyToSend)      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `✨ **TA SYNTHÈSE IKIGAÏ**\n\n${synthesis}`
      }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erreur lors de la synthèse.' }])
    }
    setIsLoading(false)
  }

  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🌸</div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">Trouve ton Ikigaï</h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              Un coach IA qui t'aide à trouver ta niche en explorant les 4 cercles de l'Ikigaï.<br/>
              Idéal si tu es multipassionné·e ou que tu cherches ta direction.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {PHASES.map(p => (
              <div key={p.id} className={`border rounded-xl p-3 text-center text-sm ${p.color}`}>
                <div className="text-xl mb-1">{p.icon}</div>
                <div className="font-medium text-xs">{p.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-600 mb-4 text-center">Entre ton email pour recevoir ta synthèse</p>
            <input
              type="email"
              placeholder="ton@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none focus:border-purple-400"
            />
            <button
              onClick={handleStart}
              disabled={!email}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl py-3 text-sm font-medium transition-colors"
            >
              Commencer mon Ikigaï →
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">Pas de spam. Juste ta synthèse.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🌸</span>
            <span className="font-medium text-gray-700 text-sm">Mon Ikigaï IA</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {PHASES.map((p, i) => (
              <div
                key={p.id}
                className={`text-center py-2 px-1 rounded-lg border text-xs transition-all ${
                  i === currentPhase && !done
                    ? p.color + ' font-medium'
                    : i < currentPhase || done
                    ? 'bg-green-50 text-green-600 border-green-200'
                    : 'bg-gray-50 text-gray-400 border-gray-100'
                }`}
              >
                <div className="text-base mb-0.5">{i < currentPhase || done ? '✓' : p.icon}</div>
                <div className="leading-tight hidden sm:block">{p.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto chat-container px-4 py-6"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                  🌸
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-100 shadow-sm'
                }`}
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
              />
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start gap-2">
              <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-sm flex-shrink-0">🌸</div>
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showSynthesis && (
        <div className="max-w-2xl mx-auto w-full px-4 pb-2">
          <button
            onClick={generateSynthesis}
            className="w-full bg-gradient-to-r from-purple-600 to-teal-600 text-white rounded-xl py-3 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            ✨ Générer ma synthèse Ikigaï personnalisée
          </button>
        </div>
      )}

      {!done && (
        <div className="bg-white border-t border-gray-100 px-4 py-3">
          <div className="max-w-2xl mx-auto flex gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder="Tape ta réponse..."
              rows={2}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-purple-400"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 text-white rounded-xl px-4 text-sm font-medium transition-colors flex items-center gap-1"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
