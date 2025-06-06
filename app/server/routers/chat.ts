import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../trpc"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

export const chatRouter = createTRPCRouter({
  sendMessage: protectedProcedure
    .input(
      z.object({
        message: z.string(),
        conversationId: z.string().optional(),
        model: z.enum(["gemini-pro", "gemini-pro-vision"]).default("gemini-pro"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.sub

      // Create or get conversation
      let conversationId = input.conversationId
      if (!conversationId) {
        const { data: conversation } = await supabase
          .from("conversations")
          .insert({
            user_id: userId,
            title: input.message.slice(0, 50) + "...",
          })
          .select()
          .single()

        conversationId = conversation?.id
      }

      // Save user message
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        role: "user",
        content: input.message,
        user_id: userId,
      })

      // Generate AI response
      const model = genAI.getGenerativeModel({ model: input.model })

      let response: string
      let imageUrl: string | null = null

      if (
        input.model === "gemini-pro-vision" ||
        input.message.toLowerCase().includes("image") ||
        input.message.toLowerCase().includes("picture")
      ) {
        // For image generation, we'll use a text-to-image prompt
        const imagePrompt = `Generate an image: ${input.message}`

        try {
          // Note: Gemini doesn't directly generate images, so we'll create a descriptive response
          // In a real implementation, you'd integrate with an image generation API
          const result = await model.generateContent([
            `Create a detailed description for an image based on this request: ${input.message}. 
             Respond with just the description, no additional text.`,
          ])

          response = `I've created a description for your image request: ${result.response.text()}`

          // Placeholder image URL - in production, you'd generate actual images
          imageUrl = `/placeholder.svg?height=300&width=300&text=${encodeURIComponent("Generated Image")}`
        } catch (error) {
          response = "I'm sorry, I couldn't generate an image at the moment. Please try again."
        }
      } else {
        const result = await model.generateContent(input.message)
        response = result.response.text()
      }

      // Save AI response
      const { data: aiMessage } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          role: "assistant",
          content: response,
          image_url: imageUrl,
          user_id: userId,
        })
        .select()
        .single()

      return {
        message: response,
        conversationId,
        messageId: aiMessage?.id,
        imageUrl,
      }
    }),

  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.sub

    const { data: conversations } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    return conversations || []
  }),

  getMessages: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user.sub

      const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", input.conversationId)
        .eq("user_id", userId)
        .order("created_at", { ascending: true })

      return messages || []
    }),

  deleteConversation: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.sub

      await supabase.from("conversations").delete().eq("id", input.conversationId).eq("user_id", userId)

      return { success: true }
    }),
})
