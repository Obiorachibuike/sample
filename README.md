
# ChatGPT Mobile Clone

A mobile-first ChatGPT clone built with Next.js, tRPC, Bootstrap, Supabase, Auth0, and Google's Gemini AI.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Testing](#testing)
- [Deployment](#deployment)
  - [Vercel (Recommended)](#vercel-recommended)
  - [Render](#render)
- [API Endpoints](#api-endpoints)
- [AI Models](#ai-models)
- [Mobile Features](#mobile-features)
- [Contributing](#contributing)
- [License](#license)

## Features

- 📱 Mobile-first responsive design
- 🔐 Authentication with Auth0
- 💾 Persistent chat history with Supabase
- 🤖 AI responses using Google Gemini Pro
- 🖼️ Image generation capabilities
- 💬 Real-time chat interface
- 📂 Conversation management
- 🎨 Bootstrap UI components
- 🧪 Comprehensive test coverage

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **API**: tRPC with TanStack React Query
- **UI**: Bootstrap 5
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Auth0
- **AI Models**: Google Gemini Pro & Gemini Pro Vision
- **Testing**: Jest & React Testing Library
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Auth0 account
- Supabase account
- Google AI API key

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd chatgpt-mobile-clone
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your API keys and configuration values.

4. Set up Supabase database:
   - Run the SQL script in `scripts/001-create-tables.sql` in your Supabase SQL editor
   - This creates the necessary tables and RLS policies

5. Configure Auth0:
   - Create a new Auth0 application
   - Set the callback URLs to include your domain
   - Configure the allowed origins

6. Run the development server:
   ```bash
   pnpm dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Testing

Run the test suite:
```bash
pnpm test
```

Run tests in watch mode:
```bash
pnpm test:watch
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `pnpm build`
4. Set start command: `pnpm start`
5. Add environment variables
6. Deploy

## API Endpoints

- `POST /api/trpc/chat.sendMessage` - Send a message to AI
- `GET /api/trpc/chat.getConversations` - Get user's conversations
- `GET /api/trpc/chat.getMessages` - Get messages for a conversation
- `DELETE /api/trpc/chat.deleteConversation` - Delete a conversation

## AI Models

The application uses two Google Gemini models:

1. **Gemini Pro**: For text-based conversations
2. **Gemini Pro Vision**: For image-related requests and descriptions

## Mobile Features

- Touch-optimized interface
- Responsive design (mobile-first)
- Swipe gestures for sidebar
- Optimized for iOS and Android browsers
- PWA-ready (can be added to home screen)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

MIT License - see LICENSE file for details
```

This Markdown file includes a clickable table of contents that links to the respective sections within the document.