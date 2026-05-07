import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()
    console.log('Webhook recibido:', JSON.stringify(body))

    if (body.type !== 'payment') {
      return Response.json({ ok: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) return Response.json({ ok: true })

    const mpResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      { headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` } }
    )
    const payment = await mpResponse.json()
    console.log('Pago:', JSON.stringify(payment))

    if (payment.status !== 'approved') {
      return Response.json({ ok: true })
    }

    const userId = payment.external_reference || payment.metadata?.user_id
    const plan = payment.metadata?.plan || 'mensual'
    const dias = payment.metadata?.dias || 30

    if (!userId) return Response.json({ ok: true })

    // Calcular fecha de expiración
    const expiracion = new Date()
    expiracion.setDate(expiracion.getDate() + parseInt(dias))

    await supabase.from('profiles').update({
      plan: 'pro',
      subscription_status: 'active',
      plan_expira: expiracion.toISOString(),
      subscription_id: paymentId,
    }).eq('id', userId)

    console.log(`Plan Pro activado para ${userId} hasta ${expiracion.toISOString()}`)

    return Response.json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return Response.json({ error: 'Error' }, { status: 500 })
  }
}
