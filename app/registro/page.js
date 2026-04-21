'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Registro() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function handleRegistro(e) {
    e.preventDefault()
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError('Hubo un error. Intenta de nuevo.')
      setLoading(false)
    } else {
      setEnviado(true)
    }
  }

  if (enviado) return (
    <main style={{minHeight: '100vh', background: '#f5f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: "'Helvetica Neue', Arial, sans-serif"}}>
      <div style={{background: 'white', border: '1px solid #e2e0d8', borderRadius: '12px', padding: '2.5rem', width: '100%', maxWidth: '400px', textAlign: 'center'}}>
        <div style={{width: '48px', height: '48px', background: '#d6f0e0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '20px'}}>✓</div>
        <h2 style={{fontSize: '1.2rem', fontWeight: 500, marginBottom: '8px'}}>Revisa tu correo</h2>
        <p style={{fontSize: '13px', color: '#6b6860', lineHeight: 1.6}}>
          Te enviamos un link de confirmación a <strong>{email}</strong>. Ábrelo para activar tu cuenta.
        </p>
        <Link href="/login" style={{display: 'inline-block', marginTop: '1.5rem', fontSize: '13px', color: '#1a1916', fontWeight: 500}}>
          Ir al login →
        </Link>
      </div>
    </main>
  )

  return (
    <main style={{minHeight: '100vh', background: '#f5f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: "'Helvetica Neue', Arial, sans-serif"}}>
      <div style={{background: 'white', border: '1px solid #e2e0d8', borderRadius: '12px', padding: '2.5rem', width: '100%', maxWidth: '400px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)'}}>
        
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <div style={{fontSize: '13px', color: 'black', marginBottom: '8px', fontWeight: 'bolder'}}>Generador de Recibos MX</div>
          <h1 style={{fontSize: '1.4rem', fontWeight: 500, color: '#1a1916'}}>Crear cuenta gratis</h1>
          <p style={{fontSize: '13px', color: '#6b6860', marginTop: '4px'}}>5 recibos al mes sin costo</p>
        </div>

        {error && (
          <div style={{background: '#fcebeb', color: '#a32d2d', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '1rem'}}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegistro} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
            <label style={{fontSize: '12px', color: '#6b6860'}}>Correo electrónico</label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              style={{padding: '9px 12px', border: '1px solid #e2e0d8', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', outline: 'none'}}
            />
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
            <label style={{fontSize: '12px', color: '#6b6860'}}>Contraseña</label>
            <input
              type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              style={{padding: '9px 12px', border: '1px solid #e2e0d8', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', color: 'black'}}
            />
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
            <label style={{fontSize: '12px', color: '#6b6860'}}>Confirmar contraseña</label>
            <input
              type="password" required value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repite tu contraseña"
              style={{padding: '9px 12px', border: '1px solid #e2e0d8', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', color: 'black'}}
            />
          </div>
          <button
            type="submit" disabled={loading}
            style={{padding: '10px', background: '#1a1916', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit'}}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
          </button>
        </form>

        <p style={{textAlign: 'center', fontSize: '13px', color: '#6b6860', marginTop: '1.5rem'}}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" style={{color: '#1a1916', fontWeight: 500}}>Inicia sesión</Link>
        </p>
      </div>
    </main>
  )
}
