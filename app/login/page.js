'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Correo o contraseña incorrectos')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <main style={{minHeight: '100vh', background: '#f5f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: "'Helvetica Neue', Arial, sans-serif"}}>
      <div style={{background: 'white', border: '1px solid #e2e0d8', borderRadius: '12px', padding: '2.5rem', width: '100%', maxWidth: '400px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)'}}>
        
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <div style={{fontSize: '13px', color: 'black', marginBottom: '8px', fontWeight: 'bolder'}}>Generador de Recibos MX</div>
          <h1 style={{fontSize: '1.4rem', fontWeight: 500, color: '#1a1916'}}>Iniciar sesión</h1>
        </div>

        {error && (
          <div style={{background: '#fcebeb', color: '#a32d2d', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '1rem'}}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
            <label style={{fontSize: '12px', color: '#6b6860'}}>Correo electrónico</label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              style={{padding: '9px 12px', border: '1px solid #e2e0d8', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', color: 'black'}}
            />
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
            <label style={{fontSize: '12px', color: '#6b6860'}}>Contraseña</label>
            <input
              type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{padding: '9px 12px', border: '1px solid #e2e0d8', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', color: 'black'}}
            />
          </div>
          <button
            type="submit" disabled={loading}
            style={{padding: '10px', background: '#1a1916', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit'}}>
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p style={{textAlign: 'center', fontSize: '13px', color: '#6b6860', marginTop: '1.5rem'}}>
          ¿No tienes cuenta?{' '}
          <Link href="/registro" style={{color: '#1a1916', fontWeight: 500}}>Créala gratis</Link>
        </p>
      </div>
    </main>
  )
}
