import z from "zod"
import { FastifyTypeInstance } from "../../types"
import prisma from "../../../prisma"
import Stripe from "stripe"


export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const checkoutResponseSchema = z.object({
  checkoutUrl: z.string().url()
})

const checkoutParamsSchema = z.object({
  id: z.string().uuid()
})

export async function checkoutRoutes(app: FastifyTypeInstance) {

  app.post("/:id/checkout", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["payment"],
      description: "Create Stripe checkout session",
      params: checkoutParamsSchema,
      response: {
        200: checkoutResponseSchema,
        400: z.object({ message: z.string() }),
        403: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      }
    }
  }, async (request, reply) => {

    const { id } = request.params
    const userId = request.user.sub

    // 🔍 Buscar pedido
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true }
        }
      }
    })

    // ❌ Não existe
    if (!order) {
      return reply.status(404).send({ message: "Order not found" })
    }

    // 🔒 Segurança
    if (order.clientId !== userId) {
      return reply.status(403).send({ message: "Not allowed" })
    }

    // ❌ Já pago
    // if (order.status === "Concluído") {
    //   return reply.status(400).send({ message: "Order already paid" })
    // }

    // 💰 Criar sessão Stripe
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],

      line_items: order.items.map(item => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.product.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),

      metadata: {
        orderId: order.id
      },
      success_url: "http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:5173/cancel",
    })

    // 💾 Guardar sessão
    await prisma.order.update({
      where: { id },
      data: {
        stripeSessionId: session.id,
      }
    })

    return reply.status(200).send({
      checkoutUrl: session.url!
    })
  })
}