import { useEffect, useState } from 'react'

export default function AdminPage() {
  const [contrats, setContrats] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      setError('Session admin introuvable.')
      setIsLoading(false)
      return
    }

    fetch('/api/contrats', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Impossible de charger les contrats administrateur.')
        }
        return response.json()
      })
      .then((data) => {
        setContrats(Array.isArray(data) ? data : [])
      })
      .catch((fetchError) => {
        setError(fetchError.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

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
            <h4>{contrats.filter((item) => item?.statut === 'ACTIF').length}</h4>
            <p>Contrats actifs</p>
          </article>
        </div>
      </section>

      <section className="section container profile-history-section">
        <div className="profile-history-head">
          <h2>Liste des contrats</h2>
        </div>

        {isLoading ? <p className="auth-switch">Chargement...</p> : null}
        {error ? <p className="auth-switch">{error}</p> : null}

        {!isLoading && !error ? (
          <div className="profile-history-list">
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
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  )
}
