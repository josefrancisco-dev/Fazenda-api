import z from "zod"
import prisma from "../../../prisma"
import { FastifyTypeInstance } from "../../types"

export const categorySchema = z.object({
  id:          z.string().uuid(),
  name:        z.string(),
  description: z.string().nullable(),
})

const categoryBodySchema = z.object({
  name:        z.string().min(2),
  description: z.string().optional(),
})

export async function categoriesRoutes(app: FastifyTypeInstance) {

  app.get("/", {
    schema: {
      tags: ["categories"],
      description: "List all categories",
      response: {
        200: z.array(categorySchema)
      }
    }
  }, async () => {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc"
      }
    })

    return categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
    }))
  })

  app.get("/:id", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["categories"],
      description: "Get category by ID",
      params: z.object({
        id: z.string().uuid(),
      }),
      response: {
        200: categorySchema,
        404: z.object({
          message: z.string(),
        })
      }
    }
  }, async (request, reply) => {
    const category = await prisma.category.findUnique({
      where: {
        id: request.params.id
      }
    })

    if (!category) {
      return reply.status(404).send({
        message: "Category not found"
      })
    }

    return reply.status(200).send({
      id: category.id,
      name: category.name,
      description: category.description,
    })
  })

  app.post("/", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["categories"],
      description: "Create category",
      body: categoryBodySchema,
      response: {
        201: z.object({
          id: z.string().uuid(),
        }),
        400: z.object({
          message: z.string(),
        })
      }
    }
  }, async (request, reply) => {
    const { name, description } = request.body

    const categoryAlreadyExists = await prisma.category.findUnique({
      where: { name }
    })

    if (categoryAlreadyExists) {
      return reply.status(400).send({
        message: "Category already exists"
      })
    }

    const category = await prisma.category.create({
      data: { name, description }
    })

    return reply.status(201).send({
      id: category.id
    })
  })

  app.put("/:id", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["categories"],
      description: "Update category",
      params: z.object({
        id: z.string().uuid(),
      }),
      body: categoryBodySchema,
      response: {
        200: z.object({
          message: z.string(),
        }),
        404: z.object({
          message: z.string(),
        })
      }
    }
  }, async (request, reply) => {
    const { id } = request.params
    const { name, description } = request.body

    const categoryExists = await prisma.category.findUnique({
      where: { id }
    })

    if (!categoryExists) {
      return reply.status(404).send({
        message: "Category not found"
      })
    }

    await prisma.category.update({
      where: { id },
      data: { name, description }
    })

    return reply.status(200).send({
      message: "Category updated successfully"
    })
  })

  app.patch("/:id", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["categories"],
      description: "Patch category",
      params: z.object({
        id: z.string().uuid(),
      }),
      body: categoryBodySchema.partial(),
      response: {
        200: z.object({
          message: z.string(),
        }),
        404: z.object({
          message: z.string(),
        })
      }
    }
  }, async (request, reply) => {
    const { id } = request.params

    const categoryExists = await prisma.category.findUnique({
      where: { id }
    })

    if (!categoryExists) {
      return reply.status(404).send({
        message: "Category not found"
      })
    }

    await prisma.category.update({
      where: { id },
      data: request.body
    })

    return reply.status(200).send({
      message: "Category patched successfully"
    })
  })

  app.delete("/:id", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["categories"],
      description: "Delete category",
      params: z.object({
        id: z.string().uuid(),
      }),
      response: {
        200: z.object({
          message: z.string(),
        }),
        404: z.object({
          message: z.string(),
        }),
        400: z.object({
          message: z.string(),
        })
      }
    }
  }, async (request, reply) => {
    const { id } = request.params

    const categoryExists = await prisma.category.findUnique({
      where: { id },
      include: { products: true }
    })

    if (!categoryExists) {
      return reply.status(404).send({
        message: "Category not found"
      })
    }

    if (categoryExists.products.length > 0) {
      return reply.status(400).send({
        message: "Category has related products"
      })
    }

    await prisma.category.delete({
      where: { id }
    })

    return reply.status(200).send({
      message: "Category deleted successfully"
    })
  })
}