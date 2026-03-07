import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const historiqueSinistres = [
  {
    reference: 'SIN-2026-0142',
    date: '12/02/2026',
    type: 'Accrochage léger',
    statut: 'En cours'
  },
  {
    reference: 'SIN-2025-0968',
    date: '21/11/2025',
    type: 'Bris de glace',
    statut: 'Clôturé'
  },
  {
    reference: 'SIN-2025-0711',
    date: '05/08/2025',
    type: 'Panne remorquage',
    statut: 'Clôturé'
  }
]

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('fr-FR').format(parsedDate)
}

const formatDateTime = (value) => {
  if (!value) {
    return '-'
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(parsedDate)
}

const formatRelativeTime = (value) => {
  if (!value) {
    return '-'
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return '-'
  }

  const diffInMinutes = Math.max(1, Math.floor((Date.now() - parsedDate.getTime()) / 60000))

  if (diffInMinutes < 60) {
    return `${diffInMinutes} min`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} h`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} j`
}

const getAvatarLabel = (nom, email) => {
  const source = (nom || email || 'U').trim()

  if (!source) {
    return 'U'
  }

  const words = source
    .replace(/@.*/, '')
    .split(/\s+/)
    .filter(Boolean)

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase()
  }

  return source.slice(0, 2).toUpperCase()
}

const getAvatarColor = (seed) => {
  const colors = ['#f28b82', '#fbbc04', '#34a853', '#4a90e2', '#9c88ff', '#ff7f50', '#00b8bd']
  const normalizedSeed = String(seed || 'default')

  let hash = 0
  for (let index = 0; index < normalizedSeed.length; index += 1) {
    hash = normalizedSeed.charCodeAt(index) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length]
}

