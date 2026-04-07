// import z from "zod"
// import { FastifyTypeInstance } from "../../types"
// import { randomUUID } from "node:crypto"

// const clientResponseSchema = z.object({
//   id: z.string().uuid(),
//   name: z.string(),
//   role: z.string(),
//   status: z.enum(['Customer', 'Lead', 'Active']),
//   // date: z.string(),
//   company: z.string(),
//   email: z.email(),
//   phone: z.string(),
//   nif: z.string(),
//   avatar: z.string().optional(),
// })

// const clientBodySchema = clientResponseSchema.omit({ id: true })

// type Client = z.infer<typeof clientResponseSchema>

// const clients: Client[] = []

// export async function clientsRoutes(app: FastifyTypeInstance) {

//   app.get("/", {
//     schema: {
//       tags: ["clients"],
//       description: "List all clients",
//       response: { 200: z.array(clientResponseSchema) }
//     }
//   }, () => clients)

//   app.get("/:id", {
//     schema: {
//       tags: ["clients"],
//       description: "Get client by ID",
//       params: z.object({ id: z.string().uuid() }),
//       response: {
//         200: clientResponseSchema,
//         404: z.object({ message: z.string() })
//       }
//     }
//   }, async (request, reply) => {
//     const client = clients.find(c => c.id === request.params.id)
//     if (!client) return reply.status(404).send({ message: "Client not found" })
//     return reply.status(200).send(client)
//   })

//   app.post("/", {
//     schema: {
//       tags: ["clients"],
//       description: "Create a new client",
//       body: clientBodySchema,
//       response: { 201: z.object({ id: z.string() }) }
//     }
//   }, async (request, reply) => {
//     const newClient: Client = { id: randomUUID(), ...request.body }
//     clients.push(newClient)
//     return reply.status(201).send({ id: newClient.id })
//   })

//   app.put("/:id", {
//     schema: {
//       tags: ["clients"],
//       description: "Update a client fully",
//       params: z.object({ id: z.string().uuid() }),
//       body: clientBodySchema,
//       response: {
//         200: z.object({ message: z.string() }),
//         404: z.object({ message: z.string() })
//       }
//     }
//   }, async (request, reply) => {
//     const index = clients.findIndex(c => c.id === request.params.id)
//     if (index === -1) return reply.status(404).send({ message: "Client not found" })
//     clients[index] = { id: request.params.id, ...request.body }
//     return reply.status(200).send({ message: "Client updated successfully" })
//   })

//   app.patch("/:id", {
//     schema: {
//       tags: ["clients"],
//       description: "Partially update a client",
//       params: z.object({ id: z.string().uuid() }),
//       body: clientBodySchema.partial(),
//       response: {
//         200: z.object({ message: z.string() }),
//         404: z.object({ message: z.string() })
//       }
//     }
//   }, async (request, reply) => {
//     const index = clients.findIndex(c => c.id === request.params.id)
//     if (index === -1) return reply.status(404).send({ message: "Client not found" })
//     clients[index] = { ...clients[index], ...request.body }
//     return reply.status(200).send({ message: "Client patched successfully" })
//   })

//   app.delete("/:id", {
//     schema: {
//       tags: ["clients"],
//       description: "Delete a client",
//       params: z.object({ id: z.string().uuid() }),
//       response: {
//         200: z.object({ message: z.string() }),
//         404: z.object({ message: z.string() })
//       }
//     }
//   }, async (request, reply) => {
//     const index = clients.findIndex(c => c.id === request.params.id)
//     if (index === -1) return reply.status(404).send({ message: "Client not found" })
//     clients.splice(index, 1)
//     return reply.status(200).send({ message: "Client deleted successfully" })
//   })
// }

import z from "zod"
import { FastifyTypeInstance } from "../../types"
import prisma from "../../../prisma"

const clientResponseSchema = z.object({
  id:      z.string().uuid(),
  name:    z.string(),
  role:    z.string(),
  status:  z.enum(['Customer', 'Lead', 'Active']),
  date:    z.string(),
  company: z.string(),
  email:   z.email(),
  phone:   z.string(),
  nif:     z.string(),
  avatar:  z.string().nullable().optional(),
})

const clientBodySchema = clientResponseSchema.omit({ id: true, date: true })

export async function clientsRoutes(app: FastifyTypeInstance) {

  // GET ALL
  app.get("/", {
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
    const { company, name, email, phone, role, nif, avatar, status } = request.body

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
        avatar: avatar ?? null,
        status,
        date: new Date().toLocaleDateString("pt-PT")
      }
    })

    return reply.status(201).send({ id: client.id })
  })

  // PUT
  app.put("/:id", {
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