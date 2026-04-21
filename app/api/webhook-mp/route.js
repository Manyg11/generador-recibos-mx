import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()

    if (body.type !== 'payment') {
      return Response.json({ ok: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) return Response.json({ ok: true })

    const mpResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
        }
      }
    )

    const payment = await mpResponse.json()

    if (payment.status !== 'approved') {
      return Response.json({ ok: true })
    }

    const userId = payment.metadata?.user_id
    const plan = payment.metadata?.plan

    if (!userId) return Response.json({ ok: true })

    await supabase
      .from('profiles')
      .update({ plan: 'pro' })
      .eq('id', userId)

    return Response.json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return Response.json({ error: 'Error' }, { status: 500 })
  }
}
