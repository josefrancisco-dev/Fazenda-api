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

// Body schema SEM o campo "total" (será calculado no backend)
const shoppingBodySchema = z.object({
  supplierId: z.string().uuid(),
  items: z.array(z.object({
    name:     z.string(),
    quantity: z.number().int().positive(),
    price:    z.number().nonnegative(),
  })),
  status: z.boolean().default(false),
})

export async function shoppingRoutes(app: FastifyTypeInstance) {

  // GET ALL
  app.get("/", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["shopping"],
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

  // GET ONE
  app.get("/:id", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["shopping"],
      description: "Get shopping order by ID",
      params: z.object({ id: z.string().uuid() }),
      response: {
        200: shoppingResponseSchema,
        404: z.object({ message: z.string() })
      }
    }
  }, async (request, reply) => {
    const shopping = await prisma.shopping.findUnique({
      where: { id: request.params.id },
      include: { 
        supplier: true,
        items: true 
      }
    })

    if (!shopping) {
      return reply.status(404).send({ message: "Shopping not found" })
    }

    return reply.status(200).send(shopping)
  })

  // POST - Criação da compra com itens (total calculado no backend)
  app.post("/", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["shopping"],
      description: "Create a new shopping order",
      body: shoppingBodySchema,
      response: {
        201: z.object({ id: z.string() }),
        400: z.object({ message: z.string() }),
        404: z.object({ message: z.string() })
      }
    }
  }, async (request, reply) => {
    const { supplierId, items, status } = request.body

    // Verifica se o fornecedor existe
    const supplier = await prisma.supplier.findUnique({ 
      where: { id: supplierId } 
    })
    
    if (!supplier) {
      return reply.status(404).send({ message: "Fornecedor não encontrado!" })
    }

    // Valida se há itens
    if (!items || items.length === 0) {
      return reply.status(400).send({ message: "Adicione pelo menos um item!" })
    }

    // CALCULA o total baseado nos itens (segurança)
    const total = items.reduce((sum, item) => {
      return sum + (item.quantity * item.price)
    }, 0)

    // Gera o número sequencial
    const lastShopping = await prisma.shopping.findFirst({
      orderBy: { number: "desc" }
    })
    const number = (lastShopping?.number ?? 0) + 1

    // Cria a compra COM os itens
    const shopping = await prisma.shopping.create({
      data: {
        number,
        supplierId,
        total,  // ← usa o valor calculado
        status,
        date: new Date().toLocaleDateString("pt-PT"),
        items: {
          create: items  // ← cria os itens relacionados
        }
      }
    })

    return reply.status(201).send({ id: shopping.id })
  })

  // PUT - Atualização completa
  app.put("/:id", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["shopping"],
      description: "Update a shopping order fully",
      params: z.object({ id: z.string().uuid() }),
      body: shoppingBodySchema,
      response: {
        200: z.object({ message: z.string() }),
        404: z.object({ message: z.string() })
      }
    }
  }, async (request, reply) => {
    const shopping = await prisma.shopping.findUnique({
      where: { id: request.params.id }
    })

    if (!shopping) {
      return reply.status(404).send({ message: "Shopping not found" })
    }

    const { supplierId, items, status } = request.body

    // Verifica se o fornecedor existe
    const supplier = await prisma.supplier.findUnique({ 
      where: { id: supplierId } 
    })
    
    if (!supplier) {
      return reply.status(404).send({ message: "Fornecedor não encontrado!" })
    }

    // Calcula o novo total
    const total = items.reduce((sum, item) => {
      return sum + (item.quantity * item.price)
    }, 0)

    // Atualiza a compra e os itens
    await prisma.$transaction([
      // Remove os itens antigos
      prisma.shoppingItem.deleteMany({
        where: { shoppingId: request.params.id }
      }),
      // Atualiza os dados da compra
      prisma.shopping.update({
        where: { id: request.params.id },
        data: {
          supplierId,
          total,
          status,
          items: {
            create: items 
          }
        }
      })
    ])

    return reply.status(200).send({ message: "Shopping updated successfully" })
  })

  // PATCH - Atualização parcial
  app.patch("/:id", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["shopping"],
      description: "Partially update a shopping order",
      params: z.object({ id: z.string().uuid() }),
      body: shoppingBodySchema.partial(),
      response: {
        200: z.object({ message: z.string() }),
        404: z.object({ message: z.string() })
      }
    }
  }, async (request, reply) => {
    const shopping = await prisma.shopping.findUnique({
      where: { id: request.params.id },
      include: { items: true }
    })

    if (!shopping) {
      return reply.status(404).send({ message: "Shopping not found" })
    }

    const updateData: any = {}
    const { supplierId, items, status } = request.body

    // Atualiza supplierId se fornecido
    if (supplierId !== undefined) {
      const supplier = await prisma.supplier.findUnique({ 
        where: { id: supplierId } 
      })
      if (!supplier) {
        return reply.status(404).send({ message: "Fornecedor não encontrado!" })
      }
      updateData.supplierId = supplierId
    }

    // Atualiza status se fornecido
    if (status !== undefined) {
      updateData.status = status
    }

    // Se items foi fornecido, recalcula total e atualiza itens
    if (items !== undefined && items.length > 0) {
      const newTotal = items.reduce((sum, item) => {
        return sum + (item.quantity * item.price)
      }, 0)
      updateData.total = newTotal
      updateData.items = {
        deleteMany: {},
        create: items
      }
    }

    await prisma.shopping.update({
      where: { id: request.params.id },
      data: updateData
    })

    return reply.status(200).send({ message: "Shopping patched successfully" })
  })

  // DELETE
  app.delete("/:id", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["shopping"],
      description: "Delete a shopping order",
      params: z.object({ id: z.string().uuid() }),
      response: {
        200: z.object({ message: z.string() }),
        404: z.object({ message: z.string() })
      }
    }
  }, async (request, reply) => {
    const shopping = await prisma.shopping.findUnique({
      where: { id: request.params.id }
    })

    if (!shopping) {
      return reply.status(404).send({ message: "Shopping not found" })
    }

    // Os ShoppingItems serão deletados automaticamente se tiver cascade
    await prisma.shopping.delete({ 
      where: { id: request.params.id } 
    })

    return reply.status(200).send({ message: "Shopping deleted successfully" })
  })
}
