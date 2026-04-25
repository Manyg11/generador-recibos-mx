'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      setProfile(prof)
      setLoading(false)
    }
    getUser()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <main style={{minHeight: '100vh', background: '#f5f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Helvetica Neue', Arial, sans-serif"}}>
      <p style={{color: '#6b6860', fontSize: '14px'}}>Cargando...</p>
    </main>
  )

  return (
    <main style={{minHeight: '100vh', background: '#f5f4f0', fontFamily: "'Helvetica Neue', Arial, sans-serif"}}>
      <nav style={{background: 'white', borderBottom: '1px solid #e2e0d8', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100}}>
        <span style={{fontWeight: 500, fontSize: '1rem'}}>Generador de Recibos MX</span>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <span style={{fontSize: '11px', fontWeight: 500, padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.05em', background: profile?.plan === 'pro' ? '#d6f0e0' : '#f1efe8', color: profile?.plan === 'pro' ? '#14532d' : '#5f5e5a'}}>
            {profile?.plan === 'pro' ? 'Pro' : 'Gratis'}
          </span>
          <span style={{fontSize: '13px', color: '#6b6860'}}>{user?.email}</span>
          {profile?.plan !== 'pro' && (
            <a href="/planes" style={{padding: '7px 14px', borderRadius: '8px', background: '#1a1916', color: 'white', fontSize: '12px', textDecoration: 'none', fontWeight: 500}}>Mejorar a Pro</a>
          )}
          <button onClick={handleLogout} style={{padding: '7px 14px', borderRadius: '8px', border: '1px solid #e2e0d8', background: 'transparent', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', color: '#6b6860'}}>Salir</button>
        </div>
      </nav>

      {profile?.plan !== 'pro' && (
        <div style={{background: '#fef3c7', borderBottom: '1px solid #fde68a', padding: '10px 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span style={{fontSize: '13px', color: '#854d0e'}}>Plan gratuito — {profile?.recibos_mes || 0}/5 recibos usados este mes</span>
          <a href="/planes" style={{fontSize: '12px', color: '#854d0e', fontWeight: 500, textDecoration: 'underline'}}>Ver plan Pro →</a>
        </div>
      )}

      <div style={{maxWidth: '820px', margin: '0 auto', padding: '1.5rem 1rem 4rem'}}>
        <GeneradorRecibos user={user} profile={profile} onReciboGuardado={() => {
          setProfile(p => ({...p, recibos_mes: (p?.recibos_mes || 0) + 1}))
        }} />
      </div>
    </main>
  )
}

function GeneradorRecibos({ user, profile, onReciboGuardado }) {
  const [items, setItems] = useState([{ id: Date.now(), desc: '', qty: '', price: '' }])
  const [tab, setTab] = useState('form')
  const [recibos, setRecibos] = useState([])
  const [ivaOn, setIvaOn] = useState(false)
  const [descOn, setDescOn] = useState(false)
  const [descPct, setDescPct] = useState('')
  const [logo, setLogo] = useState(null)
  const logoInputRef = useRef(null)
  const [form, setForm] = useState({
    num: '', fecha: new Date().toISOString().split('T')[0],
    tipo: 'Recibo', bizNombre: '', bizRfc: '', bizTel: '',
    bizEmail: '', bizDir: '', cliNombre: '', cliRfc: '',
    cliDir: '', metodo: 'Efectivo', estado: 'pagado', notas: ''
  })

  useEffect(() => {
    const savedLogo = localStorage.getItem('recibos_logo')
    if (savedLogo) setLogo(savedLogo)

    const bizGuardado = localStorage.getItem('recibos_biz')
    if (bizGuardado) {
      try {
        const biz = JSON.parse(bizGuardado)
        setForm(f => ({
          ...f,
          bizNombre: biz.nombre || '',
          bizRfc: biz.rfc || '',
          bizTel: biz.tel || '',
          bizEmail: biz.email || '',
          bizDir: biz.dir || ''
        }))
      } catch(e) {}
    }
    cargarRecibos()
    generarNumero()
  }, [])

  function saveBiz(field, value) {
    const current = JSON.parse(localStorage.getItem('recibos_biz') || '{}')
    const map = { bizNombre: 'nombre', bizRfc: 'rfc', bizTel: 'tel', bizEmail: 'email', bizDir: 'dir' }
    if (map[field]) {
      current[map[field]] = value
      localStorage.setItem('recibos_biz', JSON.stringify(current))
    }
  }

  function handleLogo(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target.result
      setLogo(dataUrl)
      localStorage.setItem('recibos_logo', dataUrl)
    }
    reader.readAsDataURL(file)
  }

  function removeLogo() {
    setLogo(null)
    localStorage.removeItem('recibos_logo')
    if (logoInputRef.current) logoInputRef.current.value = ''
  }

  async function generarNumero() {
    const { count } = await supabase.from('recibos').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    setForm(f => ({ ...f, num: 'REC-' + String((count || 0) + 1).padStart(4, '0') }))
  }

  async function cargarRecibos() {
    const { data } = await supabase.from('recibos').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setRecibos(data || [])
  }

  function calcTotals() {
    const sub = items.reduce((a, i) => a + ((parseFloat(i.qty) || 0) * (parseFloat(i.price) || 0)), 0)
    const descAmt = descOn ? sub * ((parseFloat(descPct) || 0) / 100) : 0
    const base = sub - descAmt
    const iva = ivaOn ? base * 0.16 : 0
    return { sub, descAmt, iva, total: base + iva }
  }

  function fmt(n) { return parseFloat(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') }

  function setF(k, v) {
    setForm(f => ({ ...f, [k]: v }))
    saveBiz(k, v)
  }

  function updateItem(id, field, value) {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  async function guardarRecibo() {
    const isPlanGratis = profile?.plan !== 'pro'
    const mesActual = new Date().toISOString().slice(0, 7)
    if (isPlanGratis && profile?.mes_actual === mesActual && (profile?.recibos_mes || 0) >= 5) {
      alert('Alcanzaste el límite de 5 recibos del plan gratuito. Mejora a Pro para continuar.')
      return
    }
    const t = calcTotals()
    const { error } = await supabase.from('recibos').upsert({
      user_id: user.id,
      numero: form.num, fecha: form.fecha, tipo: form.tipo,
      cli_nombre: form.cliNombre, cli_rfc: form.cliRfc, cli_dir: form.cliDir,
      items, subtotal: t.sub, descuento: t.descAmt, iva: t.iva, total: t.total,
      iva_on: ivaOn, desc_on: descOn, desc_pct: descPct,
      metodo: form.metodo, estado: form.estado, notas: form.notas
    })
    if (!error) {
      await supabase.from('profiles').update({
        recibos_mes: (profile?.recibos_mes || 0) + 1,
        mes_actual: mesActual,
        biz_nombre: form.bizNombre, biz_rfc: form.bizRfc,
        biz_tel: form.bizTel, biz_email: form.bizEmail, biz_dir: form.bizDir
      }).eq('id', user.id)
      onReciboGuardado()
      cargarRecibos()
      alert('✓ Recibo guardado en la nube.')
    }
  }

  const t = calcTotals()
  const s = {
    input: { padding: '8px 11px', border: '1px solid #e2e0d8', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', width: '100%', background: 'white', color: '#1a1916' },
    section: { background: 'white', border: '1px solid #e2e0d8', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '1rem' },
    label: { fontSize: '12px', color: '#6b6860', display: 'block', marginBottom: '4px' },
    sectionTitle: { fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9e9b93', marginBottom: '12px' }
  }

  const initials = (form.bizNombre || 'N').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()

  return (
    <div>
      {/* TABS */}
      <div style={{display: 'flex', borderBottom: '1px solid #e2e0d8', marginBottom: '1.5rem', background: 'white', borderRadius: '12px 12px 0 0', padding: '0 1rem'}}>
        {['form','preview','history'].map((t2, i) => (
          <button key={t2} onClick={() => setTab(t2)} style={{background: 'none', border: 'none', borderBottom: `2px solid ${tab === t2 ? '#1a1916' : 'transparent'}`, padding: '12px 16px', fontSize: '14px', fontFamily: 'inherit', color: tab === t2 ? '#1a1916' : '#6b6860', cursor: 'pointer', marginBottom: '-1px'}}>
            {['Nuevo recibo', 'Vista previa', 'Historial'][i]}
          </button>
        ))}
      </div>

      {/* ===== FORMULARIO ===== */}
      {tab === 'form' && (
        <div>
          {/* DATOS DEL RECIBO */}
          <div style={s.section}>
            <div style={s.sectionTitle}>Datos del recibo</div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px'}}>
              <div><label style={s.label}>Número</label><input style={{...s.input, background: '#f5f4f0', color: '#6b6860'}} value={form.num} readOnly /></div>
              <div><label style={s.label}>Fecha</label><input style={s.input} type="date" value={form.fecha} onChange={e => setF('fecha', e.target.value)} /></div>
              <div><label style={s.label}>Tipo</label>
                <select style={s.input} value={form.tipo} onChange={e => setF('tipo', e.target.value)}>
                  <option>Recibo</option><option>Nota de venta</option><option>Factura simple</option><option>Cotización</option>
                </select>
              </div>
            </div>
          </div>

          {/* TU NEGOCIO */}
          <div style={s.section}>
            <div style={s.sectionTitle}>Tu negocio (emisor)</div>

            {/* LOGO UPLOADER */}
            <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e2e0d8'}}>
              <div
                onClick={() => logoInputRef.current?.click()}
                style={{width: '72px', height: '72px', borderRadius: '8px', border: '1px dashed #c8c5bb', background: '#f5f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0}}
              >
                {logo
                  ? <img src={logo} alt="Logo" style={{width: '100%', height: '100%', objectFit: 'contain'}} />
                  : <span style={{fontSize: '11px', color: '#9e9b93', textAlign: 'center', lineHeight: 1.4, padding: '6px'}}>Haz clic para subir logo</span>
                }
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
                <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogo} style={{display: 'none'}} />
                <button onClick={() => logoInputRef.current?.click()} style={{padding: '6px 14px', border: '1px solid #c8c5bb', borderRadius: '8px', background: 'transparent', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit'}}>
                  {logo ? 'Cambiar logo' : 'Subir logo'}
                </button>
                {logo && (
                  <button onClick={removeLogo} style={{padding: '6px 14px', border: '1px solid #e2a0a0', borderRadius: '8px', background: 'transparent', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', color: '#a32d2d'}}>
                    Quitar logo
                  </button>
                )}
                <span style={{fontSize: '11px', color: '#9e9b93'}}>PNG, JPG o SVG. Se guarda automáticamente.</span>
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
              <div><label style={s.label}>Nombre o razón social</label><input style={s.input} value={form.bizNombre} onChange={e => setF('bizNombre', e.target.value)} placeholder="Ej. Servicios García" /></div>
              <div>
                <label style={s.label}>
                  RFC
                  <button onClick={() => setF('bizRfc', '')} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#9e9b93', textDecoration: 'underline', fontFamily: 'inherit', padding: '0', marginLeft: '6px'}}>limpiar</button>
                </label>
                <input style={s.input} value={form.bizRfc} onChange={e => setF('bizRfc', e.target.value)} placeholder="Opcional" />
              </div>
              <div><label style={s.label}>Teléfono</label><input style={s.input} value={form.bizTel} onChange={e => setF('bizTel', e.target.value)} placeholder="449 123 4567" /></div>
              <div><label style={s.label}>Correo</label><input style={s.input} type="email" value={form.bizEmail} onChange={e => setF('bizEmail', e.target.value)} placeholder="tu@correo.com" /></div>
              <div style={{gridColumn: '1/-1'}}><label style={s.label}>Dirección</label><input style={s.input} value={form.bizDir} onChange={e => setF('bizDir', e.target.value)} placeholder="Calle, número, colonia, ciudad" /></div>
            </div>
          </div>

          {/* CLIENTE */}
          <div style={s.section}>
            <div style={s.sectionTitle}>Cliente</div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
              <div><label style={s.label}>Nombre</label><input style={s.input} value={form.cliNombre} onChange={e => setF('cliNombre', e.target.value)} placeholder="Nombre o empresa" /></div>
              <div><label style={s.label}>RFC (opcional)</label><input style={s.input} value={form.cliRfc} onChange={e => setF('cliRfc', e.target.value)} placeholder="RFC del cliente" /></div>
              <div style={{gridColumn: '1/-1'}}><label style={s.label}>Dirección / Contacto</label><input style={s.input} value={form.cliDir} onChange={e => setF('cliDir', e.target.value)} placeholder="Opcional" /></div>
            </div>
          </div>

          {/* PRODUCTOS */}
          <div style={s.section}>
            <div style={s.sectionTitle}>Productos / Servicios</div>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr>
                  {['Descripción','Cant.','Precio unit.','Subtotal',''].map((h,i) => (
                    <th key={i} style={{fontSize: '11px', color: '#9e9b93', textAlign: 'left', padding: '4px 6px 8px', borderBottom: '1px solid #e2e0d8', fontWeight: 500}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td style={{padding: '4px'}}>
                      <input style={s.input} value={item.desc} placeholder="Descripción" onChange={e => updateItem(item.id, 'desc', e.target.value)} />
                    </td>
                    <td style={{padding: '4px', width: '80px'}}>
                      <input
                        style={{...s.input, textAlign: 'center'}}
                        type="number" min="1"
                        value={item.qty}
                        placeholder="1"
                        onFocus={e => e.target.select()}
                        onChange={e => updateItem(item.id, 'qty', e.target.value)}
                      />
                    </td>
                    <td style={{padding: '4px', width: '130px'}}>
                      <input
                        style={s.input}
                        type="number" min="0"
                        value={item.price}
                        placeholder="0.00"
                        onFocus={e => e.target.select()}
                        onChange={e => updateItem(item.id, 'price', e.target.value)}
                      />
                    </td>
                    <td style={{padding: '4px 8px', fontSize: '13px', color: '#6b6860', whiteSpace: 'nowrap'}}>
                      ${fmt((parseFloat(item.qty) || 0) * (parseFloat(item.price) || 0))}
                    </td>
                    <td style={{padding: '4px'}}>
                      <button onClick={() => items.length > 1 && setItems(items.filter(i => i.id !== item.id))} style={{background: 'none', border: '1px solid #e2e0d8', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', color: '#6b6860', fontSize: '16px', lineHeight: 1}}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => setItems([...items, {id: Date.now(), desc: '', qty: '', price: ''}])} style={{marginTop: '10px', padding: '6px 12px', border: '1px solid #e2e0d8', borderRadius: '8px', background: 'transparent', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit'}}>
              + Agregar línea
            </button>

            <div style={{marginTop: '1rem', borderTop: '1px solid #e2e0d8', paddingTop: '1rem'}}>
              <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center', fontSize: '13px'}}>
                <label style={{display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'}}>
                  <input type="checkbox" checked={ivaOn} onChange={e => setIvaOn(e.target.checked)} /> IVA (16%)
                </label>
                <label style={{display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'}}>
                  <input type="checkbox" checked={descOn} onChange={e => setDescOn(e.target.checked)} /> Descuento
                </label>
                {descOn && (
                  <input
                    type="number" min="0" max="100"
                    value={descPct}
                    placeholder="%"
                    onFocus={e => e.target.select()}
                    onChange={e => setDescPct(e.target.value)}
                    style={{width: '70px', padding: '4px 8px', border: '1px solid #e2e0d8', borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit'}}
                  />
                )}
              </div>
              <div style={{maxWidth: '280px', marginLeft: 'auto'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b6860', padding: '3px 0'}}><span>Subtotal</span><span>${fmt(t.sub)}</span></div>
                {descOn && <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#b45309', padding: '3px 0'}}><span>Descuento ({descPct}%)</span><span>-${fmt(t.descAmt)}</span></div>}
                {ivaOn && <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b6860', padding: '3px 0'}}><span>IVA (16%)</span><span>${fmt(t.iva)}</span></div>}
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 500, padding: '10px 0 0', marginTop: '6px', borderTop: '1.5px solid #1a1916'}}><span>Total</span><span>${fmt(t.total)}</span></div>
              </div>
            </div>
          </div>

          {/* PAGO */}
          <div style={s.section}>
            <div style={s.sectionTitle}>Pago y estado</div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
              <div><label style={s.label}>Método de pago</label>
                <select style={s.input} value={form.metodo} onChange={e => setF('metodo', e.target.value)}>
                  <option>Efectivo</option><option>Transferencia bancaria</option><option>Tarjeta</option><option>Otro</option>
                </select>
              </div>
              <div><label style={s.label}>Estado</label>
                <select style={s.input} value={form.estado} onChange={e => setF('estado', e.target.value)}>
                  <option value="pagado">Pagado</option><option value="pendiente">Pendiente de pago</option>
                </select>
              </div>
            </div>
          </div>

          {/* NOTAS */}
          <div style={s.section}>
            <div style={s.sectionTitle}>Notas adicionales</div>
            <textarea style={{...s.input, minHeight: '70px', resize: 'vertical'}} value={form.notas} onChange={e => setF('notas', e.target.value)} placeholder="Ej. Gracias por su preferencia." />
          </div>

          <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '1rem'}}>
            <button onClick={() => setTab('preview')} style={{padding: '10px 20px', background: '#1a1916', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit'}}>Vista previa</button>
            <button onClick={guardarRecibo} style={{padding: '10px 20px', background: 'transparent', border: '1px solid #c8c5bb', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit'}}>Guardar en historial</button>
            <button onClick={() => {
              setForm(f => ({...f, cliNombre: '', cliRfc: '', cliDir: '', metodo: 'Efectivo', estado: 'pagado', notas: ''}))
              setItems([{id: Date.now(), desc: '', qty: '', price: ''}])
              setIvaOn(false); setDescOn(false); setDescPct('')
              generarNumero()
            }} style={{padding: '10px 20px', background: 'transparent', border: '1px solid #c8c5bb', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit'}}>Nuevo recibo</button>
          </div>
        </div>
      )}

      {/* ===== VISTA PREVIA ===== */}
      {tab === 'preview' && (
        <div>
          <div id="receipt-preview-content" style={{background: 'white', border: '1px solid #e2e0d8', borderRadius: '12px', padding: '2.5rem', maxWidth: '640px', margin: '0 auto 1.5rem', fontFamily: 'Georgia, serif', color: '#1a1a1a'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem'}}>
              {logo
                ? <img src={logo} alt="Logo" style={{width: '72px', height: '72px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e8e5e0'}} />
                : <div style={{width: '72px', height: '72px', borderRadius: '8px', background: '#f0ede8', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', color: '#555', fontFamily: 'sans-serif'}}>{initials}</div>
              }
              <div style={{textAlign: 'right'}}>
                <h2 style={{fontSize: '1.1rem', fontWeight: 'normal', marginBottom: '4px'}}>{form.bizNombre || 'Tu negocio'}</h2>
                <p style={{fontSize: '12px', color: '#777', lineHeight: 1.6, fontFamily: 'sans-serif'}}>
                  {form.bizRfc && `RFC: ${form.bizRfc}`}{form.bizRfc && <br/>}
                  {form.bizTel}{form.bizEmail && ` · ${form.bizEmail}`}
                  {form.bizDir && <><br/>{form.bizDir}</>}
                </p>
              </div>
            </div>
            <div style={{display: 'flex', border: '1px solid #e8e5e0', borderRadius: '8px', overflow: 'hidden', marginBottom: '2rem'}}>
              {[['Tipo', form.tipo], ['Número', form.num], ['Fecha', form.fecha]].map(([l, v]) => (
                <div key={l} style={{flex: 1, padding: '10px 14px', borderRight: '1px solid #e8e5e0', fontFamily: 'sans-serif'}}>
                  <div style={{fontSize: '10px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px'}}>{l}</div>
                  <div style={{fontSize: '13px', fontWeight: 500}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{marginBottom: '1.75rem'}}>
              <div style={{fontSize: '10px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px', fontFamily: 'sans-serif'}}>Cliente</div>
              <p style={{fontSize: '13px', lineHeight: 1.6}}><strong>{form.cliNombre || '—'}</strong>{form.cliRfc && ` · RFC: ${form.cliRfc}`}</p>
              {form.cliDir && <p style={{fontSize: '12px', color: '#999', fontFamily: 'sans-serif'}}>{form.cliDir}</p>}
            </div>
            <table style={{width: '100%', borderCollapse: 'collapse', marginBottom: '1rem', fontFamily: 'sans-serif'}}>
              <thead>
                <tr>
                  {['Descripción','Cant.','Precio unit.','Subtotal'].map((h, i) => (
                    <th key={h} style={{fontSize: '11px', color: '#aaa', textAlign: i > 1 ? 'right' : i === 1 ? 'center' : 'left', padding: '6px 8px', borderBottom: '1px solid #e8e5e0', textTransform: 'uppercase', letterSpacing: '0.05em'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.filter(i => i.desc || i.price).map(i => (
                  <tr key={i.id}>
                    <td style={{padding: '9px 8px', borderBottom: '1px solid #f0ede8', fontSize: '13px'}}>{i.desc || '—'}</td>
                    <td style={{padding: '9px 8px', borderBottom: '1px solid #f0ede8', fontSize: '13px', textAlign: 'center'}}>{i.qty}</td>
                    <td style={{padding: '9px 8px', borderBottom: '1px solid #f0ede8', fontSize: '13px', textAlign: 'right'}}>${fmt(i.price)}</td>
                    <td style={{padding: '9px 8px', borderBottom: '1px solid #f0ede8', fontSize: '13px', textAlign: 'right'}}>${fmt((parseFloat(i.qty)||0)*(parseFloat(i.price)||0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
              <div style={{width: '240px', fontFamily: 'sans-serif'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#777', padding: '3px 0'}}><span>Subtotal</span><span>${fmt(t.sub)}</span></div>
                {descOn && <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#b45309', padding: '3px 0'}}><span>Descuento ({descPct}%)</span><span>-${fmt(t.descAmt)}</span></div>}
                {ivaOn && <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#777', padding: '3px 0'}}><span>IVA (16%)</span><span>${fmt(t.iva)}</span></div>}
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 500, padding: '10px 0 0', marginTop: '6px', borderTop: '1.5px solid #1a1a1a', fontFamily: 'Georgia, serif'}}><span>Total</span><span>${fmt(t.total)}</span></div>
              </div>
            </div>
            <div style={{marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e8e5e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'sans-serif'}}>
              <div>
                <div style={{fontSize: '10px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px'}}>Forma de pago</div>
                <div style={{fontSize: '13px'}}>{form.metodo}</div>
              </div>
              <span style={{padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, background: form.estado === 'pagado' ? '#d6f0e0' : '#fef3c7', color: form.estado === 'pagado' ? '#14532d' : '#854d0e'}}>
                {form.estado === 'pagado' ? 'Pagado' : 'Pendiente'}
              </span>
            </div>
            {form.notas && <div style={{marginTop: '1rem', fontSize: '12px', color: '#999', fontStyle: 'italic', fontFamily: 'sans-serif'}}>{form.notas}</div>}
          </div>

          {/* BOTONES VISTA PREVIA */}
          <div style={{display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap'}}>

            {/* DESCARGAR PDF */}
            <button onClick={() => {
              const estilos = `
                *{box-sizing:border-box;margin:0;padding:0}
                body{font-family:Georgia,serif;color:#1a1a1a;padding:2rem;background:white;max-width:680px;margin:0 auto}
                table{width:100%;border-collapse:collapse}
                img{max-width:100%}
                @media print{body{padding:0}}
              `
              const contenido = document.getElementById('receipt-preview-content')?.innerHTML || ''
              const win = window.open('', '_blank')
              win.document.write(`<!DOCTYPE html>
                <html><head>
                  <meta charset="UTF-8">
                  <title>Recibo ${form.num}</title>
                  <style>${estilos}</style>
                </head>
                <body>
                  ${contenido}
                  <script>
                    window.onload = function() {
                      setTimeout(function() { window.print(); }, 500);
                    }
                  <\/script>
                </body></html>`)
              win.document.close()
            }} style={{padding: '10px 20px', background: '#1a1916', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit'}}>
              Descargar PDF
            </button>

            {/* COMPARTIR */}
<button onClick={() => {
  // Paso 1 — Abrir PDF
  const estilos = `
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Georgia,serif;color:#1a1a1a;padding:2rem;background:white;max-width:680px;margin:0 auto}
    table{width:100%;border-collapse:collapse}
    img{max-width:100%}
    @media print{body{padding:0}}
  `
  const contenido = document.getElementById('receipt-preview-content')?.innerHTML || ''
  const win = window.open('', '_blank')
  win.document.write(`<!DOCTYPE html>
    <html><head>
      <meta charset="UTF-8">
      <title>Recibo ${form.num}</title>
      <style>${estilos}</style>
    </head>
    <body>
      ${contenido}
      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 500);
        }
      <\/script>
    </body></html>`)
  win.document.close()

  // Paso 2 — Abrir WhatsApp después de 2 segundos
  const texto =
    `*${form.tipo} ${form.num}*\n` +
    `Fecha: ${form.fecha}\n\n` +
    `*${form.bizNombre || 'Mi negocio'}*\n\n` +
    `Cliente: ${form.cliNombre || '—'}\n\n` +
    `*Conceptos:*\n` +
    items.filter(i => i.desc || i.price).map(i =>
      `  • ${i.desc || '—'} (${i.qty} x $${fmt(i.price)}) = $${fmt((parseFloat(i.qty)||0)*(parseFloat(i.price)||0))}`
    ).join('\n') + '\n\n' +
    (descOn ? `Descuento (${descPct}%): -$${fmt(t.descAmt)}\n` : '') +
    (ivaOn ? `IVA (16%): $${fmt(t.iva)}\n` : '') +
    `*Total: $${fmt(t.total)} MXN*\n` +
    `Pago: ${form.metodo} · ${form.estado === 'pagado' ? 'Pagado ✓' : 'Pendiente'}\n\n` +
    `📎 Guarda el PDF que se abrió y adjúntalo a este chat.\n\n` +
    (form.notas || 'Gracias por su preferencia.')

  setTimeout(() => {
    window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank')
  }, 2000)

}} style={{padding: '10px 20px', background: 'transparent', border: '1px solid #c8c5bb', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit'}}>
  Compartir por WhatsApp
</button>

          </div>
        </div>
      )}

      {/* ===== HISTORIAL ===== */}
      {tab === 'history' && (
        <div>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', gap: '10px'}}>
            <input placeholder="Buscar por cliente o número..." style={{flex: 1, maxWidth: '300px', padding: '8px 12px', border: '1px solid #e2e0d8', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit'}} />
            <button onClick={() => setTab('form')} style={{padding: '8px 16px', border: '1px solid #c8c5bb', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', background: 'transparent'}}>+ Nuevo recibo</button>
          </div>
          {recibos.length === 0 ? (
            <div style={{textAlign: 'center', padding: '3rem', color: '#6b6860', fontSize: '14px'}}>No hay recibos guardados aún.</div>
          ) : recibos.map(r => (
            <div key={r.id} style={{background: 'white', border: '1px solid #e2e0d8', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'}}
              onClick={() => {
                setForm(f => ({...f, num: r.numero, fecha: r.fecha, tipo: r.tipo, cliNombre: r.cli_nombre || '', cliRfc: r.cli_rfc || '', cliDir: r.cli_dir || '', metodo: r.metodo, estado: r.estado, notas: r.notas || ''}))
                setItems(r.items?.length ? r.items : [{id: Date.now(), desc: '', qty: '', price: ''}])
                setIvaOn(r.iva_on); setDescOn(r.desc_on); setDescPct(r.desc_pct || '')
                setTab('form')
              }}>
              <div>
                <div style={{fontWeight: 500, fontSize: '14px', marginBottom: '2px'}}>{r.numero} · {r.cli_nombre || 'Sin nombre'}</div>
                <div style={{fontSize: '12px', color: '#6b6860'}}>{r.fecha} · {r.tipo} · <strong>${fmt(r.total)}</strong> MXN</div>
              </div>
              <span style={{padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, background: r.estado === 'pagado' ? '#d6f0e0' : '#fef3c7', color: r.estado === 'pagado' ? '#14532d' : '#854d0e'}}>
                {r.estado === 'pagado' ? 'Pagado' : 'Pendiente'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
