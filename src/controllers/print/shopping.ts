import z from "zod"
import { FastifyTypeInstance } from "../../types"
import prisma from "../../../prisma"

const shoppingResponseSchema = z.object({
  id:         z.string().uuid(),
  number:     z.number().int(),
  supplierId: z.string().uuid(),
  date:       z.string(),
  total:      z.number(),
  status:     z.boolean(),
  supplier: z.object({
    id:      z.string().uuid(),
    name:    z.string(),
    company: z.string(),
  }),
  items: z.array(z.object({
    id:       z.string().uuid(),
    name:     z.string(),
    quantity: z.number().int(),
    price:    z.number(),
  }))
})

export async function shoppingPrintRoutes(app: FastifyTypeInstance) {

  app.get("/", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["print"],
      description: "List all shopping orders",
      response: { 200: z.array(shoppingResponseSchema) }
    }
  }, async () => {
    return await prisma.shopping.findMany({
      include: { 
        supplier: true,
        items: true 
      },
      orderBy: { number: "desc" }
    })
  })
}
