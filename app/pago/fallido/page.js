import Link from 'next/link'

export default function PagoFallido() {
  return (
    <main style={{minHeight: '100vh', background: '#f5f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Helvetica Neue', Arial, sans-serif"}}>
      <div style={{background: 'white', border: '1px solid #e2e0d8', borderRadius: '12px', padding: '2.5rem', maxWidth: '400px', width: '100%', textAlign: 'center'}}>
        <div style={{width: '56px', height: '56px', background: '#fcebeb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.5rem'}}>✕</div>
        <h1 style={{fontSize: '1.3rem', fontWeight: 500, marginBottom: '8px', color: '#1a1916'}}>Pago no completado</h1>
        <p style={{fontSize: '14px', color: '#6b6860', lineHeight: 1.6, marginBottom: '1.5rem'}}>Hubo un problema con tu pago. Puedes intentarlo de nuevo.</p>
        <Link href="/planes" style={{display: 'inline-block', padding: '10px 24px', background: '#1a1916', color: 'white', borderRadius: '8px', fontSize: '14px', fontWeight: 500}}>
          Intentar de nuevo →
        </Link>
      </div>
    </main>
  )
}
