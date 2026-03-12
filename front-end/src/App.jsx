import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import logo from './assets/assurgo-logo_Version2.svg'
import AdminPage from './pages/AdminPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import MaPrevoyancePage from './pages/MaPrevoyancePage'
import MaVoiturePage from './pages/MaVoiturePage'
import MonHabitationPage from './pages/MonHabitationPage'
import MonVoyagePage from './pages/MonVoyagePage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'

import AssistancePage from './pages/AssistancePage'
import AgencesPage from './pages/AgencesPage'
import ContactPage from './pages/ContactPage'
import BulletinPage from './pages/BulletinPage'
import DeclarationSinistrePage from './pages/DeclarationSinistrePage'

const quickLinks = [
  { label: 'Assistance', to: '/assistance' },
  { label: 'Agences', to: '/agences' },
  { label: 'Contact', to: '/contact' },
  { label: 'Bulletin', to: '/bulletin' }
]

const navItems = [
  { label: 'Ma voiture', to: '/ma-voiture' },
  { label: 'Mon habitation', to: '/mon-habitation' },
  { label: 'Mon voyage', to: '/mon-voyage' },
  { label: 'Ma prévoyance', to: '/ma-prevoyance' }
]

const normalizeRole = (role) => {
  if (!role) {
    return 'UTILISATEUR'
  }

  const normalized = role.toString().trim().toUpperCase()
  return normalized.startsWith('ROLE_') ? normalized.replace('ROLE_', '') : normalized
}

export default function App() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const isAuthenticated = Boolean(token)
  const userRole = normalizeRole(localStorage.getItem('userRole'))
  const defaultAuthenticatedPath = userRole === 'ADMIN' ? '/admin' : '/profile'
  const [userDisplayName, setUserDisplayName] = useState(
    localStorage.getItem('userDisplayName') || localStorage.getItem('userEmail') || 'Mon profil'
  )

  useEffect(() => {
    if (!isAuthenticated) {
      setUserDisplayName('Mon profil')
      return
    }

    if (!token) {
      return
    }

    if (userRole === 'ADMIN') {
      const adminDisplayName = localStorage.getItem('userDisplayName') || 'Administrateur'
      setUserDisplayName(adminDisplayName)
      return
    }

    fetch('/api/utilisateurs/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Impossible de charger le profil')
        }
        return response.json()
      })
      .then((data) => {
        const displayName = data?.nom?.trim() || data?.email || 'Mon profil'
        setUserDisplayName(displayName)
        localStorage.setItem('userDisplayName', displayName)
        if (data?.email) {
          localStorage.setItem('userEmail', data.email)
        }
      })
      .catch(() => {
        const fallback = localStorage.getItem('userDisplayName') || localStorage.getItem('userEmail') || 'Mon profil'
        setUserDisplayName(fallback)
      })
  }, [isAuthenticated, token, userRole])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userDisplayName')
    localStorage.removeItem('userRole')
    setUserDisplayName('Mon profil')
    navigate('/se-connecter', { replace: true })
  }
  return (
    <div className="page">
      <div className="right-floating">
        {quickLinks.map((item) => (
          <Link key={item.label} to={item.to} style={{ display: 'contents' }}>
            <button>{item.label}</button>
          </Link>
        ))}
      </div>
      <header className="topbar">
        <div className="container nav-wrap">
          <Link className="brand" to="/">
            <img src={logo} alt="AssurGo" className="brand-logo" />
            <span>AssurGo Assurances</span>
          </Link>
          <nav className="nav-links">
            {navItems.map((item) => (
              item.to ? (
                <Link to={item.to} key={item.label}>
                  {item.label}
                </Link>
              ) : (
                <a href="#" key={item.label}>
                  {item.label}
                </a>
              )
            ))}
          </nav>
          <div className="nav-actions">
            <button className="cta-btn">Découvrez AssurGo</button>
            {isAuthenticated ? (
              <>
                <Link to={defaultAuthenticatedPath} className="nav-btn secondary-btn">
                  {userDisplayName}
                </Link>
                <button className="nav-btn primary-btn" onClick={handleLogout}>
                  Déconnecter
                </button>
              </>
            ) : (
              <>
                <Link to="/se-connecter" className="nav-btn secondary-btn">
                  Se connecter
                </Link>
                <Link to="/creer-compte" className="nav-btn primary-btn">
                  Créer un compte
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ma-voiture" element={<MaVoiturePage />} />
        <Route path="/mon-habitation" element={<MonHabitationPage />} />
        <Route path="/mon-voyage" element={<MonVoyagePage />} />
        <Route path="/ma-prevoyance" element={<MaPrevoyancePage />} />
        <Route
          path="/declaration-sinistre"
          element={
            !isAuthenticated
              ? <Navigate to="/se-connecter" replace />
              : userRole === 'ADMIN'
                ? <Navigate to="/admin" replace />
                : <DeclarationSinistrePage />
          }
        />
        <Route path="/assistance" element={<AssistancePage />} />
        <Route path="/agences" element={<AgencesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/bulletin" element={<BulletinPage />} />
        <Route
          path="/profile"
          element={
            !isAuthenticated
              ? <Navigate to="/se-connecter" replace />
              : userRole === 'ADMIN'
                ? <Navigate to="/admin" replace />
                : <ProfilePage />
          }
        />
        <Route
          path="/admin"
          element={
            !isAuthenticated
              ? <Navigate to="/se-connecter" replace />
              : userRole === 'ADMIN'
                ? <AdminPage />
                : <Navigate to="/profile" replace />
          }
        />
        <Route
          path="/se-connecter"
          element={isAuthenticated ? <Navigate to={defaultAuthenticatedPath} replace /> : <LoginPage />}
        />
        <Route
          path="/creer-compte"
          element={isAuthenticated ? <Navigate to={defaultAuthenticatedPath} replace /> : <RegisterPage />}
        />
      </Routes>

      <section id="contact" className="footer-main">
        <div className="container footer-main-grid">
          <div>
            <img src={logo} alt="AssurGo" className="footer-logo" />
            <p>9 rue de Palestine cité des affaires</p>
            <p>Kheireddine 2060 La Goulette</p>
            <p>70 255 000</p>
          </div>
          <div>
            <h5>Découvrir</h5>
            <Link to="/">FAQs</Link>
            <Link to="/">Téléchargements</Link>
          </div>
          <div>
            <h5>Contact</h5>
            <Link to="/">Lexique</Link>
            <Link to="/se-connecter">Accès partenaires</Link>
          </div>
          <div>
            <h5>Actualités</h5>
            <Link to="/">Plan du site</Link>
            <Link to="/">IAA</Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-wrap">
          <p>© 2026 AssurGo Assurances</p>
          <p>Tous droits réservés</p>
        </div>
      </footer>
    </div>
  )
}
