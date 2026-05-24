import { FormEvent, useMemo, useState } from 'react'

type PropertyType = 'Apartment' | 'House' | 'Studio' | 'Short Let'
type FurnishedStatus = 'Furnished' | 'Unfurnished'

type Property = {
  id: string
  title: string
  description: string
  price: number
  location: string
  type: PropertyType
  bedrooms: number
  bathrooms: number
  furnished: FurnishedStatus
  images: string[]
  landlordPhoneE164: string
  updatedAt: string
}

type MessageThread = {
  id: string
  propertyId: string
  propertyTitle: string
  propertyImage: string
  lastMessage: string
  updatedAt: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'

const categories = ['All', 'Apartments', 'Houses', 'Studios', 'Short Let'] as const
const tabs = ['home', 'search', 'add', 'messages', 'profile'] as const

export function App() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('home')
  const [selectedCategory, setSelectedCategory] = useState<(typeof categories)[number]>('All')
  const [query, setQuery] = useState('')
  const [properties, setProperties] = useState<Property[]>([])
  const [threads] = useState<MessageThread[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  const filtered = useMemo(() => {
    return properties.filter((property) => {
      const categoryPass =
        selectedCategory === 'All' ||
        property.type.toLowerCase() === selectedCategory.toLowerCase().replace('s', '')
      const queryPass =
        !query ||
        property.title.toLowerCase().includes(query.toLowerCase()) ||
        property.location.toLowerCase().includes(query.toLowerCase())
      return categoryPass && queryPass
    })
  }, [properties, selectedCategory, query])

  const submitProperty = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)

    const payload = {
      title: form.get('title'),
      description: form.get('description'),
      price: Number(form.get('price')),
      location: form.get('location'),
      type: form.get('type'),
      images: (form.getAll('images') as File[]).filter((file) => file.name),
    }

    await fetch(`${API_BASE_URL}/properties`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    })

    event.currentTarget.reset()
  }

  if (selectedProperty) {
    return <PropertyDetails property={selectedProperty} onBack={() => setSelectedProperty(null)} />
  }

  return (
    <main className="shell">
      <header className="topbar">
        <h1>Rentra Homes</h1>
        <button className="icon-btn" aria-label="Notifications">🔔</button>
      </header>

      {activeTab === 'home' && (
        <section className="screen">
          <label className="search-box">
            <span>🔍</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by location or property"
            />
            <span>⚙️</span>
          </label>

          <div className="chips">
            {categories.map((category) => (
              <button
                key={category}
                className={selectedCategory === category ? 'chip active' : 'chip'}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="property-grid">
            {filtered.map((property) => (
              <button key={property.id} className="card" onClick={() => setSelectedProperty(property)}>
                <img src={property.images[0]} alt={property.title} className="card-image" />
                <div className="card-body">
                  <h3>{property.title}</h3>
                  <p>{property.location}</p>
                  <strong>${property.price.toLocaleString()}/month</strong>
                  <small>
                    {property.bedrooms} Beds · {property.bathrooms} Baths · {property.furnished}
                  </small>
                </div>
              </button>
            ))}
            {!filtered.length && (
              <div className="empty-state">
                <h2>No properties yet</h2>
                <p>Connect your backend and publish your first real listing.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === 'add' && <AddProperty submitProperty={submitProperty} />}
      {activeTab === 'messages' && <Messages threads={threads} />}

      <nav className="bottom-nav">
        {tabs.map((tab) => (
          <button key={tab} className={tab === 'add' ? 'nav-item highlighted' : 'nav-item'} onClick={() => setActiveTab(tab)}>
            {tab === 'add' ? 'Add Property' : tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>
    </main>
  )
}

function PropertyDetails({ property, onBack }: { property: Property; onBack: () => void }) {
  return (
    <section className="details-screen">
      <button onClick={onBack} className="back-btn">← Back</button>
      <div className="gallery">{property.images.map((image) => <img key={image} src={image} alt={property.title} />)}</div>
      <div className="detail-body">
        <h2>{property.title}</h2>
        <p>{property.location}</p>
        <h3>${property.price.toLocaleString()}/month</h3>
        <div className="meta-row">
          <span>{property.bedrooms} Bedrooms</span>
          <span>{property.bathrooms} Bathrooms</span>
          <span>{property.furnished}</span>
        </div>
        <p>{property.description}</p>
        <iframe
          title="Property location"
          src={`https://www.google.com/maps?q=${encodeURIComponent(property.location)}&output=embed`}
        />
      </div>
      <div className="floating-actions">
        <a className="whatsapp-btn" href={`https://wa.me/${property.landlordPhoneE164.replace('+', '')}`}>WhatsApp</a>
        <button className="message-btn">Message</button>
      </div>
    </section>
  )
}

function AddProperty({ submitProperty }: { submitProperty: (event: FormEvent<HTMLFormElement>) => Promise<void> }) {
  return (
    <section className="screen">
      <h2>Add Property</h2>
      <form className="add-form" onSubmit={submitProperty}>
        <label>Images<input name="images" type="file" multiple accept="image/*" /></label>
        <label>Title<input name="title" required /></label>
        <label>Description<textarea name="description" required rows={4} /></label>
        <label>Price<input name="price" required type="number" min={1} /></label>
        <label>Location<input name="location" required /></label>
        <label>Property Type
          <select name="type" required>
            <option>Apartment</option><option>House</option><option>Studio</option><option>Short Let</option>
          </select>
        </label>
        <button type="submit" className="primary">Publish Property</button>
      </form>
    </section>
  )
}

function Messages({ threads }: { threads: MessageThread[] }) {
  return (
    <section className="screen">
      <h2>Messages</h2>
      <div className="threads">
        {threads.map((thread) => (
          <article className="thread" key={thread.id}>
            <img src={thread.propertyImage} alt={thread.propertyTitle} />
            <div>
              <strong>{thread.propertyTitle}</strong>
              <p>{thread.lastMessage}</p>
            </div>
            <time>{thread.updatedAt}</time>
          </article>
        ))}
        {!threads.length && <p className="empty-copy">No conversations yet.</p>}
      </div>
    </section>
  )
}
