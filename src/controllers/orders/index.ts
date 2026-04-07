import z from "zod"
import { FastifyTypeInstance } from "../../types"
import { randomUUID } from "node:crypto"

const orderResponseSchema = z.object({
  id: z.string().uuid(),
  // number: z.number(),
  client: z.string(),
  // date: z.string(),
  itens: z.number(),
  // total: z.number(),
  status: z.string(),
})

const orderBodySchema = orderResponseSchema.omit({ id: true })

type Order = z.infer<typeof orderResponseSchema>

const orders: Order[] = []

export async function ordersRoutes(app: FastifyTypeInstance) {

  app.get("/", {
    schema: {
      tags: ["orders"],
      description: "List all orders",
      response: { 200: z.array(orderResponseSchema) }
    }
  }, () => orders)

  app.get("/:id", {
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
    const order = orders.find(o => o.id === request.params.id)
    if (!order) return reply.status(404).send({ message: "Order not found" })
    return reply.status(200).send(order)
  })

  app.post("/", {
    schema: {
      tags: ["orders"],
      description: "Create a new order",
      body: orderBodySchema,
      response: { 201: z.object({ id: z.string() }) }
    }
  }, async (request, reply) => {
    const newOrder: Order = { id: randomUUID(), ...request.body }
    orders.push(newOrder)
    return reply.status(201).send({ id: newOrder.id })
  })

  app.put("/:id", {
    schema: {
      tags: ["orders"],
      description: "Update an order fully",
      params: z.object({ id: z.string().uuid() }),
      body: orderBodySchema,
      response: {
        200: z.object({ message: z.string() }),
        404: z.object({ message: z.string() })
      }
    }
  }, async (request, reply) => {
    const index = orders.findIndex(o => o.id === request.params.id)
    if (index === -1) return reply.status(404).send({ message: "Order not found" })
    orders[index] = { id: request.params.id, ...request.body }
    return reply.status(200).send({ message: "Order updated successfully" })
  })

  app.patch("/:id", {
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
    const index = orders.findIndex(o => o.id === request.params.id)
    if (index === -1) return reply.status(404).send({ message: "Order not found" })
    orders[index] = { ...orders[index], ...request.body }
    return reply.status(200).send({ message: "Order patched successfully" })
  })

  app.delete("/:id", {
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
    const index = orders.findIndex(o => o.id === request.params.id)
    if (index === -1) return reply.status(404).send({ message: "Order not found" })
    orders.splice(index, 1)
    return reply.status(200).send({ message: "Order deleted successfully" })
  })
}