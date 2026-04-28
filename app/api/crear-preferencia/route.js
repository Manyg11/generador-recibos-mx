import { MercadoPagoConfig, PreApproval } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
})

export async function POST(request) {
  try {
    const { plan, userEmail, userId } = await request.json()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    const preapproval = new PreApproval(client)

    const response = await preapproval.create({
      body: {
        reason: plan === 'anual'
          ? 'Generador de Recibos MX — Pro Anual'
          : 'Generador de Recibos MX — Pro Mensual',
        payer_email: userEmail,
        external_reference: userId,
        auto_recurring: {
          frequency: plan === 'anual' ? 1 : 1,
          frequency_type: plan === 'anual' ? 'years' : 'months',
          transaction_amount: plan === 'anual' ? 799 : 99,
          currency_id: 'MXN',
        },
        back_url: `${appUrl}/pago/exitoso`,
        status: 'pending',
      }
    })

    return Response.json({ url: response.init_point })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Error al crear suscripción' }, { status: 500 })
  }
}
