import z from "zod"
import { FastifyTypeInstance } from "../../types"
import prisma from "../../../prisma"
import { PersonStatus, Role } from "@prisma/client"

const supplierResponseSchema = z.object({
  id:      z.string().uuid(),
  name:    z.string(),
  role:    z.string(),
  status:  z.enum(["Customer", "Lead", "Active"]),
  date:    z.string(),
  company: z.string(),
  email:   z.string(),
  phone:   z.string(),
  nif:     z.string(),
  avatar:  z.string().nullable().optional(),
})

const supplierBodySchema = supplierResponseSchema.omit({ id: true, date: true })

export async function supplierRoutes(app: FastifyTypeInstance) {

 // GET ALL
  app.get("/", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["suppliers"],
      description: "List all suppliers",
      querystring: z.object({
          q: z.string().optional(),
          status: supplierResponseSchema.shape.status.optional(),
          phone: z.string().optional(),
          nif: z.string().optional(),
          from: z.string().optional(),
          to: z.string().optional(),
        }),
      response: { 200: z.array(supplierResponseSchema) }
    }
  }, async (req) => {
    const { q , status, phone, nif, from, to} = req.query

 const dateFilter = from || to ? {
    date: {
      ...(from && { gte: from }),
      ...(to && { lte: to }),
    }
  } : {}


     return await prisma.supplier.findMany({
      where: {
        ...(q && {
          OR: [
            { name:    { contains: q } },
            { email:   { contains: q } },
            { company: { contains: q } },
            { nif:     { contains: q } },
            { phone:   { contains: q } },
          ],
        }),
        ...(status && { status }),
        ...(phone && { phone: { contains: phone } }),
        ...(nif && { nif: { contains: nif } }),
        ... dateFilter,
      },
      orderBy: { name: "asc" }
    })
  })

  // GET ONE
  app.get("/:id", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["suppliers"],
      description: "Get supplier by ID",
      params: z.object({ id: z.string().uuid() }),
      response: {
        200: supplierResponseSchema,
        404: z.object({ message: z.string() })
      }
    }
  }, async (request, reply) => {
    const supplier = await prisma.supplier.findUnique({
      where: { id: request.params.id }
    })

    if (!supplier) return reply.status(404).send({ message: "Supplier not found" })

    return reply.status(200).send(supplier)
  })

  // POST
  app.post("/", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["suppliers"],
      description: "Create a new supplier",
      body: supplierBodySchema,
      response: {
        201: z.object({ id: z.string() }),
        400: z.object({ message: z.string() })
      }
    }
  }, async (request, reply) => {
    const { company, name, email, phone, role = "Supplier", nif, avatar, status = PersonStatus.Active } = request.body

    const alreadyExists = await prisma.supplier.findFirst({
      where: { OR: [{ email }, { nif }] }
    })
 
    if (alreadyExists) {
      const field = alreadyExists.email === email ? "Email" : "NIF"
      return reply.status(400).send({ message: `${field} já está em uso por outro fornecedor!` })
    }
 
    const supplier = await prisma.supplier.create({
      data: {
        company,
        name,
        email,
        phone,
        role,
        nif,
        avatar: avatar ?? null,
        status,
        date: new Date().toLocaleDateString("pt-PT")
      }
    })

    return reply.status(201).send({ id: supplier.id })
  })

  // PUT
  app.put("/:id", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["suppliers"],
      description: "Update a supplier fully",
      params: z.object({ id: z.string().uuid() }),
      body: supplierBodySchema,
      response: {
        200: z.object({ message: z.string() }),
        404: z.object({ message: z.string() })
      }
    }
  }, async (request, reply) => {
    const supplier = await prisma.supplier.findUnique({
      where: { id: request.params.id }
    })

    if (!supplier) return reply.status(404).send({ message: "Supplier not found" })

    await prisma.supplier.update({
      where: { id: request.params.id },
      data: request.body
    })

    return reply.status(200).send({ message: "Supplier updated successfully" })
  })

  // PATCH
  app.patch("/:id", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["suppliers"],
      description: "Partially update a supplier",
      params: z.object({ id: z.string().uuid() }),
      body: supplierBodySchema.partial(),
      response: {
        200: z.object({ message: z.string() }),
        404: z.object({ message: z.string() })
      }
    }
  }, async (request, reply) => {
    const supplier = await prisma.supplier.findUnique({
      where: { id: request.params.id }
    })

    if (!supplier) return reply.status(404).send({ message: "Supplier not found" })

    await prisma.supplier.update({
      where: { id: request.params.id },
      data: request.body
    })

    return reply.status(200).send({ message: "Supplier patched successfully" })
  })

  // DELETE
  app.delete("/:id", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["suppliers"],
      description: "Delete a supplier",
      params: z.object({ id: z.string().uuid() }),
      response: {
        200: z.object({ message: z.string() }),
        404: z.object({ message: z.string() })
      }
    }
  }, async (request, reply) => {
    const supplier = await prisma.supplier.findUnique({
      where: { id: request.params.id }
    })

    if (!supplier) return reply.status(404).send({ message: "Supplier not found" })

    await prisma.supplier.delete({ where: { id: request.params.id } })

    return reply.status(200).send({ message: "Supplier deleted successfully" })
  })
}