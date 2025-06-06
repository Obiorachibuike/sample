"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { trpc } from "../providers/trpc-provider"
import { useUser } from "@auth0/nextjs-auth0"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  image_url?: string | null
  created_at: string
}

interface ChatInterfaceProps {
  conversationId?: string
  onNewConversation?: (id: string) => void
}

export default function ChatInterface({ conversationId, onNewConversation }: ChatInterfaceProps) {
  const { user } = useUser()
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState<"gemini-pro" | "gemini-pro-vision">("gemini-pro")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const sendMessageMutation = trpc.chat.sendMessage.useMutation()
  const { data: conversationMessages } = trpc.chat.getMessages.useQuery(
    { conversationId: conversationId! },
    { enabled: !!conversationId },
  )

  useEffect(() => {
    if (conversationMessages) {
      setMessages(conversationMessages)
    }
  }, [conversationMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setMessage("")
    setIsLoading(true)

    try {
      const response = await sendMessageMutation.mutateAsync({
        message: message,
        conversationId,
        model: selectedModel,
      })

      const aiMessage: Message = {
        id: response.messageId || Date.now().toString(),
        role: "assistant",
        content: response.message,
        image_url: response.imageUrl,
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, aiMessage])

      if (!conversationId && response.conversationId) {
        onNewConversation?.(response.conversationId)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <div className="text-center">
          <h3 className="mb-3">Welcome to ChatGPT Clone</h3>
          <p className="mb-3">Please sign in to start chatting</p>
          <a href="/api/auth/login" className="btn btn-primary">
            Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="text-center mt-5">
            <h4 className="mb-3">How can I help you today?</h4>
            <p className="text-muted">Start a conversation by typing a message below.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <div className="mb-2">
              <strong>{msg.role === "user" ? "You" : "AI Assistant"}</strong>
            </div>
            <div>{msg.content}</div>
            {msg.image_url && (
              <img
                src={msg.image_url || "/placeholder.svg"}
                alt="Generated content"
                className="image-message img-fluid mt-2"
              />
            )}
          </div>
        ))}

        {isLoading && (
          <div className="typing-indicator">
            <span>AI is thinking</span>
            <div className="typing-dots">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <select
              className="form-select model-selector"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as "gemini-pro" | "gemini-pro-vision")}
            >
              <option value="gemini-pro">Gemini Pro (Text)</option>
              <option value="gemini-pro-vision">Gemini Pro Vision (Images)</option>
            </select>
          </div>

          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
              style={{
                backgroundColor: "#40414f",
                border: "1px solid #565869",
                color: "white",
              }}
            />
            <button className="btn btn-primary" type="submit" disabled={isLoading || !message.trim()}>
              {isLoading ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                "Send"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
