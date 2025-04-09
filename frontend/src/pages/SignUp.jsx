import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { db } from '../firebase'
import { collection, query, where, getDocs, serverTimestamp, doc, setDoc } from 'firebase/firestore'
import { auth } from '../firebase'
import ThemeToggle from '../components/ThemeToggle'
import { useTranslation } from '../hooks/useTranslation'

function SignUp() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [error, setError] = useState(null)
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!name || !email) {
      setError(t('nameEmailRequired'))
      setIsLoading(false)
      return
    }

    try {
      // Check if email already exists
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('email', '==', email))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        setError(t('emailExists'))
        setIsLoading(false)
        return
      }

      // Create user document with a temporary ID
      const userData = {
        name,
        email,
        company,
        createdAt: serverTimestamp()
      }

      // Generate a temporary ID for the user
      const tempUserId = `temp_${Date.now()}`
      
      // Store the user data
      await setDoc(doc(db, 'users', tempUserId), userData)
      
      // Store user info in localStorage for session management
      localStorage.setItem('userEmail', email)
      localStorage.setItem('userName', name)
      
      // Navigate to chat
      navigate('/chat')
    } catch (error) {
      console.error('Error during signup:', error)
      setError(t('signupError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="gradient-background">
      <ThemeToggle />
      <div className="glass-panel">
        <div className="text-center">
          <h1 className="text-heading">{t('createProfile')}</h1>
          <p className="text-subheading">{t('fillDetailsToStart')}</p>
        </div>

        <form onSubmit={handleSubmit} className="form-group">
          <div className="form-field">
            <label htmlFor="name" className="text-label">{t('name')}</label>
            <input
              type="text"
              id="name"
              className="form-input"
              placeholder={t('namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="email" className="text-label">{t('email')}</label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="company" className="text-label">{t('companyOptional')}</label>
            <input
              type="text"
              id="company"
              className="form-input"
              placeholder={t('companyPlaceholder')}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          {error && <div className="text-error">{error}</div>}

          <button type="submit" className="gradient-button" disabled={isLoading}>
            {t('createProfile')}
          </button>

          <div className="text-footer">
             <Link to="/" className="text-link">{t('haveAccountSignIn')}</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SignUp 