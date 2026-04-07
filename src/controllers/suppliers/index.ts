// import z from "zod"
// import { FastifyTypeInstance } from "../../types"
// import { randomUUID } from "node:crypto"

// const supplierResponseSchema = z.object({
//   id: z.string().uuid(),
//   name: z.string(),
//   role: z.string(),
//   status: z.enum(["Customer", "Lead", "Active"]),
//   // date: z.string(),
//   company: z.string(),
//   email: z.email(),
//   phone: z.string(),
//   nif : z.string(),
//   avatar: z.string().optional(),
// })

// const supplierBodySchema = supplierResponseSchema.omit({ id: true })

// type Supplier = z.infer<typeof supplierResponseSchema>

// const suppliers: Supplier[] = []

// export async function supplierRoutes(app: FastifyTypeInstance) {

//   app.get("/", {
//     schema: {
//       tags: ["suppliers"],
//       description: "List all suppliers",
//       response: { 200: z.array(supplierResponseSchema) }
//     }
//   }, () => suppliers)

//   app.get("/:id", {
//     schema: {
//       tags: ["suppliers"],
//       description: "Get supplier by ID",
//       params: z.object({ id: z.string().uuid() }),
//       response: {
//         200: supplierResponseSchema,
//         404: z.object({ message: z.string() })
//       }
//     }
//   }, async (request, reply) => {
//     const supplier = suppliers.find(s => s.id === request.params.id)
//     if (!supplier) return reply.status(404).send({ message: "Supplier not found" })
//     return reply.status(200).send(supplier)
//   })

//   app.post("/", {
//     schema: {
//       tags: ["suppliers"],
//       description: "Create a new supplier",
//       body: supplierBodySchema,
//       response: { 201: z.object({ id: z.string() }) }
//     }
//   }, async (request, reply) => {
//     const newSupplier: Supplier = { id: randomUUID(), ...request.body }
//     suppliers.push(newSupplier)
//     return reply.status(201).send({ id: newSupplier.id })
//   })

//   app.put("/:id", {
//     schema: {
//       tags: ["suppliers"],
//       description: "Update a supplier fully",
//       params: z.object({ id: z.string().uuid() }),
//       body: supplierBodySchema,
//       response: {
//         200: z.object({ message: z.string() }),
//         404: z.object({ message: z.string() })
//       }
//     }
//   }, async (request, reply) => {
//     const index = suppliers.findIndex(s => s.id === request.params.id)
//     if (index === -1) return reply.status(404).send({ message: "Supplier not found" })
//     suppliers[index] = { id: request.params.id, ...request.body }
//     return reply.status(200).send({ message: "Supplier updated successfully" })
//   })

//   app.patch("/:id", {
//     schema: {
//       tags: ["suppliers"],
//       description: "Partially update a supplier",
//       params: z.object({ id: z.string().uuid() }),
//       body: supplierBodySchema.partial(),
//       response: {
//         200: z.object({ message: z.string() }),
//         404: z.object({ message: z.string() })
//       }
//     }
//   }, async (request, reply) => {
//     const index = suppliers.findIndex(s => s.id === request.params.id)
//     if (index === -1) return reply.status(404).send({ message: "Supplier not found" })
//     suppliers[index] = { ...suppliers[index], ...request.body }
//     return reply.status(200).send({ message: "Supplier patched successfully" })
//   })

//   app.delete("/:id", {
//     schema: {
//       tags: ["suppliers"],
//       description: "Delete a supplier",
//       params: z.object({ id: z.string().uuid() }),
//       response: {
//         200: z.object({ message: z.string() }),
//         404: z.object({ message: z.string() })
//       }
//     }
//   }, async (request, reply) => {
//     const index = suppliers.findIndex(s => s.id === request.params.id)
//     if (index === -1) return reply.status(404).send({ message: "Supplier not found" })
//     suppliers.splice(index, 1)
//     return reply.status(200).send({ message: "Supplier deleted successfully" })
//   })
// }

import z from "zod"
import { FastifyTypeInstance } from "../../types"
import prisma from "../../../prisma"

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
    schema: {
      tags: ["suppliers"],
      description: "List all suppliers",
      response: { 200: z.array(supplierResponseSchema) }
    }
  }, async () => {
    return await prisma.supplier.findMany({
      orderBy: { name: "asc" }
    })
  })

  // GET ONE
  app.get("/:id", {
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
    const { company, name, email, phone, role, nif, avatar, status } = request.body

    const alreadyExists = await prisma.supplier.findFirst({ where: { email } })
    if (alreadyExists) return reply.status(400).send({ message: "Fornecedor já existe!" })

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