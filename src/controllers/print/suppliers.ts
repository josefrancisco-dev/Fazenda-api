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

export async function supplierPrintRoutes(app: FastifyTypeInstance) {

  app.get("/", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["print"],
      description: "List all suppliers",
      response: { 200: z.array(supplierResponseSchema) }, 
       querystring: z.object({
        q: z.string().optional(),
        status: supplierResponseSchema.shape.status.optional(),
        phone: z.string().optional(),
        nif: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
      }),
    }
  }, async (request) => {
    
    const { q , status, phone, nif, from, to} = request.query

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
}