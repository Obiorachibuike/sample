import { createTRPCRouter } from "../trpc"
import { chatRouter } from "./chat"

export const appRouter = createTRPCRouter({
  chat: chatRouter,
})

export type AppRouter = typeof appRouter
