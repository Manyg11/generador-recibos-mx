import Link from 'next/link'

export default function Home() {
  return (
    <main style={{fontFamily: "'Helvetica Neue', Arial, sans-serif", background: '#f5f4f0', minHeight: '100vh'}}>
      
      {/* NAVBAR */}
      <nav style={{background: 'white', borderBottom: '1px solid #e2e0d8', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100}}>
        <span style={{fontWeight: 500, fontSize: '1rem', color: 'black'}}>Generador de Recibos MX</span>
        <div style={{display: 'flex', gap: '12px'}}>
          <Link href="/login" style={{padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e0d8', fontSize: '14px', textDecoration: 'none', color: '#1a1916'}}>
            Iniciar sesión
          </Link>
          <Link href="/registro" style={{padding: '8px 16px', borderRadius: '8px', background: '#1a1916', color: 'white', fontSize: '14px', textDecoration: 'none'}}>
            Crear cuenta gratis
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{textAlign: 'center', padding: '5rem 1rem 3rem'}}>
        <div style={{display: 'inline-block', background: '#d6f0e0', color: '#14532d', fontSize: '11px', fontWeight: 500, padding: '4px 12px', borderRadius: '20px', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1.5rem'}}>
          Para micronegocios y emprendedores
        </div>
        <h1 style={{fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '1rem', color: '#1a1916'}}>
          Cobra profesional<br/>desde el primer recibo
        </h1>
        <p style={{fontSize: '1.1rem', color: '#6b6860', maxWidth: '500px', margin: '0 auto 2.5rem', lineHeight: 1.6}}>
          Genera recibos en segundos, calcula IVA automático, descarga en PDF y comparte por WhatsApp. Sin complicaciones.
        </p>
        <div style={{display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap'}}>
          <Link href="/registro" style={{padding: '12px 28px', borderRadius: '8px', background: '#1a1916', color: 'white', fontSize: '15px', textDecoration: 'none', fontWeight: 500}}>
            Empezar gratis
          </Link>
          <Link href="/planes" style={{padding: '12px 28px', borderRadius: '8px', border: '1px solid #c8c5bb', color: '#1a1916', fontSize: '15px', textDecoration: 'none'}}>
            Ver planes y precios
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{maxWidth: '860px', margin: '0 auto', padding: '2rem 1rem 4rem'}}>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'}}>
          {[
            {titulo: 'Recibos en segundos', desc: 'Llena el formulario, presiona vista previa y listo. Sin pasos complicados.'},
            {titulo: 'IVA y descuentos', desc: 'Cálculos automáticos. Activa o desactiva IVA con un switch.'},
            {titulo: 'PDF profesional', desc: 'Descarga con tu logo y datos. Listo para enviarlo al cliente.'},
            {titulo: 'Historial completo', desc: 'Todos tus recibos guardados en la nube, accesibles desde cualquier dispositivo.'},
          ].map((f, i) => (
            <div key={i} style={{background: 'white', border: '1px solid #e2e0d8', borderRadius: '12px', padding: '1.5rem'}}>
              <h3 style={{fontSize: '15px', fontWeight: 500, marginBottom: '8px', color: '#1a1916'}}>{f.titulo}</h3>
              <p style={{fontSize: '13px', color: '#6b6860', lineHeight: 1.6}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </main>
  )
}
