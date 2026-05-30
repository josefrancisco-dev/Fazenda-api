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
      response: { 200: z.array(supplierResponseSchema) }
    }
  }, async () => {
    return await prisma.supplier.findMany({
      orderBy: { name: "asc" }
    })
  })
}