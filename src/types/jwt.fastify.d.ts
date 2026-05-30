import '@fastify/jwt'

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload :  {
      sub : string
      email: string
      role :  Role
    }

    user:  {
      sub : string
      email: string
      role :  Role
    }
  }
}