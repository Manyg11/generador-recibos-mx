import { MercadoPagoConfig, Preference } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
})

export async function POST(request) {
  try {
    const { plan, userEmail, userId } = await request.json()

    const esAnual = plan === 'anual'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const preference = new Preference(client)
    const response = await preference.create({
      body: {
        items: [{
          title: esAnual ? 'Generador de Recibos MX — Pro Anual' : 'Generador de Recibos MX — Pro Mensual',
          quantity: 1,
          unit_price: esAnual ? 799 : 99,
          currency_id: 'MXN',
        }],
        payer: {
          email: userEmail || 'test@test.com',
        },
        metadata: {
          user_id: userId,
          plan: plan,
        },
        back_urls: {
          success: `${appUrl}/pago/exitoso`,
          failure: `${appUrl}/pago/fallido`,
          pending: `${appUrl}/pago/pendiente`,
        },
      }
    })
    
    const url = process.env.NODE_ENV === 'production' 
  ? response.init_point 
  : response.sandbox_init_point

return Response.json({ url })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Error al crear preferencia' }, { status: 500 })
  }
}
