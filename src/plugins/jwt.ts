import fp from "fastify-plugin"
import jwt from "@fastify/jwt"

export default fp(async (app) => {

  app.register(jwt, {
    secret: "supersecret"
  })

  app.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.status(401).send({ error: "Não autorizado" })
    }
  })
})