// pages/api/auth/[auth0].js
import { handleAuth, handleLogin } from '@auth0/nextjs-auth0'
import { supabaseClient } from '../../../lib/supabaseClient'

export default handleAuth({
  async login(req, res) {
    try {
      await handleLogin(req, res, {
        async afterCallback(req, res, session, state) {
          // Sync user to Supabase
          const { error } = await supabaseClient
            .from('profiles')
            .upsert({
              auth0_id: session.user.sub,
              email: session.user.email,
              name: session.user.name
            }, { onConflict: 'auth0_id' })
          
          if (error) console.error('Supabase sync error:', error)
          
          return session
        }
      })
    } catch (error) {
      res.status(error.status || 500).end(error.message)
    }
  }
})