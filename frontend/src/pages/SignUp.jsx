import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { db } from '../firebase'
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'

function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('Checking if email exists:', formData.email)
      // Check if email already exists
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where("email", "==", formData.email))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        setError('This email is already registered. Please sign in instead.')
        setLoading(false)
        return
      }

      console.log('Creating new user document...')
      // Add new user to Firestore
      const userData = {
        name: formData.name,
        email: formData.email,
        company: formData.company || null,
        createdAt: new Date().toISOString()
      }
      console.log('User data to be stored:', userData)

      const docRef = await addDoc(collection(db, 'users'), userData)
      console.log('Document written with ID:', docRef.id)

      // Store email in localStorage for session management
      localStorage.setItem('userEmail', formData.email)
      console.log('User email stored in localStorage')
      
      navigate('/chat')
    } catch (err) {
      console.error('Detailed error during sign up:', {
        message: err.message,
        code: err.code,
        stack: err.stack
      })
      setError(`Error creating account: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="gradient-background">
      <div className="glass-panel">
        <div className="text-center">
          <h2 className="text-heading">
            Create account
          </h2>
          <p className="text-subheading">
            Fill in your details to get started
          </p>
        </div>

        {error && (
          <div className="text-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-group">
          <div>
            <label htmlFor="name" className="text-label">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="form-input"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="email" className="text-label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="form-input"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="company" className="text-label">
              Company <span className="text-white/50">(optional)</span>
            </label>
            <input
              id="company"
              name="company"
              type="text"
              className="form-input"
              placeholder="Your company name"
              value={formData.company}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="gradient-button mt-6"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="text-footer">
            Already have an account?{' '}
            <Link to="/" className="text-link">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default SignUp 