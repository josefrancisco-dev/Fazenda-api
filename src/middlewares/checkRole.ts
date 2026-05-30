// // src/middlewares/checkRole.ts
// import { FastifyRequest, FastifyReply } from "fastify"
// import { Role } from "@prisma/client"

// export function checkRole(...roles: Role[]) {
//   return async (request: FastifyRequest, reply: FastifyReply) => {
//     await request.jwtVerify() // verifica token

//     const user = request.user as { sub: string; email: string; role: Role }

//     if (!roles.includes(role)) {
//       return reply.status(403).send({ message: "Sem permissão!" })
//     }
//   }
// }