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
  unread?: boolean
}

const API_BASE_URL = 'http://localhost:4000'
const categories = ['All', 'Apartments', 'Houses', 'Studios', 'Short Let'] as const
const tabs = ['home', 'search', 'add', 'messages', 'profile'] as const

const seedProperties: Property[] = [
  {
    id: 'p1',
    title: 'Modern Studio',
    description:
      'Meticulously designed modern studio with open concept layout, premium finishes, and oversized windows that bring in natural light throughout the day.',
    price: 1800,
    location: 'Brooklyn, New York',
    type: 'Studio',
    bedrooms: 1,
    bathrooms: 1,
    furnished: 'Unfurnished',
    images: [
      'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
    ],
    landlordPhoneE164: '+17185551234',
    updatedAt: '2m ago',
  },
  {
    id: 'p2',
    title: 'Downtown Loft',
    description: 'Spacious loft in the heart of downtown with high ceilings, smart lock entry, and private laundry.',
    price: 2500,
    location: 'Manhattan, New York',
    type: 'Apartment',
    bedrooms: 2,
    bathrooms: 2,
    furnished: 'Furnished',
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'],
    landlordPhoneE164: '+16465559876',
    updatedAt: 'Yesterday',
  },
]

const seedThreads: MessageThread[] = [
  { id: 'm1', propertyId: 'p1', propertyTitle: 'Luxury Penthouse', propertyImage: seedProperties[0].images[0], lastMessage: 'Is this still available?', updatedAt: '2m ago', unread: true },
  { id: 'm2', propertyId: 'p2', propertyTitle: 'Downtown Loft', propertyImage: seedProperties[1].images[0], lastMessage: 'We can schedule a viewing for Friday.', updatedAt: 'Yesterday' },
  { id: 'm3', propertyId: 'p1', propertyTitle: 'Riverside Studio', propertyImage: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=900&q=80', lastMessage: 'Thank you for the application.', updatedAt: 'Mon' },
]

export function App() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('home')
  const [selectedCategory, setSelectedCategory] = useState<(typeof categories)[number]>('All')
  const [query, setQuery] = useState('')
  const [properties] = useState<Property[]>(seedProperties)
  const [threads] = useState<MessageThread[]>(seedThreads)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(seedProperties[0])

  const filtered = useMemo(
    () =>
      properties.filter((property) => {
        const categoryPass = selectedCategory === 'All' || property.type.toLowerCase() === selectedCategory.toLowerCase().replace('s', '')
        const queryPass = !query || property.title.toLowerCase().includes(query.toLowerCase()) || property.location.toLowerCase().includes(query.toLowerCase())
        return categoryPass && queryPass
      }),
    [properties, selectedCategory, query],
  )

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

  if (selectedProperty) return <PropertyDetails property={selectedProperty} onClose={() => setSelectedProperty(null)} />

  return (
    <main className="app-shell">
      <header className="app-header"><button>☰</button><h1>UrbanRent</h1><button>✕</button></header>
      {activeTab === 'home' && (
        <section className="screen">
          <label className="search-box"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search location or property" /></label>
          <div className="chips">{categories.map((category) => <button key={category} onClick={() => setSelectedCategory(category)} className={selectedCategory === category ? 'chip active' : 'chip'}>{category}</button>)}</div>
          <div className="property-grid">{filtered.map((property) => <button className="listing-card" key={property.id} onClick={() => setSelectedProperty(property)}><img src={property.images[0]} alt={property.title} /><div><h3>{property.title}</h3><p>{property.location}</p><strong>${property.price.toLocaleString()} / month</strong></div></button>)}</div>
        </section>
      )}
      {activeTab === 'messages' && <Messages threads={threads} />}
      {activeTab === 'add' && <AddProperty submitProperty={submitProperty} />}

      <nav className="bottom-nav">{tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? 'active' : ''}>{tab === 'add' ? '+ Add' : tab}</button>)}</nav>
    </main>
  )
}

function PropertyDetails({ property, onClose }: { property: Property; onClose: () => void }) {
  return (
    <section className="detail-screen">
      <header className="app-header"><button>☰</button><h1>UrbanRent</h1><button onClick={onClose}>✕</button></header>
      <img className="hero" src={property.images[0]} alt={property.title} />
      <article className="detail-card">
        <h2>{property.title}</h2>
        <p className="muted">📍 {property.location}</p>
        <p className="price">${property.price.toLocaleString()} <span>/ MONTH</span></p>
        <div className="facts"><span>{property.bedrooms} Bed</span><span>{property.bathrooms} Bath</span><span>{property.furnished}</span><span>{property.type}</span></div>
        <p>{property.description}</p>
        <h3>Location</h3>
        <iframe title="Property location" src={`https://www.google.com/maps?q=${encodeURIComponent(property.location)}&output=embed`} />
      </article>
      <div className="floating-actions"><a href={`https://wa.me/${property.landlordPhoneE164.replace('+', '')}`}>WhatsApp</a><button>Message</button></div>
    </section>
  )
}

function AddProperty({ submitProperty }: { submitProperty: (event: FormEvent<HTMLFormElement>) => Promise<void> }) {
  return (
    <section className="screen add-screen">
      <h2>Add Property</h2>
      <form className="add-form" onSubmit={submitProperty}>
        <label className="upload">Photos<input name="images" type="file" multiple accept="image/*" /><span>Click or drag photos here</span></label>
        <label>Property Title<input name="title" required placeholder="e.g. Modern Loft in Downtown" /></label>
        <label>Monthly Rent ($)<input name="price" required type="number" min={1} placeholder="2,500" /></label>
        <label>Property Type<select name="type" required><option>Apartment</option><option>House</option><option>Studio</option><option>Short Let</option></select></label>
        <label>Location<input name="location" required /></label>
        <label>Description<textarea name="description" required rows={4} /></label>
        <button type="submit" className="primary">Publish Property</button>
      </form>
    </section>
  )
}

function Messages({ threads }: { threads: MessageThread[] }) {
  return (
    <section className="screen">
      <h2>Messages</h2>
      <div className="message-list">
        {threads.map((thread) => (
          <article key={thread.id} className={`thread ${thread.unread ? 'unread' : ''}`}>
            <img src={thread.propertyImage} alt={thread.propertyTitle} />
            <div><h4>{thread.propertyTitle}</h4><p>{thread.lastMessage}</p></div>
            <time>{thread.updatedAt}</time>
          </article>
        ))}
      </div>
    </section>
  )
}
