import { Link } from 'react-router-dom'

const agencies = [
    {
        city: 'Tunis - La Goulette',
        address: '9 rue de Palestine, cité des affaires',
        phone: '70 255 000',
        hours: 'Lun-Ven: 08:30 - 17:30'
    },
    {
        city: 'Sousse - Kantaoui',
        address: 'Avenue du 14 Janvier, Immeuble El Hana',
        phone: '73 300 100',
        hours: 'Lun-Ven: 08:30 - 17:30'
    },
    {
        city: 'Sfax - Ville',
        address: 'Boulevard 14 Janvier, Résidence du Lac',
        phone: '74 400 200',
        hours: 'Lun-Ven: 08:30 - 17:30'
    },
    {
        city: 'Bizerte - Corniche',
        address: 'Avenue Habib Bourguiba, Face au port',
        phone: '72 500 300',
        hours: 'Lun-Ven: 08:30 - 16:30'
    }
]

export default function AgencesPage() {
    return (
        <main>
            <section className="section container products-section">
                <p className="section-kicker">Nos Agences</p>
                <h1 className="section-title">Trouvez l'agence AssurGo la plus proche</h1>
                <div className="news-block">
                    <img
                        src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80"
                        alt="Nos agences"
                    />
                    <div>
                        <p className="news-tag">Proximité & Conseil</p>
                        <h4>Plus de 160 agences à travers la Tunisie</h4>
                        <p>
                            Nos conseillers vous accueillent partout en Tunisie pour vous proposer des solutions personnalisées et un accompagnement de proximité.
                        </p>
                        <button className="nav-btn primary-btn devis-btn">
                            Afficher sur la carte
                        </button>
                    </div>
                </div>
            </section>

            <section className="section container">
                <p className="section-kicker">Réseau d'agences</p>
                <div className="product-grid">
                    {agencies.map((item) => (
                        <article className="product-card" key={item.city} style={{ textAlign: 'left' }}>
                            <h4 style={{ fontSize: '1.4rem' }}>{item.city}</h4>
                            <p>📍 {item.address}</p>
                            <p>📞 {item.phone}</p>
                            <p>🕒 {item.hours}</p>
                            <Link to="/contact" style={{ color: '#00cccc', fontWeight: 'bold', display: 'block', marginTop: '1rem' }}>
                                Prendre rendez-vous →
                            </Link>
                        </article>
                    ))}
                </div>
            </section>

            <section className="section section-alt">
                <div className="container stats-layout">
                    <div>
                        <h2 className="section-title left">Vous souhaitez devenir partenaire ?</h2>
                        <p className="text-muted">
                            Rejoignez le réseau AssurGo et bénéficiez de notre expertise et de nos outils digitaux pour développer votre activité.
                        </p>
                        <Link to="/contact" className="nav-btn primary-btn">
                            En savoir plus
                        </Link>
                    </div>
                    <div className="stats-grid-2">
                        <article className="stat-box">
                            <h4>160+</h4>
                            <p>Points de vente</p>
                        </article>
                        <article className="stat-box">
                            <h4>24/24</h4>
                            <p>Support partenaire</p>
                        </article>
                    </div>
                </div>
            </section>
        </main>
    )
}
