import { useEffect, useState } from 'react'

const emptyContratForm = {
  cin: '',
  numeroContrat: '',
  codeContrat: '',
  typeContrat: '',
  dateDebutContrat: '',
  dateFinContrat: ''
}

const contractTypeOptions = [
  'Voiture',
  'Habitation',
  'Voyage',
  'Prevoyance'
]

const emptyUserForm = {
  nom: '',
  email: '',
  password: '',
  cin: '',
  numeroContrat: '',
  statutCompte: 'NON_VERIFIE'
}

const getStatusClass = (status) => (status === 'ACTIF' || status === 'VERIFIE' ? 'history-status-open' : 'history-status-closed')
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

export default function AdminPage() {
  const [contrats, setContrats] = useState([])
  const [utilisateurs, setUtilisateurs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [contratForm, setContratForm] = useState(emptyContratForm)
  const [editingContratId, setEditingContratId] = useState(null)

  const [userForm, setUserForm] = useState(emptyUserForm)
  const [editingUserId, setEditingUserId] = useState(null)

  const [contratSearchTerm, setContratSearchTerm] = useState('')
  const [userCinSearchTerm, setUserCinSearchTerm] = useState('')

  const [contactMessages, setContactMessages] = useState([])
  const [selectedContactMessageId, setSelectedContactMessageId] = useState(null)
  const [messageReplies, setMessageReplies] = useState([])
  const [replyText, setReplyText] = useState('')
  const [isReplySubmitting, setIsReplySubmitting] = useState(false)
  const [isMessengerOpen, setIsMessengerOpen] = useState(false)
  const [isThreadOpen, setIsThreadOpen] = useState(false)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  }

  const loadData = async () => {
    try {
      const [contratsResponse, utilisateursResponse, contactMessagesResponse] = await Promise.all([
        fetch('/api/contrats', { headers: getAuthHeaders() }),
        fetch('/api/utilisateurs', { headers: getAuthHeaders() }),
        fetch('/api/contact-messages/admin', { headers: getAuthHeaders() })
      ])

      if (!contratsResponse.ok) {
        throw new Error('Impossible de charger les contrats.')
      }

      if (!utilisateursResponse.ok) {
        throw new Error('Impossible de charger les utilisateurs.')
      }

      if (!contactMessagesResponse.ok) {
        throw new Error('Impossible de charger les messages contact.')
      }

      const contratsData = await contratsResponse.json()
      const utilisateursData = await utilisateursResponse.json()
      const contactMessagesData = await contactMessagesResponse.json()

      const normalizedContactMessages = Array.isArray(contactMessagesData) ? contactMessagesData : []

      setContrats(Array.isArray(contratsData) ? contratsData : [])
      setUtilisateurs(Array.isArray(utilisateursData) ? utilisateursData : [])
      setContactMessages(normalizedContactMessages)
      setSelectedContactMessageId((prev) => {
        if (prev && normalizedContactMessages.some((item) => item.id === prev)) {
          return prev
        }

        return normalizedContactMessages[0]?.id || null
      })
    } catch (loadError) {
      setError(loadError.message || 'Erreur de chargement admin.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      setError('Session admin introuvable.')
      setIsLoading(false)
      return
    }

    loadData()
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
          throw new Error('Impossible de charger les réponses.')
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

  const handleContratChange = (event) => {
    const { name, value } = event.target
    setContratForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleUserChange = (event) => {
    const { name, value } = event.target
    setUserForm((prev) => ({ ...prev, [name]: value }))
  }

  const resetContratForm = () => {
    setContratForm(emptyContratForm)
    setEditingContratId(null)
  }

  const resetUserForm = () => {
    setUserForm(emptyUserForm)
    setEditingUserId(null)
  }

  const handleSubmitContrat = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!contratForm.cin.trim() || !contratForm.numeroContrat.trim()) {
      setError('CIN et numéro contrat sont obligatoires.')
      return
    }

    const url = editingContratId ? `/api/contrats/${editingContratId}` : '/api/contrats'
    const method = editingContratId ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(contratForm)
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.message || 'Erreur de sauvegarde du contrat.')
      }

      setSuccess(editingContratId ? 'Contrat modifié avec succès.' : 'Contrat ajouté avec succès.')
      resetContratForm()
      await loadData()
    } catch (submitError) {
      setError(submitError.message || 'Erreur contrat.')
    }
  }

  const handleEditContrat = (contrat) => {
    setContratForm({
      cin: contrat.cin || '',
      numeroContrat: contrat.numeroContrat || '',
      codeContrat: contrat.codeContrat || '',
      typeContrat: contrat.typeContrat || '',
      dateDebutContrat: contrat.dateDebutContrat || '',
      dateFinContrat: contrat.dateFinContrat || ''
    })
    setEditingContratId(contrat.id)
  }

  const handleDeleteContrat = async (contratId) => {
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/contrats/${contratId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Impossible de supprimer le contrat.')
      }

      setSuccess('Contrat supprimé avec succès.')
      await loadData()
    } catch (deleteError) {
      setError(deleteError.message || 'Erreur suppression contrat.')
    }
  }

  const handleSubmitUser = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!editingUserId) {
      setError('Choisissez un utilisateur à modifier depuis la liste.')
      return
    }

    if (!userForm.nom.trim() || !userForm.email.trim()) {
      setError('Nom et email utilisateur sont obligatoires.')
      return
    }

    const payload = {
      nom: userForm.nom,
      email: userForm.email,
      password: userForm.password,
      cin: userForm.cin,
      numeroContrat: userForm.numeroContrat,
      statutCompte: userForm.statutCompte
    }

    try {
      const response = await fetch(`/api/utilisateurs/${editingUserId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.message || 'Impossible de modifier utilisateur.')
      }

      setSuccess('Utilisateur modifié avec succès.')
      resetUserForm()
      await loadData()
    } catch (submitError) {
      setError(submitError.message || 'Erreur modification utilisateur.')
    }
  }

  const handleEditUser = (user) => {
    setUserForm({
      nom: user.nom || '',
      email: user.email || '',
      password: '',
      cin: user.cin || '',
      numeroContrat: user.numeroContrat || '',
      statutCompte: user.statutCompte || 'NON_VERIFIE'
    })
    setEditingUserId(user.id)
  }

  const handleDeleteUser = async (userId) => {
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/utilisateurs/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Impossible de supprimer utilisateur.')
      }

      setSuccess('Utilisateur supprimé avec succès.')
      if (editingUserId === userId) {
        resetUserForm()
      }
      await loadData()
    } catch (deleteError) {
      setError(deleteError.message || 'Erreur suppression utilisateur.')
    }
  }

  const handleSubmitReply = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedContactMessageId) {
      setError('Choisissez un message utilisateur avant de répondre.')
      return
    }

    if (!replyText.trim()) {
      setError('Le message de réponse est obligatoire.')
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
        throw new Error(data?.message || 'Impossible d\'envoyer la réponse.')
      }

      setSuccess('Réponse envoyée avec succès.')
      setReplyText('')

      const repliesResponse = await fetch(`/api/contact-messages/${selectedContactMessageId}/replies`, {
        headers: getAuthHeaders()
      })

      if (repliesResponse.ok) {
        const repliesData = await repliesResponse.json()
        setMessageReplies(Array.isArray(repliesData) ? repliesData : [])
      }
    } catch (submitError) {
      setError(submitError.message || 'Erreur lors de l\'envoi de la réponse.')
    } finally {
      setIsReplySubmitting(false)
    }
  }

  const selectedContactMessage = contactMessages.find((item) => item.id === selectedContactMessageId) || null
  const unreadBadge = contactMessages.length > 9 ? '9+' : String(contactMessages.length)
  const launcherAvatars = contactMessages.slice(0, 3)

  const openMessenger = () => {
    setIsMessengerOpen(true)
    setIsThreadOpen(false)
  }

  const closeMessenger = () => {
    setIsMessengerOpen(false)
    setIsThreadOpen(false)
  }

  const openThread = (contactMessageId) => {
    setSelectedContactMessageId(contactMessageId)
    setIsThreadOpen(true)
  }

  const filteredContrats = contrats.filter((contrat) =>
    (contrat.numeroContrat || '')
      .toLowerCase()
      .includes(contratSearchTerm.trim().toLowerCase())
  )

  const filteredUtilisateurs = utilisateurs.filter((utilisateur) =>
    (utilisateur.cin || '')
      .toLowerCase()
      .includes(userCinSearchTerm.trim().toLowerCase())
  )

  return (
    <main className="admin-page">
      <section className="section container products-section admin-hero-section">
        <p className="section-kicker">Administration</p>
        <h1 className="section-title">Tableau de bord administrateur</h1>

        <p className="text-muted admin-hero-text">
          Gérez les contrats et les utilisateurs dans un espace unique, structuré et rapide.
        </p>

        <div className="stats-grid-2 admin-stats-grid">
          <article className="stat-box">
            <h4>{contrats.length}</h4>
            <p>Total contrats</p>
          </article>
          <article className="stat-box">
            <h4>{utilisateurs.length}</h4>
            <p>Total utilisateurs</p>
          </article>
        </div>

        {isLoading ? <p className="admin-alert admin-alert-info">Chargement...</p> : null}
        {error ? <p className="admin-alert admin-alert-error">{error}</p> : null}
        {success ? <p className="admin-alert admin-alert-success">{success}</p> : null}
      </section>

      <section className="section container admin-block">
        <div className="admin-block-head">
          <h2>Gestion des contrats</h2>
          <span className="admin-count-badge">{contrats.length}</span>
        </div>

        <div className="admin-panels">
          <article className="admin-panel">
            <div className="admin-panel-head">
              <h3>{editingContratId ? 'Modifier contrat' : 'Ajouter contrat'}</h3>
              {editingContratId ? <span className="admin-chip">Mode edition</span> : <span className="admin-chip">Nouveau contrat</span>}
            </div>

            <form className="auth-form admin-form-grid" onSubmit={handleSubmitContrat}>
              <label>
                CIN *
                <input name="cin" value={contratForm.cin} onChange={handleContratChange} required />
              </label>
              <label>
                Numéro contrat *
                <input
                  name="numeroContrat"
                  value={contratForm.numeroContrat}
                  onChange={handleContratChange}
                  required
                />
              </label>
              <label>
                Code contrat
                <input name="codeContrat" value={contratForm.codeContrat} onChange={handleContratChange} />
              </label>
              <label>
                Type contrat
                <select name="typeContrat" value={contratForm.typeContrat} onChange={handleContratChange}>
                  <option value="">Choisir un type</option>
                  {contractTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Date début
                <input
                  type="date"
                  name="dateDebutContrat"
                  value={contratForm.dateDebutContrat}
                  onChange={handleContratChange}
                />
              </label>
              <label>
                Date fin
                <input
                  type="date"
                  name="dateFinContrat"
                  value={contratForm.dateFinContrat}
                  onChange={handleContratChange}
                />
              </label>
              <div className="admin-actions-row admin-span-full">
                <button type="submit" className="primary auth-submit">
                  {editingContratId ? 'Enregistrer modification' : 'Ajouter contrat'}
                </button>
                {editingContratId ? (
                  <button type="button" className="nav-btn secondary-btn" onClick={resetContratForm}>
                    Annuler
                  </button>
                ) : null}
              </div>
            </form>
          </article>

          <article className="admin-panel">
            <div className="admin-panel-head">
              <h3>Liste des contrats</h3>
            </div>

            <div className="admin-search-bar">
              <input
                type="text"
                placeholder="Recherche par numero contrat..."
                value={contratSearchTerm}
                onChange={(event) => setContratSearchTerm(event.target.value)}
              />
            </div>

            <div className="profile-history-list admin-list">
              {contrats.length === 0 ? <p className="auth-switch">Aucun contrat trouvé.</p> : null}
              {contrats.length > 0 && filteredContrats.length === 0 ? <p className="auth-switch">Aucun contrat pour cette recherche.</p> : null}
              {filteredContrats.map((contrat) => (
                <article key={contrat.id} className="profile-history-item admin-item">
                  <div>
                    <p className="history-label">Numéro contrat</p>
                    <p className="history-value">{contrat.numeroContrat || '-'}</p>
                  </div>
                  <div>
                    <p className="history-label">CIN</p>
                    <p className="history-value">{contrat.cin || '-'}</p>
                  </div>
                  <div>
                    <p className="history-label">Type</p>
                    <p className="history-value">{contrat.typeContrat || '-'}</p>
                  </div>
                  <div>
                    <p className="history-label">Statut</p>
                    <span className={`history-status ${getStatusClass(contrat.statut)}`}>
                      {contrat.statut || 'INCONNU'}
                    </span>
                  </div>
                  <div className="admin-item-actions">
                    <button type="button" className="nav-btn secondary-btn" onClick={() => handleEditContrat(contrat)}>
                      Modifier
                    </button>
                    <button type="button" className="nav-btn primary-btn danger-btn" onClick={() => handleDeleteContrat(contrat.id)}>
                      Supprimer
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="section container admin-block">
        <div className="admin-block-head">
          <h2>Gestion des utilisateurs</h2>
          <span className="admin-count-badge">{utilisateurs.length}</span>
        </div>

        <div className="admin-panels">
          <article className="admin-panel">
            <div className="admin-panel-head">
              <h3>Edition utilisateur</h3>
              {editingUserId ? <span className="admin-chip">Mode edition</span> : <span className="admin-chip">Selection requise</span>}
            </div>

            <form className="auth-form admin-form-grid" onSubmit={handleSubmitUser}>
              <label>
                Nom *
                <input name="nom" value={userForm.nom} onChange={handleUserChange} required />
              </label>
              <label>
                Email *
                <input name="email" type="email" value={userForm.email} onChange={handleUserChange} required />
              </label>
              <label className="admin-span-full">
                Mot de passe (laisser vide pour ne pas changer)
                <input
                  type="password"
                  name="password"
                  value={userForm.password}
                  onChange={handleUserChange}
                  placeholder="********"
                />
              </label>
              <label>
                CIN
                <input name="cin" value={userForm.cin} onChange={handleUserChange} />
              </label>
              <label>
                Numéro contrat
                <input name="numeroContrat" value={userForm.numeroContrat} onChange={handleUserChange} />
              </label>
              <label className="admin-span-full">
                Statut compte
                <select name="statutCompte" value={userForm.statutCompte} onChange={handleUserChange}>
                  <option value="VERIFIE">VERIFIE</option>
                  <option value="NON_VERIFIE">NON_VERIFIE</option>
                </select>
              </label>
              <div className="admin-actions-row admin-span-full">
                <button type="submit" className="primary auth-submit" disabled={!editingUserId}>
                  Modifier utilisateur
                </button>
                {editingUserId ? (
                  <button type="button" className="nav-btn secondary-btn" onClick={resetUserForm}>
                    Annuler
                  </button>
                ) : null}
              </div>
            </form>
          </article>

          <article className="admin-panel">
            <div className="admin-panel-head">
              <h3>Liste des utilisateurs</h3>
            </div>

            <div className="admin-search-bar">
              <input
                type="text"
                placeholder="Recherche utilisateur par CIN..."
                value={userCinSearchTerm}
                onChange={(event) => setUserCinSearchTerm(event.target.value)}
              />
            </div>

            <div className="profile-history-list admin-list">
              {utilisateurs.length === 0 ? <p className="auth-switch">Aucun utilisateur trouvé.</p> : null}
              {utilisateurs.length > 0 && filteredUtilisateurs.length === 0 ? <p className="auth-switch">Aucun utilisateur pour ce CIN.</p> : null}
              {filteredUtilisateurs.map((utilisateur) => (
                <article key={utilisateur.id} className="profile-history-item admin-item">
                  <div>
                    <p className="history-label">Nom</p>
                    <p className="history-value">{utilisateur.nom || '-'}</p>
                  </div>
                  <div>
                    <p className="history-label">Email</p>
                    <p className="history-value">{utilisateur.email || '-'}</p>
                  </div>
                  <div>
                    <p className="history-label">CIN</p>
                    <p className="history-value">{utilisateur.cin || '-'}</p>
                  </div>
                  <div>
                    <p className="history-label">Statut</p>
                    <span className={`history-status ${getStatusClass(utilisateur.statutCompte)}`}>
                      {utilisateur.statutCompte || 'NON_VERIFIE'}
                    </span>
                  </div>
                  <div className="admin-item-actions">
                    <button
                      type="button"
                      className="nav-btn secondary-btn"
                      onClick={() => handleEditUser(utilisateur)}
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      className="nav-btn primary-btn danger-btn"
                      onClick={() => handleDeleteUser(utilisateur.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="section container admin-block">
        <div className="admin-block-head">
          <h2>Messages utilisateurs</h2>
          <span className="admin-count-badge">{contactMessages.length}</span>
        </div>
        <p className="text-muted" style={{ margin: 0 }}>
          Utilisez le bouton Messages en bas a droite pour ouvrir la messagerie rapide.
        </p>
      </section>

      <div className="admin-messenger-floating">
        {!isMessengerOpen ? (
          <button type="button" className="admin-message-launcher" onClick={openMessenger} aria-label="Ouvrir la messagerie">
            <span className="admin-launcher-left">
              <span className="admin-launcher-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M4 6.5C4 5.67 4.67 5 5.5 5h13c.83 0 1.5.67 1.5 1.5v8c0 .83-.67 1.5-1.5 1.5H12l-4.8 3.4c-.9.63-2.14-.01-2.14-1.1V16h-.56C3.67 16 3 15.33 3 14.5v-8z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
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

                <aside className="admin-message-list">
                  {contactMessages.length === 0 ? <p className="auth-switch">Aucun message recu.</p> : null}
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
                        <span className="admin-message-preview-name">{item.nom || 'Utilisateur'}</span>
                        <span className="admin-message-preview-text">{item.message || item.sujet || 'Nouveau message'}</span>
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
                      <p className="admin-thread-user-name">{selectedContactMessage?.nom || 'Utilisateur'}</p>
                      <p className="admin-thread-user-meta">{selectedContactMessage?.email || '-'}</p>
                    </div>
                  </div>
                  <button type="button" className="admin-close-btn" onClick={closeMessenger} aria-label="Fermer">X</button>
                </header>

                <article className="admin-message-thread">
                  {!selectedContactMessage ? (
                    <p className="auth-switch">Selectionnez un message pour afficher la conversation.</p>
                  ) : (
                    <>
                      <div className="admin-thread-body">
                        <div className="admin-chat-bubble admin-chat-bubble-user">
                          <p>{selectedContactMessage.message || '-'}</p>
                          <small>{selectedContactMessage.sujet || 'Sans sujet'} · {formatDateTime(selectedContactMessage.createdAt)}</small>
                        </div>

                        {messageReplies.map((reply) => (
                          <div
                            key={reply.id}
                            className={`admin-chat-bubble ${reply.senderRole === 'UTILISATEUR' ? 'admin-chat-bubble-user' : 'admin-chat-bubble-admin'}`}
                          >
                            <p>{reply.message}</p>
                            <small>{reply.repliedBy || 'Admin'} · {formatDateTime(reply.createdAt)}</small>
                          </div>
                        ))}

                        {messageReplies.length === 0 ? <p className="auth-switch">Aucune reponse pour ce message.</p> : null}
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
          </div>
        )}
      </div>
    </main>
  )
}
