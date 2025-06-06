"use client"

import type React from "react"
import { trpc } from "../providers/trpc-provider"
import { useUser } from "@auth0/nextjs-auth0/client"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  currentConversationId?: string
  onSelectConversation: (id: string) => void
  onNewChat: () => void
}

export default function Sidebar({
  isOpen,
  onClose,
  currentConversationId,
  onSelectConversation,
  onNewChat,
}: SidebarProps) {
  const { user } = useUser()
  const { data: conversations, refetch } = trpc.chat.getConversations.useQuery()
  const deleteConversationMutation = trpc.chat.deleteConversation.useMutation()

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this conversation?")) {
      await deleteConversationMutation.mutateAsync({ conversationId })
      refetch()
      if (currentConversationId === conversationId) {
        onNewChat()
      }
    }
  }

  const handleNewChat = () => {
    onNewChat()
    onClose()
  }

  const handleSelectConversation = (id: string) => {
    onSelectConversation(id)
    onClose()
  }

  return (
    <>
      {isOpen && <div className="sidebar-overlay d-md-none" onClick={onClose} />}

      <div className={`sidebar ${isOpen ? "show" : ""}`}>
        <div className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">ChatGPT Clone</h5>
            <button className="btn btn-sm btn-outline-light d-md-none" onClick={onClose}>
              ×
            </button>
          </div>

          <button className="btn btn-primary w-100 mb-3" onClick={handleNewChat}>
            + New Chat
          </button>

          {user && (
            <div className="mb-3 p-2 bg-dark rounded">
              <div className="d-flex align-items-center">
                <img
                  src={user.picture || "/placeholder.svg?height=32&width=32"}
                  alt="Profile"
                  className="rounded-circle me-2"
                  width="32"
                  height="32"
                />
                <div className="flex-grow-1 text-truncate">
                  <small className="text-light">{user.name}</small>
                </div>
              </div>
            </div>
          )}

          <div className="conversation-list">
            <h6 className="text-muted mb-2">Recent Conversations</h6>
            {conversations?.map((conversation) => (
              <div
                key={conversation.id}
                className={`conversation-item p-2 mb-1 rounded cursor-pointer ${
                  currentConversationId === conversation.id ? "bg-primary" : "bg-dark"
                }`}
                onClick={() => handleSelectConversation(conversation.id)}
                style={{ cursor: "pointer" }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div className="flex-grow-1 text-truncate">
                    <small>{conversation.title}</small>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-danger ms-2"
                    onClick={(e) => handleDeleteConversation(conversation.id, e)}
                    style={{ fontSize: "0.7rem", padding: "0.1rem 0.3rem" }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-3">
            <a href="/api/auth/logout" className="btn btn-outline-light w-100">
              Sign Out
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
