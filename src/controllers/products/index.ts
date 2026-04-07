import z from "zod"
import { FastifyTypeInstance } from "../../types"
import { randomUUID } from "node:crypto"
import multipart from "@fastify/multipart"
import path from "node:path"
import fs from "node:fs"
import prisma from "../../../prisma"

const productResponseSchema = z.object({
  id:       z.string().uuid(),
  name:     z.string().min(1),
  category: z.string().min(1),
  unit:     z.string(),
  price:    z.number().positive(),
  quantity: z.number().int(),
  banner:   z.string().min(1),
  emoji:    z.string().min(1),
  image:    z.string(),
})

const UPLOAD_DIR = path.resolve("uploads")
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR)

export async function productsRoutes(app: FastifyTypeInstance) {

  await app.register(multipart)

  // GET ALL
  app.get("/", {
    schema: {
      tags: ["products"],
      response: { 200: z.array(productResponseSchema) }
    }
  }, async () => {
    return await prisma.product.findMany({
      orderBy: { name: "asc" }
    })
  })

  // GET ONE
  app.get("/:id", {
    schema: {
      tags: ["products"],
      params: z.object({ id: z.string().uuid() }),
      response: {
        200: productResponseSchema,
        404: z.object({ message: z.string() })
      }
    }
  }, async (request, reply) => {
    const product = await prisma.product.findUnique({
      where: { id: request.params.id }
    })

    if (!product) return reply.status(404).send({ message: "Product not found" })

    return reply.status(200).send(product)
  })

  // POST
  app.post("/", {
    schema: {
      tags: ["products"],
      description: "Create a new product (multipart/form-data)",
      response: {
        201: z.object({ id: z.string() }),
        400: z.object({ message: z.string() })
      }
    }
  }, async (request, reply) => {
    const parts = request.parts()

    let name = "", category = "", unit = "", banner = "", emoji = ""
    let price = 0
    let imagePath = ""

    for await (const part of parts) {
      if (part.type === "file") {
        const filename = `${randomUUID()}${path.extname(part.filename)}`
        const filepath = path.join(UPLOAD_DIR, filename)
        await fs.promises.writeFile(filepath, await part.toBuffer())
        imagePath = `/uploads/${filename}`
      } else {
        const value = part.value as string
        if (part.fieldname === "name")     name     = value
        if (part.fieldname === "category") category = value
        if (part.fieldname === "unit")     unit     = value
        if (part.fieldname === "banner")   banner   = value
        if (part.fieldname === "emoji")    emoji    = value
        if (part.fieldname === "price")    price    = parseFloat(value)
      }
    }

    // Cria o produto
    const product = await prisma.product.create({
      data: {
        name,
        category,
        unit,
        price,
        banner,
        emoji,
        quantity: 0,                    
        image:    imagePath || "",
      }
    })

    // Cria o Stock automaticamente
    // await prisma.stock.create({
    //   data: {
    //     productId:   product.id,
    //     quantity:    0,
    //     value_Total: 0,
    //     status:      "Estoque_Baixo"   
    //   }
    // })

    return reply.status(201).send({ id: product.id })
  })

  // PUT
  app.put("/:id", {
    schema: {
      tags: ["products"],
      description: "Update a product (multipart/form-data)",
      params: z.object({ id: z.string().uuid() }),
      response: {
        200: z.object({ message: z.string() }),
        404: z.object({ message: z.string() })
      }
    }
  }, async (request, reply) => {
    const product = await prisma.product.findUnique({
      where: { id: request.params.id }
    })

    if (!product) return reply.status(404).send({ message: "Product not found" })

    const parts = request.parts()
    const updated: Record<string, any> = {}

    for await (const part of parts) {
      if (part.type === "file") {
        const filename = `${randomUUID()}${path.extname(part.filename)}`
        const filepath = path.join(UPLOAD_DIR, filename)
        await fs.promises.writeFile(filepath, await part.toBuffer())
        updated.image = `/uploads/${filename}`
      } else {
        const value = part.value as string
        if (part.fieldname === "name")     updated.name     = value
        if (part.fieldname === "category") updated.category = value
        if (part.fieldname === "unit")     updated.unit     = value
        if (part.fieldname === "banner")   updated.banner   = value
        if (part.fieldname === "emoji")    updated.emoji    = value
        if (part.fieldname === "price")    updated.price    = parseFloat(value)
      }
    }

    await prisma.product.update({
      where: { id: request.params.id },
      data:  updated
    })

    return reply.status(200).send({ message: "Product updated successfully" })
  })

  // DELETE
  app.delete("/:id", {
    schema: {
      tags: ["products"],
      params: z.object({ id: z.string().uuid() }),
      response: {
        200: z.object({ message: z.string() }),
        404: z.object({ message: z.string() })
      }
    }
  }, async (request, reply) => {
    const product = await prisma.product.findUnique({
      where: { id: request.params.id }
    })

    if (!product) return reply.status(404).send({ message: "Product not found" })

    // Apaga o stock associado primeiro
    await prisma.stock.deleteMany({
      where: { productId: request.params.id }
    })

    await prisma.product.delete({
      where: { id: request.params.id }
    })

    return reply.status(200).send({ message: "Product deleted successfully" })
  })
}