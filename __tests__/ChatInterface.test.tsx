import type React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { useUser } from "@auth0/nextjs-auth0/client"
import ChatInterface from "../app/components/ChatInterface"
import { TRPCProvider } from "../app/providers/trpc-provider"

// Mock Auth0
jest.mock("@auth0/nextjs-auth0/client")
const mockUseUser = useUser as jest.MockedFunction<typeof useUser>

// Mock tRPC
jest.mock("../app/providers/trpc-provider", () => ({
  TRPCProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  trpc: {
    chat: {
      sendMessage: {
        useMutation: () => ({
          mutateAsync: jest.fn().mockResolvedValue({
            message: "Test response",
            conversationId: "test-id",
            messageId: "msg-id",
          }),
        }),
      },
      getMessages: {
        useQuery: () => ({ data: [] }),
      },
    },
  },
}))

const renderWithProviders = (component: React.ReactElement) => {
  return render(<TRPCProvider>{component}</TRPCProvider>)
}

describe("ChatInterface", () => {
  beforeEach(() => {
    mockUseUser.mockReturnValue({
      user: {
        sub: "test-user-id",
        name: "Test User",
        email: "test@example.com",
      },
      error: undefined,
      isLoading: false,
    })
  })

  it("renders chat interface for authenticated user", () => {
    renderWithProviders(<ChatInterface />)

    expect(screen.getByPlaceholderText("Type your message...")).toBeInTheDocument()
    expect(screen.getByText("Send")).toBeInTheDocument()
    expect(screen.getByText("How can I help you today?")).toBeInTheDocument()
  })

  it("shows sign in prompt for unauthenticated user", () => {
    mockUseUser.mockReturnValue({
      user: undefined,
      error: undefined,
      isLoading: false,
    })

    renderWithProviders(<ChatInterface />)

    expect(screen.getByText("Welcome to ChatGPT Clone")).toBeInTheDocument()
    expect(screen.getByText("Please sign in to start chatting")).toBeInTheDocument()
    expect(screen.getByText("Sign In")).toBeInTheDocument()
  })

  it("allows user to type and submit messages", async () => {
    renderWithProviders(<ChatInterface />)

    const input = screen.getByPlaceholderText("Type your message...")
    const sendButton = screen.getByText("Send")

    fireEvent.change(input, { target: { value: "Hello, AI!" } })
    expect(input).toHaveValue("Hello, AI!")

    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText("You")).toBeInTheDocument()
      expect(screen.getByText("Hello, AI!")).toBeInTheDocument()
    })
  })

  it("disables send button when input is empty", () => {
    renderWithProviders(<ChatInterface />)

    const sendButton = screen.getByText("Send")
    expect(sendButton).toBeDisabled()
  })

  it("shows model selector with correct options", () => {
    renderWithProviders(<ChatInterface />)

    const modelSelect = screen.getByDisplayValue("Gemini Pro (Text)")
    expect(modelSelect).toBeInTheDocument()

    fireEvent.click(modelSelect)
    expect(screen.getByText("Gemini Pro Vision (Images)")).toBeInTheDocument()
  })
})
