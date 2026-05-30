import z from "zod"
import { FastifyTypeInstance } from "../../types"
import multipart from "@fastify/multipart"
import prisma from "../../../prisma"

const productResponseSchema = z.object({
  id:       z.string().uuid(),
  name:     z.string().min(1),
  categoryId: z.string().uuid(),
  category: z.object({
    id :   z.string(),
    name :  z.string(),
    description : z.string().nullable(),
  }),
  unit:     z.string(),
  price:    z.number().positive(),
  quantity: z.number().int(),
  banner:   z.string().min(1),
  emoji:    z.string().min(1),
  image:    z.string(),
})

export async function productsPrintRoutes(app: FastifyTypeInstance) {
  await app.register(multipart)
  
  app.get("/", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["print"],
      response: { 200: z.array(productResponseSchema) }
    }
  }, async () => {
    return await prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: { name: "asc" }
    })
  })
}