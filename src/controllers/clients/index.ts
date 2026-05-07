import z from "zod"
import { FastifyTypeInstance } from "../../types"
import prisma from "../../../prisma"
import { Role } from "@prisma/client"

const clientResponseSchema = z.object({
  id:      z.string().uuid(),
  name:    z.string(),
  role:    z.enum(['Client', 'Supplier', 'Admin' ]),
  status:  z.enum(['Customer', 'Lead', 'Active']),
  date:    z.string(),
  company: z.string(),
  email:   z.email(),
  phone:   z.string(),
  nif:     z.string(),
  password:  z.string(),
  avatar:  z.string().nullable().optional(),
})

const clientBodySchema = clientResponseSchema.omit({ id: true, date: true })

export async function clientsRoutes(app: FastifyTypeInstance) {

  // GET ALL
  app.get("/", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["clients"],
      description: "List all clients",
      response: { 200: z.array(clientResponseSchema) }
    }
  }, async () => {
    return await prisma.client.findMany({
      orderBy: { name: "asc" }
    })
  })

  // GET ONE
  app.get("/:id", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["clients"],
      description: "Get client by ID",
      params: z.object({ id: z.string().uuid() }),
      response: {
        200: clientResponseSchema,
        404: z.object({ message: z.string() })
      }
    }
  }, async (request, reply) => {
    const client = await prisma.client.findUnique({
      where: { id: request.params.id }
    })

    if (!client) return reply.status(404).send({ message: "Client not found" })

    return reply.status(200).send(client)
  })

  // POST
  app.post("/", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["clients"],
      description: "Create a new client",
      body: clientBodySchema,
      response: {
        201: z.object({ id: z.string() }),
        400: z.object({ message: z.string() })
      }
    }
  }, async (request, reply) => {
    const { company, name, email, phone, role = Role.Client, nif, password, avatar, status } = request.body

    const alreadyExists = await prisma.client.findFirst({ where: { email } })
    if (alreadyExists) return reply.status(400).send({ message: "Cliente já existe!" })

    const client = await prisma.client.create({
      data: {
        company,
        name,
        email,
        phone,
        role,
        nif,
        password, 
        avatar: avatar ?? null,
        status,
        date: new Date().toLocaleDateString("pt-PT")
      }
    })

    return reply.status(201).send({ id: client.id })
  })

  // PUT
  app.put("/:id", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["clients"],
      description: "Update a client fully",
      params: z.object({ id: z.string().uuid() }),
      body: clientBodySchema,
      response: {
        200: z.object({ message: z.string() }),
        404: z.object({ message: z.string() })
      }
    }
  }, async (request, reply) => {
    const client = await prisma.client.findUnique({
      where: { id: request.params.id }
    })

    if (!client) return reply.status(404).send({ message: "Client not found" })

    await prisma.client.update({
      where: { id: request.params.id },
      data: request.body
    })

    return reply.status(200).send({ message: "Client updated successfully" })
  })

  // PATCH
  app.patch("/:id", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["clients"],
      description: "Partially update a client",
      params: z.object({ id: z.string().uuid() }),
      body: clientBodySchema.partial(),
      response: {
        200: z.object({ message: z.string() }),
        404: z.object({ message: z.string() })
      }
    }
  }, async (request, reply) => {
    const client = await prisma.client.findUnique({
      where: { id: request.params.id }
    })

    if (!client) return reply.status(404).send({ message: "Client not found" })

    await prisma.client.update({
      where: { id: request.params.id },
      data: request.body
    })

    return reply.status(200).send({ message: "Client patched successfully" })
  })

  // DELETE
  app.delete("/:id", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["clients"],
      description: "Delete a client",
      params: z.object({ id: z.string().uuid() }),
      response: {
        200: z.object({ message: z.string() }),
        404: z.object({ message: z.string() })
      }
    }
  }, async (request, reply) => {
    const client = await prisma.client.findUnique({
      where: { id: request.params.id }
    })

    if (!client) return reply.status(404).send({ message: "Client not found" })

    await prisma.client.delete({ where: { id: request.params.id } })

    return reply.status(200).send({ message: "Client deleted successfully" })
  })
}