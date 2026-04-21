import Link from 'next/link'

export default function PagoPendiente() {
  return (
    <main style={{minHeight: '100vh', background: '#f5f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Helvetica Neue', Arial, sans-serif"}}>
      <div style={{background: 'white', border: '1px solid #e2e0d8', borderRadius: '12px', padding: '2.5rem', maxWidth: '400px', width: '100%', textAlign: 'center'}}>
        <div style={{width: '56px', height: '56px', background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.5rem'}}>⏳</div>
        <h1 style={{fontSize: '1.3rem', fontWeight: 500, marginBottom: '8px', color: '#1a1916'}}>Pago pendiente</h1>
        <p style={{fontSize: '14px', color: '#6b6860', lineHeight: 1.6, marginBottom: '1.5rem'}}>Tu pago está siendo procesado. Te avisaremos por correo cuando se confirme.</p>
        <Link href="/dashboard" style={{display: 'inline-block', padding: '10px 24px', background: '#1a1916', color: 'white', borderRadius: '8px', fontSize: '14px', fontWeight: 500}}>
          Ir al dashboard →
        </Link>
      </div>
    </main>
  )
}
