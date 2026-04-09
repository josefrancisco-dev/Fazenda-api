import z from "zod"
import { FastifyTypeInstance } from "../../types"
import prisma from "prisma"

// 🔁 Enum igual ao Prisma
const stockStatusEnum = z.enum([
  "Em_Estoque",
  "Estoque_Medio",
  "Estoque_Baixo"
])

// 🧠 função para calcular status
function getStockStatus(quantity: number) {
  if (quantity <= 5) return "Estoque_Baixo"
  if (quantity <= 20) return "Estoque_Medio"
  return "Em_Estoque"
}

// 📦 RESPONSE
const stockResponseSchema = z.object({
  id: z.string().uuid(),
  quantity: z.number(),
  value_Total: z.number(),
  status: stockStatusEnum,
  productId: z.string().uuid(),
  product: z.object({     
    name: z.string(),
    category: z.string(),
    unit: z.string(),
    price : z.number(),
  }).optional()
})

// 📝 BODY
const stockBodySchema = z.object({
  quantity: z.number().min(0),
  value_Total: z.number().min(0),
  productId: z.string().uuid()
})

export async function stockRoutes(app: FastifyTypeInstance) {

  // 🔍 LISTAR
  app.get("/", {
    schema: {
      tags: ["stock"],
      response: { 200: z.array(stockResponseSchema) }
    }
  }, async () => {
    return prisma.stock.findMany({
      select: {
        id: true,
        quantity: true,
        value_Total: true,
        status: true,
        productId: true,
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

  // 🔍 BUSCAR POR ID
  app.get("/:id", {
    schema: {
      tags: ["stock"],
      params: z.object({ id: z.string().uuid() }),
      response: {
        200: stockResponseSchema,
        404: z.object({ message: z.string() })
      }
    }
  }, async (request, reply) => {

    const stock = await prisma.stock.findUnique({
      where: { id: request.params.id },
      select: {
        id: true,
        quantity: true,
        value_Total: true,
        status: true,
        productId: true,
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

    if (!stock) {
      return reply.status(404).send({ message: "Stock not found" })
    }

    return stock
  })

  // ➕ CRIAR
  app.post("/", {
    schema: {
      tags: ["stock"],
      body: stockBodySchema,
      response: {
        201: stockResponseSchema,
      }
    }
  }, async (request, reply) => {
    const { quantity, value_Total, productId } = request.body

    const stock = await prisma.stock.create({
      data: {
        quantity,
        value_Total,
        productId,
        status: getStockStatus(quantity)
      },
    })

    await prisma.product.update({
      where: { id: productId },
      data: {
        quantity: { increment: quantity }
      }
    })

    return reply.status(201).send(stock)
  })

  // 🔄 UPDATE COMPLETO
  app.put("/:id", {
    schema: {
      tags: ["stock"],
      params: z.object({ id: z.string().uuid() }),
      body: stockBodySchema,
    }
  }, async (request, reply) => {

    const exists = await prisma.stock.findUnique({
      where: { id: request.params.id }
    })

    if (!exists) {
      return reply.status(404).send({ message: "Stock not found" })
    }

    const { quantity, value_Total, productId } = request.body

    await prisma.stock.update({
      where: { id: request.params.id },
      data: {
        quantity,
        value_Total,
        productId,
        status: getStockStatus(quantity)
      }
    })

    return { message: "Stock atualizado com sucesso" }
  })

  // 🩹 UPDATE PARCIAL
  app.patch("/:id", {
    schema: {
      tags: ["stock"],
      params: z.object({ id: z.string().uuid() }),
      body: stockBodySchema.partial(),
    }
  }, async (request, reply) => {

    const stock = await prisma.stock.findUnique({
      where: { id: request.params.id }
    })

    if (!stock) {
      return reply.status(404).send({ message: "Stock not found" })
    }

    const newQuantity = request.body.quantity ?? stock.quantity

    await prisma.stock.update({
      where: { id: request.params.id },
      data: {
        ...request.body,
        status: getStockStatus(newQuantity)
      }
    })

    return { message: "Stock atualizado parcialmente" }
  })

  // ❌ DELETE
  app.delete("/:id", {
    schema: {
      tags: ["stock"],
      params: z.object({ id: z.string().uuid() }),
    }
  }, async (request, reply) => {

    const exists = await prisma.stock.findUnique({
      where: { id: request.params.id }
    })

    if (!exists) {
      return reply.status(404).send({ message: "Stock not found" })
    }

    await prisma.stock.delete({
      where: { id: request.params.id }
    })

    return { message: "Stock removido com sucesso" }
  })

}