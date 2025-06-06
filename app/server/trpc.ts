import { initTRPC, TRPCError } from "@trpc/server"
import type { NextRequest } from "next/server"
import { getSession } from "@auth0/nextjs-auth0"
import superjson from "superjson"

interface CreateContextOptions {
  req: NextRequest
}

export const createTRPCContext = async (opts: CreateContextOptions) => {
  const session = await getSession()

  return {
    session,
    req: opts.req,
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})
