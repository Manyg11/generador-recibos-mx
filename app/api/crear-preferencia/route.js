import { MercadoPagoConfig, Preference } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
})

export async function POST(request) {
  try {
    const { plan, userEmail, userId } = await request.json()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    const preference = new Preference(client)

    const diasValido = plan === 'anual' ? 365 : 30
    const fechaExpiracion = new Date()
    fechaExpiracion.setDate(fechaExpiracion.getDate() + diasValido)

    const response = await preference.create({
      body: {
        items: [{
          id: `plan-${plan}`,
          title: plan === 'anual'
            ? 'Generador de Recibos MX — Pro Anual'
            : 'Generador de Recibos MX — Pro Mensual',
          description: plan === 'anual'
            ? 'Acceso Pro por 12 meses'
            : 'Acceso Pro por 30 días',
          category_id: 'services',
          quantity: 1,
          unit_price: plan === 'anual' ? 799 : 99,
          currency_id: 'MXN',
        }],
        payer: {
          email: userEmail,
        },
        external_reference: userId,
        notification_url: `${appUrl}/api/webhook-mp`,
        back_urls: {
          success: `${appUrl}/pago/exitoso`,
          failure: `${appUrl}/pago/fallido`,
          pending: `${appUrl}/pago/pendiente`,
        },
        auto_return: 'approved',
        metadata: {
          user_id: userId,
          plan: plan,
          dias: diasValido,
        },
      }
    })

    return Response.json({ url: response.init_point })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Error al crear preferencia' }, { status: 500 })
  }
}
