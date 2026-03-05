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

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  }

  const loadData = async () => {
    try {
      const [contratsResponse, utilisateursResponse] = await Promise.all([
        fetch('/api/contrats', { headers: getAuthHeaders() }),
        fetch('/api/utilisateurs', { headers: getAuthHeaders() })
      ])

      if (!contratsResponse.ok) {
        throw new Error('Impossible de charger les contrats.')
      }

      if (!utilisateursResponse.ok) {
        throw new Error('Impossible de charger les utilisateurs.')
      }

      const contratsData = await contratsResponse.json()
      const utilisateursData = await utilisateursResponse.json()

      setContrats(Array.isArray(contratsData) ? contratsData : [])
      setUtilisateurs(Array.isArray(utilisateursData) ? utilisateursData : [])
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

  return (
    <main>
      <section className="section container products-section">
        <p className="section-kicker">Administration</p>
        <h1 className="section-title">Tableau de bord admin</h1>

        <div className="stats-grid-2">
          <article className="stat-box">
            <h4>{contrats.length}</h4>
            <p>Contrats référencés</p>
          </article>
          <article className="stat-box">
            <h4>{utilisateurs.length}</h4>
            <p>Utilisateurs</p>
          </article>
        </div>
      </section>

      <section className="section container profile-history-section">
        <div className="profile-history-head">
          <h2>Gestion des contrats</h2>
        </div>

        {isLoading ? <p className="auth-switch">Chargement...</p> : null}
        {error ? <p className="auth-switch">{error}</p> : null}
        {success ? <p className="auth-switch">{success}</p> : null}

        <form className="auth-form" onSubmit={handleSubmitContrat}>
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
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="submit" className="primary auth-submit">
              {editingContratId ? 'Modifier contrat' : 'Ajouter contrat'}
            </button>
            {editingContratId ? (
              <button type="button" className="nav-btn secondary-btn" onClick={resetContratForm}>
                Annuler
              </button>
            ) : null}
          </div>
        </form>

        <div className="profile-history-list" style={{ marginTop: '1rem' }}>
          {contrats.length === 0 ? <p className="auth-switch">Aucun contrat trouvé.</p> : null}
          {contrats.map((contrat) => (
            <article key={contrat.id} className="profile-history-item">
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
                <span
                  className={`history-status ${
                    contrat.statut === 'ACTIF' ? 'history-status-open' : 'history-status-closed'
                  }`}
                >
                  {contrat.statut || 'INCONNU'}
                </span>
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button type="button" className="nav-btn secondary-btn" onClick={() => handleEditContrat(contrat)}>
                  Modifier
                </button>
                <button type="button" className="nav-btn primary-btn" onClick={() => handleDeleteContrat(contrat.id)}>
                  Supprimer
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section container profile-history-section">
        <div className="profile-history-head">
          <h2>Gestion des utilisateurs</h2>
        </div>

        <form className="auth-form" onSubmit={handleSubmitUser}>
          <label>
            Nom *
            <input name="nom" value={userForm.nom} onChange={handleUserChange} required />
          </label>
          <label>
            Email *
            <input name="email" type="email" value={userForm.email} onChange={handleUserChange} required />
          </label>
          <label>
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
          <label>
            Statut compte
            <select name="statutCompte" value={userForm.statutCompte} onChange={handleUserChange}>
              <option value="VERIFIE">VERIFIE</option>
              <option value="NON_VERIFIE">NON_VERIFIE</option>
            </select>
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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

        <div className="profile-history-list" style={{ marginTop: '1rem' }}>
          {utilisateurs.length === 0 ? <p className="auth-switch">Aucun utilisateur trouvé.</p> : null}
          {utilisateurs.map((utilisateur) => (
            <article key={utilisateur.id} className="profile-history-item">
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
                <span
                  className={`history-status ${
                    utilisateur.statutCompte === 'VERIFIE' ? 'history-status-open' : 'history-status-closed'
                  }`}
                >
                  {utilisateur.statutCompte || 'NON_VERIFIE'}
                </span>
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="nav-btn secondary-btn"
                  onClick={() => handleEditUser(utilisateur)}
                >
                  Modifier
                </button>
                <button
                  type="button"
                  className="nav-btn primary-btn"
                  onClick={() => handleDeleteUser(utilisateur.id)}
                >
                  Supprimer
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
