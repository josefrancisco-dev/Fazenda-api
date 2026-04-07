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
})

// 📝 BODY
const stockBodySchema = z.object({
  quantity: z.number().min(0),
  value_Total: z.number().min(0),
  productId: z.string().uuid()
})

// 📥 ENTRADA
const stockInSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive(),
  price: z.number().positive()
})

// 📤 SAÍDA
const stockOutSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive()
})

export async function stockRoutes(app: FastifyTypeInstance) {

  // 🔍 LISTAR
  app.get("/", {
    schema: {
      tags: ["stock"],
      response: { 200: z.array(stockResponseSchema) }
    }
  }, async () => {
    return prisma.stock.findMany()
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
      where: { id: request.params.id }
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
      400: z.object({ message: z.string() })
    }
  }
}, async (request, reply) => {

  const exists = await prisma.stock.findUnique({
    where: { productId: request.body.productId }
  })

  if (exists) {
    return reply.status(400).send({
      message: "Este produto já possui stock"
    })
  }

  // Destructure the values from request.body
  const { quantity, value_Total, productId } = request.body

  const stock = await prisma.stock.create({
    data: {
      quantity,
      value_Total,
      productId,
      status: getStockStatus(quantity) // ✅ obrigatório
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

  // 📥 ENTRADA DE STOCK
  app.post("/in", {
    schema: {
      tags: ["stock"],
      body: stockInSchema
    }
  }, async (request, reply) => {

    const { productId, quantity, price } = request.body

    const stock = await prisma.stock.findUnique({
      where: { productId }
    })

    if (!stock) {
      return reply.status(404).send({ message: "Stock não encontrado" })
    }

    const newQuantity = stock.quantity + quantity

    await prisma.stock.update({
      where: { productId },
      data: {
        quantity: newQuantity,
        value_Total: stock.value_Total + (quantity * price),
        status: getStockStatus(newQuantity)
      }
    })

    return { message: "Entrada realizada com sucesso" }
  })

  // 📤 SAÍDA DE STOCK
  app.post("/out", {
    schema: {
      tags: ["stock"],
      body: stockOutSchema
    }
  }, async (request, reply) => {

    const { productId, quantity } = request.body

    const stock = await prisma.stock.findUnique({
      where: { productId }
    })

    if (!stock) {
      return reply.status(404).send({ message: "Stock não encontrado" })
    }

    if (stock.quantity < quantity) {
      return reply.status(400).send({ message: "Estoque insuficiente" })
    }

    const newQuantity = stock.quantity - quantity

    await prisma.stock.update({
      where: { productId },
      data: {
        quantity: newQuantity,
        status: getStockStatus(newQuantity)
      }
    })

    return { message: "Saída realizada com sucesso" }
  })
}