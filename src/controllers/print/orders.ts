import z from "zod"
import { FastifyTypeInstance } from "../../types"
import prisma from "../../../prisma"


const productSchema = z.object({
  id:       z.string().uuid(),
  name:     z.string(),
  category: z.object({
  id: z.string().uuid(),
  name: z.string(),
  }),
  categoryId :  z.string(),
  quantity: z.number(),
  unit:     z.string(),
  price:    z.number(),
  banner:   z.string(),
  emoji:    z.string(),
  image:    z.string(),
})

const clientSchema = z.object({
  id:      z.string().uuid(),
  name:    z.string(),
  email:   z.string().email(),
  phone:   z.string(),
  isCorporative: z.string(),
  nif:     z.string().nullable().optional(),
  status:  z.string(),
  role:    z.string(),
  avatar:  z.string().nullable(),
})

export const orderItemSchema = z.object({
  quantity:  z.number().min(1),
  price:     z.number().min(0),
  productId: z.string().uuid(),
})

export const orderItemFullSchema = orderItemSchema.extend({
  id:      z.string().uuid(),
  orderId: z.string().uuid(),
  product: productSchema, 
})

export const orderResponseSchema = z.object({
  id:       z.string().uuid(),
  number:   z.number(),
  date:     z.string(),
  total:    z.number().min(0),
  status:   z.enum([
    "Pendente",
    "Confirmado",
    "Em_processamento",
    "Enviado",
    "Entregue"
    ]),
  clientId: z.string().uuid(),
  client:   clientSchema,          
  items:    z.array(orderItemFullSchema).min(1),
})

const orderInclude = {
  items: {
    include: {
      product: {
        include: {
          category: true 
        }
      }
    }
  },
  client: true
}

export async function ordersPrintRoutes(app: FastifyTypeInstance) {

  app.get("/", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["print"],
      description: "List orders for report (respects q/status/from/to filters when provided)",
      querystring: z.object({
        q: z.string().optional(),
        status: orderResponseSchema.shape.status.optional(),
        from: z.string().optional(),
        to: z.string().optional(),
      }),
      response: { 200: z.array(orderResponseSchema) }
    }
  }, async (request) => {
    const { q, status, from, to } = request.query

    const dateFilter = from || to ? {
      date: {
        ...(from && { gte: from }),
        ...(to && { lte: to }),
      }
    } : {}

    return prisma.order.findMany({
      where: {
        ...(q && {
          OR: [
            { client: { name: { contains: q } } },
            { client: { isCorporative: { contains: q } } },
          ],
        }),
        ...(status && { status }),
        ...dateFilter,
      },
      include: orderInclude,
      orderBy: { number: "asc" }
    })
  })

app.get("/:id", {
  preHandler: [app.authenticate],
  schema: {
    tags: ["print"],
    description: "Get single order for receipt",
    params: z.object({ id: z.string().uuid() }),
    response: {
      200: orderResponseSchema,
      404: z.object({ message: z.string() })
    }
  }
}, async (request, reply) => {
  const { id } = request.params

  const order = await prisma.order.findUnique({
    where: { id },
    include: orderInclude
  })

  if (!order) {
    return reply.status(404).send({ message: "Pedido não encontrado" })
  }

  return order
})
}