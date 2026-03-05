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

const getContractStatusClass = (status) => (status === 'ACTIF' ? 'history-status-open' : 'history-status-closed')

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

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
      })
      .catch((fetchError) => {
        setError(fetchError.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

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
    </main>
  )
}
