"use client"

import { useState } from "react"
import ChatInterface from "./components/ChatInterface"
import Sidebar from "./components/Sidebar"

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>()

  const handleNewConversation = (id: string) => {
    setCurrentConversationId(id)
  }

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id)
  }

  const handleNewChat = () => {
    setCurrentConversationId(undefined)
  }

  return (
    <div className="d-flex h-100">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
      />

      <div className="flex-grow-1 position-relative">
        <button className="sidebar-toggle btn" onClick={() => setSidebarOpen(true)}>
          ☰
        </button>

        <ChatInterface conversationId={currentConversationId} onNewConversation={handleNewConversation} />
      </div>
    </div>
  )
}
