const articles = [
    {
        title: 'Nouveau : Assurance Voyage avec couverture COVID-19',
        date: '15 Janvier 2026',
        category: 'Actualités',
        img: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80',
        desc: 'Découvrez nos nouvelles garanties pour voyager en toute sécurité dans le monde entier.'
    },
    {
        title: 'Comment bien choisir son assurance auto ?',
        date: '10 Janvier 2026',
        category: 'Conseils',
        img: 'https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=800&q=80',
        desc: 'Toutes les clés pour comprendre les garanties et choisir la formule adaptée à vos besoins.'
    },
    {
        title: 'Prevention : Sécuriser sa maison pendant les vacances',
        date: '05 Janvier 2026',
        category: 'Prévention',
        img: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
        desc: 'Les bons réflexes à adopter pour partir l\'esprit tranquille et éviter les mauvaises surprises.'
    }
]

export default function BulletinPage() {
    return (
        <main>
            <section className="section container products-section">
                <p className="section-kicker">Bulletin</p>
                <h1 className="section-title">Actualités et conseils d'experts</h1>
                <div className="news-block">
                    <img
                        src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1400&q=80"
                        alt="Actualités AssurGo"
                    />
                    <div>
                        <p className="news-tag">À la une</p>
                        <h4>AssurGo élue Service Client de l'Année 2025</h4>
                        <p>
                            Nous sommes fiers de vous annoncer que notre engagement envers votre satisfaction a été récompensé. Merci pour votre confiance !
                        </p>
                        <button className="nav-btn primary-btn devis-btn">
                            Lire l'article complet
                        </button>
                    </div>
                </div>
            </section>

            <section className="section container">
                <p className="section-kicker">Dernières publications</p>
                <div className="demarche-grid">
                    {articles.map((item) => (
                        <article className="demarche-card" key={item.title}>
                            <img src={item.img} alt={item.title} />
                            <div className="demarche-body">
                                <p className="news-tag" style={{ fontSize: '0.9rem' }}>{item.category} • {item.date}</p>
                                <h4 style={{ fontSize: '1.4rem', margin: '0.5rem 0' }}>{item.title}</h4>
                                <p>{item.desc}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="section section-alt">
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 className="section-title">Abonnez-vous à notre newsletter</h2>
                    <p className="text-muted" style={{ maxWidth: '600px', marginInline: 'auto' }}>
                        Recevez chaque mois nos meilleurs conseils et nos actualités en avant-première directment dans votre boîte mail.
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '2rem' }}>
                        <input
                            type="email"
                            placeholder="votre@email.com"
                            style={{
                                width: '100%',
                                maxWidth: '400px',
                                height: '50px',
                                borderRadius: '12px',
                                border: '1px solid #d6deea',
                                padding: '0 1rem',
                                outline: 'none'
                            }}
                        />
                        <button className="nav-btn primary-btn">S'abonner</button>
                    </div>
                </div>
            </section>
        </main>
    )
}
