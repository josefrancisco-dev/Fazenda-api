import { FastifyTypeInstance } from "../../types"
import prisma from "../../../prisma"
import z from "zod"

export async function authRoutes(app: FastifyTypeInstance) {

  app.post('/login', {
    schema: {
      tags: ["auth"],
      description: "Login de utilizador",
      body: z.object({
        email:    z.string().email(),
        password: z.string().min(1),
      }),
      response: {
        200: z.object({ token: z.string() }),
        400: z.object({ error: z.string() }),
      }
    }
  },
    async (request, reply) => {
    const { email, password } = request.body as any

    const user = await prisma.client.findUnique({
      where: { email }
    })

    if (!user) {
      return reply.status(400).send({ error: "User not found" })
    }
    // const isValid = await bcrypt.compare(password, user.password)
    const isValid = await password === user.password

    if (!isValid) {
      return reply.status(400).send({ error: "Invalid password" })
    }

    const token = app.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    })

    return { token }
  })


  app.get('/me' , {preHandler : [app.authenticate]}, async (req, replay) => {
    const clientId  = req.user.sub

    const client = await prisma.client.findUnique({
      where : {id :  clientId},

      select :  
      {
      id : true,
      name: true,
      email: true,
      role: true, 
      phone:   true,  
      company: true,   
      nif:     true, 
      avatar:  true,
      }

    })

    if(! client) {
      return replay.status(404).send({message : "Cliente não encontrado !"})
    }

    return replay.send({client})
  })

  app.get('/logout', { preHandler: [app.authenticate] }, async (req, reply) => {
    return reply.send({ message: "Logout realizado com sucesso" })
  })
}
