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
      description: "List all orders",
      response: { 200: z.array(orderResponseSchema) }
    }
  }, async () => {
    return prisma.order.findMany({ include: orderInclude })
  })
}