const getContractStatusClass = (status) => (status === 'ACTIF' ? 'history-status-open' : 'history-status-closed')

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [contactMessages, setContactMessages] = useState([])
  const [selectedContactMessageId, setSelectedContactMessageId] = useState(null)
  const [messageReplies, setMessageReplies] = useState([])
  const [replyText, setReplyText] = useState('')

  const [newMessageForm, setNewMessageForm] = useState({ sujet: '', message: '' })
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [isReplySubmitting, setIsReplySubmitting] = useState(false)
  const [messageError, setMessageError] = useState('')
  const [messageSuccess, setMessageSuccess] = useState('')

  const [isMessengerOpen, setIsMessengerOpen] = useState(false)
  const [isThreadOpen, setIsThreadOpen] = useState(false)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  }

  const loadMyMessages = async () => {
    const response = await fetch('/api/contact-messages/mine', {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Impossible de charger vos messages.')
    }

    const data = await response.json()
    const normalized = Array.isArray(data) ? data : []

    setContactMessages(normalized)
    setSelectedContactMessageId((prev) => {
      if (prev && normalized.some((item) => item.id === prev)) {
        return prev
      }

      return normalized[0]?.id || null
    })
  }

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      setError('Vous devez vous connecter pour voir votre profil.')
      setIsLoading(false)
      return
    }

    fetch('/api/utilisateurs/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Impossible de charger les informations du profil.')
        }
        return response.json()
      })
      .then((data) => {
        setProfile(data)
        if (data?.nom) {
          localStorage.setItem('userDisplayName', data.nom)
        }
        if (data?.email) {
          localStorage.setItem('userEmail', data.email)
        }

        return loadMyMessages()
      })
      .catch((fetchError) => {
        setError(fetchError.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token || !selectedContactMessageId) {
      setMessageReplies([])
      return
    }

    fetch(`/api/contact-messages/${selectedContactMessageId}/replies`, {
      headers: getAuthHeaders()
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Impossible de charger la conversation.')
        }
        return response.json()
      })
      .then((data) => {
        setMessageReplies(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        setMessageReplies([])
      })
  }, [selectedContactMessageId])

  const handleCreateMessage = async (event) => {
    event.preventDefault()
    setMessageError('')
    setMessageSuccess('')

    if (!newMessageForm.sujet.trim() || !newMessageForm.message.trim()) {
      setMessageError('Sujet et message sont obligatoires.')
      return
    }

    if (!profile?.nom || !profile?.email) {
      setMessageError('Informations utilisateur introuvables. Rechargez votre profil.')
      return
    }

    setIsSendingMessage(true)

    try {
      const response = await fetch('/api/contact-messages', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          nom: profile.nom,
          email: profile.email,
          sujet: newMessageForm.sujet,
          message: newMessageForm.message
        })
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.message || 'Impossible d\'envoyer le message.')
      }

      setMessageSuccess('Message envoye avec succes.')
      setNewMessageForm({ sujet: '', message: '' })

      await loadMyMessages()
      if (data?.id) {
        setSelectedContactMessageId(data.id)
        setIsThreadOpen(true)
      }
    } catch (submitError) {
      setMessageError(submitError.message || 'Erreur lors de l\'envoi du message.')
    } finally {
      setIsSendingMessage(false)
    }
  }

  const handleSubmitReply = async (event) => {
    event.preventDefault()
    setMessageError('')
    setMessageSuccess('')

    if (!selectedContactMessageId) {
      setMessageError('Selectionnez une conversation.')
      return
    }

    if (!replyText.trim()) {
      setMessageError('Ecrivez un message avant l\'envoi.')
      return
    }

    setIsReplySubmitting(true)

    try {
      const response = await fetch(`/api/contact-messages/${selectedContactMessageId}/replies`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message: replyText })
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.message || 'Impossible d\'envoyer la reponse.')
      }

      setReplyText('')
      setMessageSuccess('Reponse envoyee.')

      const repliesResponse = await fetch(`/api/contact-messages/${selectedContactMessageId}/replies`, {
        headers: getAuthHeaders()
      })

      if (repliesResponse.ok) {
        const repliesData = await repliesResponse.json()
        setMessageReplies(Array.isArray(repliesData) ? repliesData : [])
      }
    } catch (submitError) {
      setMessageError(submitError.message || 'Erreur lors de la reponse.')
    } finally {
      setIsReplySubmitting(false)
    }
  }

  const openMessenger = () => {
    setIsMessengerOpen(true)
    setIsThreadOpen(false)
  }

  const closeMessenger = () => {
    setIsMessengerOpen(false)
    setIsThreadOpen(false)
    setMessageError('')
    setMessageSuccess('')
  }

  const openThread = (contactMessageId) => {
    setSelectedContactMessageId(contactMessageId)
    setIsThreadOpen(true)
    setMessageError('')
    setMessageSuccess('')
  }

  const infosProfil = useMemo(
    () => [
      { label: 'Nom', value: profile?.nom || '-' },
      { label: 'Email', value: profile?.email || '-' },
      { label: 'CIN', value: profile?.cin || '-' }
    ],
    [profile]
  )
  const contrats = profile?.contrats || []
  const nombreContrats = profile?.nombreContrats ?? contrats.length
  const selectedContactMessage = contactMessages.find((item) => item.id === selectedContactMessageId) || null
  const unreadBadge = contactMessages.length > 9 ? '9+' : String(contactMessages.length)
  const launcherAvatars = contactMessages.slice(0, 3)

  return (
    <main className="profile-page">
      <section className="section container">
        <div className="profile-header-card">
          <div>
            <p className="section-kicker profile-kicker">Espace client</p>
            <h1 className="section-title left profile-title">{profile?.nom || 'Mon profil'}</h1>
            <p className="text-muted profile-intro">
              Gérez vos informations et consultez l’historique de vos sinistres en un seul endroit.
            </p>
          </div>
          <span
            className={`profile-status-badge ${
              profile?.statutCompte === 'VERIFIE' ? 'profile-status-verified' : 'profile-status-pending'
            }`}
          >
            {profile?.statutCompte === 'VERIFIE' ? 'Compte vérifié' : 'Compte non vérifié'}
          </span>
        </div>
      </section>

      <section className="section container profile-grid-layout">
        <article className="profile-info-card">
          <h2>Informations personnelles</h2>
          {isLoading ? <p className="auth-switch">Chargement des informations...</p> : null}
          {error ? <p className="auth-switch">{error}</p> : null}
          <div className="auth-form">
            {!isLoading && !error && infosProfil.map((item) => (
              <label key={item.label}>
                {item.label}
                <input type="text" value={item.value} readOnly />
              </label>
            ))}
          </div>
        </article>

        <aside className="profile-summary-card">
          <div className="profile-contracts-head">
            <h3>Mes contrats</h3>
            <span className="profile-contracts-count">{nombreContrats}</span>
          </div>
          {isLoading ? <p className="auth-switch">Chargement des contrats...</p> : null}
          {error ? null : (
            <div className="profile-contract-list">
              {!isLoading && contrats.length === 0 ? (
                <p className="auth-switch">Aucun contrat trouvé.</p>
              ) : null}
              {!isLoading && contrats.map((contrat, index) => (
                <article
                  key={`${contrat.numeroContrat || 'contrat'}-${index}`}
                  className="profile-contract-item"
                >
                  <p className="history-label">Numéro</p>
                  <p className="history-value">{contrat.numeroContrat || '-'}</p>
                  <p className="history-label">Date fin</p>
                  <p className="history-value">{formatDate(contrat.dateFinContrat)}</p>
                  <p className="history-label">Statut</p>
                  <span className={`history-status ${getContractStatusClass(contrat.statut)}`}>
                    {contrat.statut || 'INCONNU'}
                  </span>
                  <p className="history-label">Type</p>
                  <p className="history-value">{contrat.typeContrat || '-'}</p>
                </article>
              ))}
            </div>
          )}
        </aside>
      </section>

      <section className="section container profile-history-section">
        <div className="profile-history-head">
          <h2>Historique des sinistres</h2>
          <Link to="/ma-voiture" className="nav-btn secondary-btn">
            Déclarer un sinistre
          </Link>
        </div>
        <div className="profile-history-list">
          {historiqueSinistres.map((sinistre) => (
            <article key={sinistre.reference} className="profile-history-item">
              <div>
                <p className="history-label">Référence</p>
                <p className="history-value">{sinistre.reference}</p>
              </div>
              <div>
                <p className="history-label">Date</p>
                <p className="history-value">{sinistre.date}</p>
              </div>
              <div>
                <p className="history-label">Type</p>
                <p className="history-value">{sinistre.type}</p>
              </div>
              <div>
                <p className="history-label">Statut</p>
                <span
                  className={`history-status ${
                    sinistre.statut === 'Clôturé' ? 'history-status-closed' : 'history-status-open'
                  }`}
                >
                  {sinistre.statut}
                </span>
              </div>
            </article>
          ))}
        </div>

        <p className="auth-switch">
          Retour à <Link to="/">l’accueil</Link>
        </p>
      </section>

      <div className="admin-messenger-floating">
        {!isMessengerOpen ? (
          <button type="button" className="admin-message-launcher" onClick={openMessenger} aria-label="Ouvrir la messagerie">
            <span className="admin-launcher-left">
              <span className="admin-launcher-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M4 6.5C4 5.67 4.67 5 5.5 5h13c.83 0 1.5.67 1.5 1.5v8c0 .83-.67 1.5-1.5 1.5H12l-4.8 3.4c-.9.63-2.14-.01-2.14-1.1V16h-.56C3.67 16 3 15.33 3 14.5v-8z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {contactMessages.length > 0 ? <span className="admin-launcher-badge">{unreadBadge}</span> : null}
              </span>
              <span className="admin-launcher-title">Messages</span>
            </span>

            <span className="admin-launcher-avatars">
              {launcherAvatars.map((item) => (
                <span
                  key={item.id}
                  className="admin-launcher-avatar"
                  style={{ backgroundColor: getAvatarColor(item.email || item.nom || item.id) }}
                >
                  {getAvatarLabel(item.nom, item.email)}
                </span>
              ))}
              <span className="admin-launcher-more">...</span>
            </span>
          </button>
        ) : (
          <div className="admin-messenger-shell">
            {!isThreadOpen ? (
              <>
                <header className="admin-messenger-header">
                  <div className="admin-messenger-title-wrap">
                    <h3>Messages</h3>
                    {contactMessages.length > 0 ? <span className="admin-messenger-badge">{unreadBadge}</span> : null}
                  </div>
                  <button type="button" className="admin-close-btn" onClick={closeMessenger} aria-label="Fermer">X</button>
                </header>

                <div className="user-new-message-card">
                  <p className="user-new-message-title">Nouveau message vers Admin</p>
                  <form className="user-new-message-form" onSubmit={handleCreateMessage}>
                    <input
                      type="text"
                      placeholder="Sujet"
                      value={newMessageForm.sujet}
                      onChange={(event) => setNewMessageForm((prev) => ({ ...prev, sujet: event.target.value }))}
                      required
                    />
                    <textarea
                      className="user-mini-textarea"
                      placeholder="Votre message..."
                      value={newMessageForm.message}
                      onChange={(event) => setNewMessageForm((prev) => ({ ...prev, message: event.target.value }))}
                      required
                    />
                    <button type="submit" className="admin-send-btn" disabled={isSendingMessage}>
                      {isSendingMessage ? '...' : 'Envoyer'}
                    </button>
                  </form>
                </div>

                <aside className="admin-message-list">
                  {contactMessages.length === 0 ? <p className="auth-switch">Aucun message envoye.</p> : null}
                  {contactMessages.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      className="admin-message-preview"
                      onClick={() => openThread(item.id)}
                    >
                      <span
                        className="admin-message-avatar"
                        style={{ backgroundColor: getAvatarColor(item.email || item.nom || item.id) }}
                      >
                        {getAvatarLabel(item.nom, item.email)}
                      </span>

                      <span className="admin-message-preview-content">
                        <span className="admin-message-preview-name">{item.sujet || 'Sans sujet'}</span>
                        <span className="admin-message-preview-text">{item.message || '-'}</span>
                      </span>

                      <span className="admin-message-preview-side">
                        <span className="admin-message-preview-time">{formatRelativeTime(item.createdAt)}</span>
                        <span className="admin-message-unread-dot" />
                      </span>
                    </button>
                  ))}
                </aside>
              </>
            ) : (
              <>
                <header className="admin-thread-head-messenger">
                  <div className="admin-thread-user">
                    <button type="button" className="admin-back-btn" onClick={() => setIsThreadOpen(false)} aria-label="Retour">
                      {'<'}
                    </button>
                    <span
                      className="admin-message-avatar"
                      style={{ backgroundColor: getAvatarColor(selectedContactMessage?.email || selectedContactMessage?.nom || selectedContactMessage?.id) }}
                    >
                      {getAvatarLabel(selectedContactMessage?.nom, selectedContactMessage?.email)}
                    </span>
                    <div>
                      <p className="admin-thread-user-name">Admin conversation</p>
                      <p className="admin-thread-user-meta">{selectedContactMessage?.sujet || 'Sans sujet'}</p>
                    </div>
                  </div>
                  <button type="button" className="admin-close-btn" onClick={closeMessenger} aria-label="Fermer">X</button>
                </header>

                <article className="admin-message-thread">
                  {!selectedContactMessage ? (
                    <p className="auth-switch">Selectionnez un message.</p>
                  ) : (
                    <>
                      <div className="admin-thread-body">
                        <div className="admin-chat-bubble admin-chat-bubble-admin">
                          <p>{selectedContactMessage.message || '-'}</p>
                          <small>Vous · {formatDateTime(selectedContactMessage.createdAt)}</small>
                        </div>

                        {messageReplies.map((reply) => (
                          <div
                            key={reply.id}
                            className={`admin-chat-bubble ${reply.senderRole === 'UTILISATEUR' ? 'admin-chat-bubble-admin' : 'admin-chat-bubble-user'}`}
                          >
                            <p>{reply.message}</p>
                            <small>{reply.senderRole === 'UTILISATEUR' ? 'Vous' : 'Admin'} · {formatDateTime(reply.createdAt)}</small>
                          </div>
                        ))}
                      </div>

                      <form className="admin-thread-composer" onSubmit={handleSubmitReply}>
                        <input
                          type="text"
                          placeholder="Votre message..."
                          value={replyText}
                          onChange={(event) => setReplyText(event.target.value)}
                          required
                        />
                        <button type="submit" className="admin-send-btn" disabled={isReplySubmitting}>
                          {isReplySubmitting ? '...' : 'Envoyer'}
                        </button>
                      </form>
                    </>
                  )}
                </article>
              </>
            )}

            {messageError ? <p className="user-messenger-alert user-messenger-alert-error">{messageError}</p> : null}
            {messageSuccess ? <p className="user-messenger-alert user-messenger-alert-success">{messageSuccess}</p> : null}
          </div>
        )}
      </div>
    </main>
  )
}
