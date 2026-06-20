import z from "zod"
import { FastifyTypeInstance } from "../../types"
import prisma from "../../../prisma"

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
  password:  z.string(),
  avatar:  z.string().nullable().optional(),
})

export async function clientsPrintRoutes(app: FastifyTypeInstance) {

  // GET ALL
  app.get("/", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["print"],
      description: "List all clients",
      response: { 200: z.array(clientResponseSchema) }
    }
  }, async () => {
    return await prisma.client.findMany({
      orderBy: { name: "asc" }
    })
  })
}