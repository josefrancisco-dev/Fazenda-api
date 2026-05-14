import z from "zod"
import { FastifyTypeInstance } from "../../types"
import prisma from "prisma"

const stockStatusEnum = z.enum([
  "Em_Estoque",
  "Estoque_Medio",
  "Estoque_Baixo"
])

const stockPrintSchema = z.object({
  id: z.string().uuid(),
  quantity: z.number(),
  value_Total: z.number(),
  status: stockStatusEnum,
  product: z.object({
    name: z.string(),
    category: z.string(),
    unit: z.string(),
    price: z.number(),
  }).optional()
})

export async function stockPrintRoutes(app: FastifyTypeInstance) {

  app.get("/", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["print"],
      response: {
        200: z.array(stockPrintSchema)
      }
    }
  }, async () => {
    return prisma.stock.findMany({
      select: {
        id: true,
        quantity: true,
        value_Total: true,
        status: true,
        product: {
          select: {
            name: true,
            category: true,
            unit: true,
            price: true,
          }
        }
      }
    })
  })
}