import { useState, useEffect } from 'react'
import { supabase, getCurrentUser, User } from '../lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log('🔍 Getting initial session...');
      // Check for mock user first (for demo purposes)
      const mockUser = localStorage.getItem('mockUser');
      console.log('👤 Mock user from localStorage:', mockUser);
      if (mockUser) {
        const parsedUser = JSON.parse(mockUser);
        console.log('✅ Setting mock user:', parsedUser);
        setUser(parsedUser);
        setLoading(false);
        return;
      }

      console.log('🔐 Checking Supabase session...');
      const result = await getCurrentUser()
      setUser(result?.user || null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    let subscription: any = null;
    
    if (supabase) {
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            const result = await getCurrentUser()
            setUser(result?.user || null)
          } else {
            // Clear mock user on logout
            localStorage.removeItem('mockUser');
            setUser(null)
          }
          setLoading(false)
        }
      )
      subscription = authSubscription;
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  return { user, loading }
}