import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { userId } = await request.json()

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_id')
      .eq('id', userId)
      .single()

    if (!profile?.subscription_id) {
      return Response.json({ error: 'No se encontró suscripción' }, { status: 404 })
    }

    const mpResponse = await fetch(
      `https://api.mercadopago.com/preapproval/${profile.subscription_id}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' })
      }
    )

    if (mpResponse.ok) {
      await supabase.from('profiles').update({
        plan: 'free',
        subscription_status: 'cancelled',
      }).eq('id', userId)

      return Response.json({ ok: true })
    } else {
      return Response.json({ error: 'Error al cancelar en MercadoPago' }, { status: 500 })
    }
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Error interno' }, { status: 500 })
  }
}
