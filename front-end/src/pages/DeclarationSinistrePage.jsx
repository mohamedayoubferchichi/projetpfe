import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

const ALLOWED_TYPES = ['AUTO', 'HABITATION', 'VOYAGE', 'PREVOYANCE']

const createInitialForm = (typeSinistre = 'AUTO') => ({
  typeSinistre,
  numeroContrat: '',
  dateIncident: '',
  lieuIncident: '',
  description: ''
})

export default function DeclarationSinistrePage() {
  const [searchParams] = useSearchParams()
  const selectedType = useMemo(() => {
    const type = (searchParams.get('type') || '').toUpperCase()
    return ALLOWED_TYPES.includes(type) ? type : 'AUTO'
  }, [searchParams])

  const [form, setForm] = useState(() => createInitialForm(selectedType))
  const [photos, setPhotos] = useState([])
  const [documents, setDocuments] = useState([])
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setForm((prev) => ({ ...prev, typeSinistre: selectedType }))
  }, [selectedType])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = (event) => {
    setPhotos(Array.from(event.target.files || []))
  }

  const handleDocumentChange = (event) => {
    setDocuments(Array.from(event.target.files || []))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSuccess('Declaration envoyee (front-end demo). L\'integration backend IA/RAG sera branchee ensuite.')
    setForm(createInitialForm(selectedType))
    setPhotos([])
    setDocuments([])
  }

  return (
    <main className="sinistre-page">
      <section className="section container products-section">
        <p className="section-kicker">Declaration sinistre</p>
        <h1 className="section-title">Declarez votre dossier en ligne</h1>
        <p className="text-muted sinistre-intro">
          Chargez vos justificatifs et photos. Cette page est une version front-end conforme au cahier de charge.
        </p>
      </section>

      <section className="section container">
        <article className="auth-card sinistre-card">
          <h2>Formulaire de declaration</h2>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              Type de sinistre
              <select name="typeSinistre" value={form.typeSinistre} onChange={handleChange}>
                <option value="AUTO">Accident automobile</option>
                <option value="HABITATION">Sinistre habitation</option>
                <option value="VOYAGE">Sinistre voyage</option>
                <option value="PREVOYANCE">Sinistre prevoyance</option>
              </select>
            </label>

            <label>
              Numero contrat
              <input
                name="numeroContrat"
                value={form.numeroContrat}
                onChange={handleChange}
                placeholder="Ex: CTR-2026-001"
                required
              />
            </label>

            <label>
              Date de l'incident
              <input
                type="date"
                name="dateIncident"
                value={form.dateIncident}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Lieu de l'incident
              <input
                name="lieuIncident"
                value={form.lieuIncident}
                onChange={handleChange}
                placeholder="Ville, adresse..."
                required
              />
            </label>

            <label>
              Description du sinistre
              <textarea
                className="contact-textarea"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Expliquez ce qui s'est passe..."
                required
              />
            </label>

            <div className="sinistre-upload-grid">
              <label>
                Photos de l'accident
                <input type="file" accept="image/*" multiple onChange={handlePhotoChange} />
                <small>{photos.length} fichier(s) selectionne(s)</small>
              </label>

              <label>
                Documents (contrat, facture...)
                <input type="file" multiple onChange={handleDocumentChange} />
                <small>{documents.length} fichier(s) selectionne(s)</small>
              </label>
            </div>

            <button type="submit" className="primary auth-submit">
              Envoyer la declaration
            </button>
          </form>

          {success ? <p className="auth-switch">{success}</p> : null}
        </article>
      </section>
    </main>
  )
}
