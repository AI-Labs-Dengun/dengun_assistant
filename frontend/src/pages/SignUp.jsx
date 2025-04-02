import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { db, storage } from '../firebase'
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import ThemeToggle from '../components/ThemeToggle'
import PhotoUpload from '../components/PhotoUpload'
import { useTranslation } from '../hooks/useTranslation'

function SignUp() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [error, setError] = useState('')
  const [photo, setPhoto] = useState(null)
  const [photoUrl, setPhotoUrl] = useState(null)
  const { t } = useTranslation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name || !email) {
      setError(t('nameEmailRequired'))
      return
    }

    try {
      // Check if email already exists
      const q = query(collection(db, "users"), where("email", "==", email))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        setError(t('emailAlreadyExists'))
        return
      }

      let profilePhotoUrl = null;
      
      // Upload photo if one was selected
      if (photo) {
        const storageRef = ref(storage, `profile-photos/${email}/${Date.now()}-${photo.name}`)
        await uploadBytes(storageRef, photo)
        profilePhotoUrl = await getDownloadURL(storageRef)
      }

      // Create new user
      await addDoc(collection(db, "users"), {
        name,
        email,
        company,
        photoUrl: profilePhotoUrl,
        createdAt: new Date().toISOString()
      })

      navigate('/')
    } catch (err) {
      setError(t('accountCreationError') + ': ' + err.message)
    }
  }

  const handlePhotoSelect = (file, previewUrl) => {
    setPhoto(file)
    setPhotoUrl(previewUrl)
  }

  return (
    <div className="gradient-background">
      <ThemeToggle />
      <div className="glass-panel">
        <div className="text-center">
          <h1 className="text-heading">{t('createProfile')}</h1>
          <p className="text-subheading">{t('fillDetailsToStart')}</p>
        </div>

        <PhotoUpload onPhotoSelect={handlePhotoSelect} />

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

          <button type="submit" className="gradient-button">
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