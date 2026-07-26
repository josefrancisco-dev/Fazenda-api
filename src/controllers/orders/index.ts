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
  image:    z.string(),
  banner:   z.string(),
  emoji:    z.string(),
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
  status:  z.enum([
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

const orderBodySchema = z.object({
  number: z.number(),
  date:   z.string(),
  items:  z.array(orderItemSchema).min(1, 'Adicione pelo menos um item'),
})

const orderUpdateSchema = z.object({
  status: orderResponseSchema.shape.status
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

export async function ordersRoutes(app: FastifyTypeInstance) {

  app.get("/", {
  preHandler: [app.authenticate],
  schema: {
    tags: ["orders"],
    description: "List all orders",
    querystring: z.object({
      q: z.string().optional(),
      from: z.string().optional(),
      to: z.string().optional(),
      status: orderResponseSchema.shape.status.optional(),
    }),
    response: { 200: z.array(orderResponseSchema) }
  }
}, async (req) => {
  const { q , from , to, status} = req.query

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
          { client: { name:    { contains: q } } },
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
      tags: ["orders"],
      description: "Get order by ID",
      params: z.object({ id: z.string().uuid() }),
      response: {
        200: orderResponseSchema,
        404: z.object({ message: z.string() })
      }
    }
  }, async (request, reply) => {
    const order = await prisma.order.findUnique({
      where: { id: request.params.id },
      include: orderInclude
    })

    if (!order) return reply.status(404).send({ message: "Order not found" })
    return reply.status(200).send(order)
  })

  app.post("/", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["orders"],
      description: "Create a new order",
      body: orderBodySchema,
      response: { 201: z.object({ id: z.string() }) }
    }
  }, async (request, reply) => {
    const { number, date, items } = request.body
    const clientId = request.user.sub

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    const order = await prisma.order.create({
      data: {
        number,
        date,
        total,
        status: "Pendente",
        clientId,
        items: { create: items },
      }
    })

      await Promise.all(
      items.map(async (item) => {
      await prisma.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } }
      })
    })
  )

    return reply.status(201).send({ id: order.id })
  })

  app.put("/:id", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["orders"],
      description: "Update order status",
      params: z.object({
        id: z.string().uuid()
      }),
      body: orderUpdateSchema,
      response: {
        200: z.object({
          message: z.string()
        }),
        404: z.object({
          message: z.string()
        })
      }
    }
  }, async (request, reply) => {

    const { id } = request.params
    const { status } = request.body

    const exists = await prisma.order.findUnique({
      where: { id }
    })

    if (!exists) {
      return reply.status(404).send({
        message: "Order not found"
      })
    }

    await prisma.order.update({
      where: { id },
      data: {
        status
      }
    })

    return reply.status(200).send({
      message: "Order status updated successfully"
    })
  })

  app.patch("/:id", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["orders"],
      description: "Partially update an order",
      params: z.object({ id: z.string().uuid() }),
      body: orderBodySchema.partial(),
      response: {
        200: z.object({ message: z.string() }),
        404: z.object({ message: z.string() })
      }
    }
  }, async (request, reply) => {
    const { id } = request.params
    const { items, ...rest } = request.body

    const exists = await prisma.order.findUnique({ where: { id } })
    if (!exists) return reply.status(404).send({ message: "Order not found" })

    const total = items
      ? items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      : undefined

    await prisma.order.update({
      where: { id },
      data: {
        ...rest,
        ...(total !== undefined && { total }),
        ...(items && { items: { deleteMany: {}, create: items } })
      }
    })

    return reply.status(200).send({ message: "Order patched successfully" })
  })

  app.delete("/:id", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["orders"],
      description: "Delete an order",
      params: z.object({ id: z.string().uuid() }),
      response: {
        200: z.object({ message: z.string() }),
        404: z.object({ message: z.string() })
      }
    }
  }, async (request, reply) => {
    const { id } = request.params

    const exists = await prisma.order.findUnique({ where: { id } })
    if (!exists) return reply.status(404).send({ message: "Order not found" })

    await prisma.order.delete({ where: { id } })
    return reply.status(200).send({ message: "Order deleted successfully" })
  })
}