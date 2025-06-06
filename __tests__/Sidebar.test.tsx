import type React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import Sidebar from "../app/components/Sidebar"
import { TRPCProvider } from "../app/providers/trpc-provider"
import { useUser } from "@auth0/nextjs-auth0/client"

jest.mock("@auth0/nextjs-auth0/client")
const mockUseUser = useUser as jest.MockedFunction<typeof useUser>

jest.mock("../app/providers/trpc-provider", () => ({
  TRPCProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  trpc: {
    chat: {
      getConversations: {
        useQuery: () => ({
          data: [
            { id: "1", title: "Test Conversation 1", created_at: "2024-01-01" },
            { id: "2", title: "Test Conversation 2", created_at: "2024-01-02" },
          ],
          refetch: jest.fn(),
        }),
      },
      deleteConversation: {
        useMutation: () => ({
          mutateAsync: jest.fn(),
        }),
      },
    },
  },
}))

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSelectConversation: jest.fn(),
  onNewChat: jest.fn(),
}

const renderWithProviders = (component: React.ReactElement) => {
  return render(<TRPCProvider>{component}</TRPCProvider>)
}

describe("Sidebar", () => {
  beforeEach(() => {
    mockUseUser.mockReturnValue({
      user: {
        sub: "test-user-id",
        name: "Test User",
        email: "test@example.com",
        picture: "https://example.com/avatar.jpg",
      },
      error: undefined,
      isLoading: false,
    })
  })

  it("renders sidebar with user information", () => {
    renderWithProviders(<Sidebar {...defaultProps} />)

    expect(screen.getByText("ChatGPT Clone")).toBeInTheDocument()
    expect(screen.getByText("+ New Chat")).toBeInTheDocument()
    expect(screen.getByText("Test User")).toBeInTheDocument()
    expect(screen.getByText("Sign Out")).toBeInTheDocument()
  })

  it("displays conversation list", () => {
    renderWithProviders(<Sidebar {...defaultProps} />)

    expect(screen.getByText("Recent Conversations")).toBeInTheDocument()
    expect(screen.getByText("Test Conversation 1")).toBeInTheDocument()
    expect(screen.getByText("Test Conversation 2")).toBeInTheDocument()
  })

  it("calls onNewChat when new chat button is clicked", () => {
    const onNewChat = jest.fn()
    renderWithProviders(<Sidebar {...defaultProps} onNewChat={onNewChat} />)

    fireEvent.click(screen.getByText("+ New Chat"))
    expect(onNewChat).toHaveBeenCalled()
  })

  it("calls onSelectConversation when conversation is clicked", () => {
    const onSelectConversation = jest.fn()
    renderWithProviders(<Sidebar {...defaultProps} onSelectConversation={onSelectConversation} />)

    fireEvent.click(screen.getByText("Test Conversation 1"))
    expect(onSelectConversation).toHaveBeenCalledWith("1")
  })

  it("highlights current conversation", () => {
    renderWithProviders(<Sidebar {...defaultProps} currentConversationId="1" />)

    const conversation = screen.getByText("Test Conversation 1").closest(".conversation-item")
    expect(conversation).toHaveClass("bg-primary")
  })
})
