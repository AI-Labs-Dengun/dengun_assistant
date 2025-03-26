import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { db } from '../firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import ThemeToggle from '../components/ThemeToggle'

function Auth() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Check if user exists in Firestore
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where("email", "==", email))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        setError('No account found with this email. Please sign up first.')
        return
      }

      // Store email in localStorage for session management
      localStorage.setItem('userEmail', email)
      
      navigate('/chat')
    } catch (err) {
      setError('Error signing in. Please try again.')
      console.error('Error during sign in:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="gradient-background">
      <ThemeToggle />
      <div className="glass-panel">
        <div className="text-center">
          <h2 className="text-heading">
            Welcome back
          </h2>
          <p className="text-subheading">
            Sign in with your email
          </p>
        </div>
        
        {error && (
          <div className="text-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-group">
          <div className="form-field">
            <label htmlFor="email" className="text-label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="form-input"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="gradient-button"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-footer">
            <Link to="/signup" className="text-link">
            Don't have an account?{' '}Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Auth 