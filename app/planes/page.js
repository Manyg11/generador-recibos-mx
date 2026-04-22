'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@lib/supabase'

export default function Planes() {
 const [anual, setAnual] = useState(false)
const [loadingPlan, setLoadingPlan] = useState(null)
const [user, setUser] = useState(null)

useEffect(() => {
  async function getUser() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) setUser(session.user)
  }
  getUser()
}, [])

  async function handlePago(plan) {
  if (!user) {
    window.location.href = '/registro'
    return
  }
  setLoadingPlan(plan)
  try {
    const res = await fetch('/api/crear-preferencia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan,
        userEmail: user.email,
        userId: user.id,
      })
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  } catch (e) {
    alert('Error al procesar el pago. Intenta de nuevo.')
  } finally {
    setLoadingPlan(null)
  }
}

  return (
    <main style={{minHeight: '100vh', background: '#f5f4f0', fontFamily: "'Helvetica Neue', Arial, sans-serif"}}>

      {/* NAVBAR */}
      <nav style={{background: 'white', borderBottom: '1px solid #e2e0d8', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100}}>
  <Link href="/" style={{fontWeight: 500, fontSize: '1rem', color: '#1a1916'}}>Generador de Recibos MX</Link>
  <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
    {user ? (
      <>
        <span style={{fontSize: '13px', color: '#6b6860'}}>{user.email}</span>
        <Link href="/dashboard" style={{padding: '8px 16px', borderRadius: '8px', background: '#1a1916', color: 'white', fontSize: '14px'}}>
          Ir al dashboard
        </Link>
      </>
    ) : (
      <>
        <Link href="/login" style={{padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e0d8', fontSize: '14px', color: '#1a1916'}}>Iniciar sesión</Link>
        <Link href="/registro" style={{padding: '8px 16px', borderRadius: '8px', background: '#1a1916', color: 'white', fontSize: '14px'}}>Crear cuenta gratis</Link>
      </>
    )}
  </div>
</nav>

      <div style={{maxWidth: '860px', margin: '0 auto', padding: '3rem 1rem 4rem'}}>

        {/* HERO */}
        <div style={{textAlign: 'center', marginBottom: '3rem'}}>
          <h1 style={{fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 500, letterSpacing: '-0.02em', color: '#1a1916', marginBottom: '0.75rem'}}>
            Planes y precios
          </h1>
          <p style={{fontSize: '1rem', color: '#6b6860', marginBottom: '1.5rem'}}>Sin contratos. Sin letras chicas. Cancela cuando quieras.</p>

          {/* TOGGLE MENSUAL/ANUAL */}
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '14px'}}>
            <span style={{color: !anual ? '#1a1916' : '#6b6860', fontWeight: !anual ? 500 : 400}}>Mensual</span>
            <div onClick={() => setAnual(!anual)} style={{width: '44px', height: '24px', borderRadius: '24px', background: anual ? '#1a1916' : '#c8c5bb', cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0}}>
              <div style={{position: 'absolute', width: '18px', height: '18px', borderRadius: '50%', background: 'white', top: '3px', left: anual ? '23px' : '3px', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'}} />
            </div>
            <span style={{color: anual ? '#1a1916' : '#6b6860', fontWeight: anual ? 500 : 400}}>
              Anual <span style={{background: '#fef3c7', color: '#854d0e', fontSize: '10px', fontWeight: 500, padding: '2px 8px', borderRadius: '20px', marginLeft: '4px'}}>Ahorra 33%</span>
            </span>
          </div>
        </div>

        {/* CARDS */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '3rem'}}>

          {/* GRATIS */}
          <div style={{background: 'white', border: '1px solid #e2e0d8', borderRadius: '12px', padding: '1.75rem', display: 'flex', flexDirection: 'column'}}>
            <div style={{fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9e9b93', marginBottom: '0.5rem'}}>Gratis</div>
            <div style={{fontSize: '2.2rem', fontWeight: 500, letterSpacing: '-0.03em', color: '#1a1916', lineHeight: 1, marginBottom: '4px'}}><sup style={{fontSize: '1rem', fontWeight: 400}}>$</sup>0</div>
            <div style={{fontSize: '12px', color: '#9e9b93', marginBottom: '1.25rem'}}>para siempre</div>
            <div style={{fontSize: '13px', color: '#6b6860', marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid #e2e0d8', lineHeight: 1.5}}>Para probar sin compromiso. Sin tarjeta requerida.</div>
            <ul style={{listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem', flex: 1}}>
              {[
                {ok: true, txt: '5 recibos por mes'},
                {ok: true, txt: 'PDF descargable'},
                {ok: true, txt: 'Cálculo de IVA y descuentos'},
                {ok: false, txt: 'Marca de agua en PDF'},
                {ok: false, txt: 'Sin logo propio'},
                {ok: false, txt: 'Historial solo 30 días'},
              ].map((f, i) => <FeatureRow key={i} ok={f.ok} txt={f.txt} />)}
            </ul>
            <Link href="/registro" style={{display: 'block', textAlign: 'center', padding: '10px', borderRadius: '8px', border: '1px solid #c8c5bb', fontSize: '14px', fontWeight: 500, color: '#1a1916'}}>
              Empezar gratis
            </Link>
          </div>

          {/* PRO */}
          <div style={{background: 'white', border: '2px solid #1a1916', borderRadius: '12px', padding: '1.75rem', display: 'flex', flexDirection: 'column', position: 'relative'}}>
            <div style={{position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: '#1a1916', color: 'white', fontSize: '10px', fontWeight: 500, padding: '3px 14px', borderRadius: '20px', whiteSpace: 'nowrap', letterSpacing: '0.05em', textTransform: 'uppercase'}}>
              Más popular
            </div>
            <div style={{fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9e9b93', marginBottom: '0.5rem'}}>Pro</div>
            <div style={{fontSize: '2.2rem', fontWeight: 500, letterSpacing: '-0.03em', color: '#1a1916', lineHeight: 1, marginBottom: '4px'}}>
              <sup style={{fontSize: '1rem', fontWeight: 400}}>$</sup>{anual ? '66' : '99'}
            </div>
            <div style={{fontSize: '12px', color: '#9e9b93', marginBottom: '1.25rem'}}>
              MXN / mes {anual ? '· facturado anualmente' : '· cancela cuando quieras'}
            </div>
            <div style={{fontSize: '13px', color: '#6b6860', marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid #e2e0d8', lineHeight: 1.5}}>Para negocios activos que emiten recibos constantemente.</div>
            <ul style={{listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem', flex: 1}}>
              {[
                'Recibos ilimitados',
                'PDF sin marca de agua',
                'Logo propio en cada recibo',
                'Historial completo',
                'Acceso desde cualquier dispositivo',
                'Soporte por WhatsApp',
              ].map((txt, i) => <FeatureRow key={i} ok={true} txt={txt} />)}
            </ul>
        <button
            onClick={() => handlePago(anual ? 'anual' : 'mensual')}
            disabled={loadingPlan !== null}
            style={{display: 'block', width: '100%', textAlign: 'center', padding: '10px', borderRadius: '8px', background: '#1a1916', color: 'white', fontSize: '14px', fontWeight: 500, border: 'none', cursor: loadingPlan ? 'not-allowed' : 'pointer', opacity: loadingPlan ? 0.7 : 1, fontFamily: 'inherit'}}>
            {loadingPlan === (anual ? 'anual' : 'mensual') ? 'Redirigiendo...' : anual ? 'Contratar por $799/año' : 'Contratar por $99/mes'}
        </button>
          </div>

        </div>

        {/* FAQ */}
        <div>
          <div style={{fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9e9b93', textAlign: 'center', marginBottom: '1.25rem'}}>Preguntas frecuentes</div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px'}}>
            {[
              {q: '¿Necesito saber de contabilidad?', a: 'Para nada. La app hace todos los cálculos sola. Solo llenas los datos y listo.'},
              {q: '¿Los recibos son válidos legalmente?', a: 'Son comprobantes de operación. Para facturas con validez ante el SAT necesitas un CFDI, que es diferente.'},
              {q: '¿Puedo cancelar en cualquier momento?', a: 'Sí, sin preguntas ni penalizaciones. Tu historial de recibos se conserva aunque canceles.'},
              {q: '¿Qué métodos de pago aceptan?', a: 'Tarjeta de crédito/débito, OXXO y transferencia bancaria, todo procesado por MercadoPago.'},
            ].map((f, i) => (
              <div key={i} style={{background: 'white', border: '1px solid #e2e0d8', borderRadius: '10px', padding: '1rem 1.25rem'}}>
                <h4 style={{fontSize: '13px', fontWeight: 500, color: '#1a1916', marginBottom: '6px'}}>{f.q}</h4>
                <p style={{fontSize: '13px', color: '#6b6860', lineHeight: 1.6}}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TRUST */}
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginTop: '2.5rem', flexWrap: 'wrap'}}>
          {['Pago seguro con MercadoPago', 'Cancela cuando quieras', 'Sin contratos ni letras chicas', 'Funciona en celular y computadora'].map((txt, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b6860'}}>
              <div style={{width: '6px', height: '6px', borderRadius: '50%', background: '#14532d', flexShrink: 0}} />
              {txt}
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}

function FeatureRow({ ok, txt }) {
  return (
    <li style={{display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: ok ? '#1a1916' : '#9e9b93'}}>
      <div style={{width: '16px', height: '16px', borderRadius: '50%', background: ok ? '#d6f0e0' : '#f1efe8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px'}}>
        {ok
          ? <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><polyline points="2,5 4,7 8,3" stroke="#27500A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          : <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><line x1="3" y1="3" x2="7" y2="7" stroke="#9e9b93" strokeWidth="1.5" strokeLinecap="round"/><line x1="7" y1="3" x2="3" y2="7" stroke="#9e9b93" strokeWidth="1.5" strokeLinecap="round"/></svg>
        }
      </div>
      {txt}
    </li>
  )
}
