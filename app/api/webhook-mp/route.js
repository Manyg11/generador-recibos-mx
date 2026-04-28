import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()
    console.log('Webhook recibido:', JSON.stringify(body))

    // Manejar pagos de suscripción
    if (body.type === 'subscription_preapproval') {
      const subscriptionId = body.data?.id
      if (!subscriptionId) return Response.json({ ok: true })

      const mpResponse = await fetch(
        `https://api.mercadopago.com/preapproval/${subscriptionId}`,
        { headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` } }
      )
      const subscription = await mpResponse.json()
      console.log('Suscripción:', JSON.stringify(subscription))

      const userId = subscription.external_reference
      const status = subscription.status

      if (!userId) return Response.json({ ok: true })

      if (status === 'authorized') {
        // Suscripción activa — activar plan Pro
        await supabase.from('profiles').update({
          plan: 'pro',
          subscription_id: subscriptionId,
          subscription_status: 'active',
        }).eq('id', userId)
      } else if (status === 'cancelled' || status === 'paused') {
        // Suscripción cancelada — bajar a plan gratuito
        await supabase.from('profiles').update({
          plan: 'free',
          subscription_status: status,
        }).eq('id', userId)
      }
    }

    // Manejar pagos individuales de la suscripción
    if (body.type === 'payment') {
      const paymentId = body.data?.id
      if (!paymentId) return Response.json({ ok: true })

      const mpResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        { headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` } }
      )
      const payment = await mpResponse.json()

      if (payment.status === 'approved') {
        const userId = payment.external_reference || payment.metadata?.user_id
        if (userId) {
          await supabase.from('profiles').update({
            plan: 'pro',
            subscription_status: 'active',
          }).eq('id', userId)
        }
      }
    }

    return Response.json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return Response.json({ error: 'Error' }, { status: 500 })
  }
}
