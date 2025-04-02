import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { db } from '../firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import ThemeToggle from '../components/ThemeToggle'
import { useTranslation } from '../hooks/useTranslation'

function Auth() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { t } = useTranslation()

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
        setError(t('noAccountFound'))
        return
      }

      // Store email in localStorage for session management
      localStorage.setItem('userEmail', email)
      
      navigate('/chat')
    } catch (err) {
      setError(t('signInError'))
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
            {t('welcomeBack')}
          </h2>
          <p className="text-subheading">
            {t('signInWithEmail')}
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
              {t('email')}
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
            {loading ? t('signingIn') : t('signIn')}
          </button>

          <p className="text-footer">
            <Link to="/signup" className="text-link">
              {t('noAccountSignUp')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Auth 