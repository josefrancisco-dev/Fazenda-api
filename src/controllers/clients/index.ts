import z from "zod"
import { FastifyTypeInstance } from "../../types"
import prisma from "../../../prisma"
import { Role } from "@prisma/client"
import { hashPassword } from "@/utils/password"

const clientResponseSchema = z.object({
  id:      z.string().uuid(),
  name:    z.string(),
  role:    z.enum(['Client', 'Commercial_Manager', 'Admin' ]), 
  status:  z.enum(['Customer', 'Lead', 'Active']),
  date:    z.string(),
  isCorporative: z.string(),
  email:   z.email(),
  phone:   z.string(),
  nif:     z.string().nullable().optional(),
  // password:  z.string(),
  avatar:  z.string().nullable().optional(),
})

// const clientBodySchema = clientResponseSchema.omit({ id: true, date: true })

const clientBodySchema = z.object({
  name:    z.string(),
  role:    z.enum(['Client', 'Commercial_Manager', 'Admin']), 
  status:  z.enum(['Customer', 'Lead', 'Active']),
  isCorporative: z.string(),
  email:   z.email(), 
  phone:   z.string(),
  nif:     z.string().nullable().optional(),
  password:  z.string(),
  avatar:  z.string().nullable().optional(),
})

export async function clientsRoutes(app: FastifyTypeInstance) {

  app.get("/", {
  preHandler: [app.authenticate],
  schema: {
    tags: ["clients"],
    description: "List all clients",
    querystring: z.object({
      q: z.string().optional(),
      status: clientResponseSchema.shape.status.optional(),
      phone: z.string().optional(),
      nif: z.string().optional(),
      from: z.string().optional(),
      to: z.string().optional(),
    }),
    response: { 200: z.array(clientResponseSchema) }
  }
}, async (req) => {
  const { q, status, phone, nif, from, to } = req.query

  const dateFilter = from || to ? {
    date: {
      ...(from && { gte: from }),
      ...(to && { lte: to }),
    }
  } : {}

  return await prisma.client.findMany({
    where: {
      ...(q && {
        OR: [
          { name:    { contains: q } },
          { email:   { contains: q } },
          { isCorporative: { contains: q } },
          { phone:   { contains: q } },
          { nif:     { contains: q } },
        ],
      }),
      ...(status && { status }),
      ...(phone && { phone: { contains: phone } }),
      ...(nif && { nif: { contains: nif } }),
      ...dateFilter,
    },
    orderBy: { name: "asc" },
    select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        isCorporative: true,
        nif: true,
        avatar: true,
        date: true,
      }
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
      where: { id: request.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        isCorporative: true,
        nif: true,
        avatar: true,
        date: true,
      }
    })

    if (!client) return reply.status(404).send({ message: "Client not found" })

    return reply.status(200).send(client)
  })

  // POST
  app.post("/", {
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
    const { isCorporative, name, email, phone, role = Role.Client, nif, password, avatar, status } = request.body

    const alreadyExists = await prisma.client.findFirst({ where: { email } })
    if (alreadyExists) return reply.status(400).send({ message: "Cliente já existe!" })

    const hashedPassword = await hashPassword(password)   

    const client = await prisma.client.create({
      data: {
        isCorporative,
        name,
        email,
        phone,
        role,
        nif: nif || null,
        password : hashedPassword, 
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

    const { password, ...restData } = request.body as any
    
    const updateData: any = { ...restData }
    
    if (password) {
      updateData.password = await hashPassword(password) 
    }   

    await prisma.client.update({
      where: { id: request.params.id },
      data: updateData,
        select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        isCorporative: true,
        nif: true,
        avatar: true,
        date: true,
      }
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

    const { password, ...restData } = request.body as any
    
    const updateData: any = { ...restData }
    
    if (password) {
      updateData.password = await hashPassword(password) 
    }  

    await prisma.client.update({
      where: { id: request.params.id },
      data: updateData,
       select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        isCorporative: true,
        nif: true,
        avatar: true,
        date: true,
      }
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