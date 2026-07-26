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
  avatar:  z.string().nullable().optional(),
})

export async function clientsPrintRoutes(app: FastifyTypeInstance) {

  app.get("/", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["print"],
      description: "List clients for report (respects q/status/phone/nif filters when provided)",
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
  }, async (request) => {
    const { q, status, phone, nif , from , to} = request.query

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
            { name:          { contains: q } },
            { email:         { contains: q } },
            { isCorporative: { contains: q } },
            { phone:         { contains: q } },
            { nif:           { contains: q } },
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
}