import type {
  FastifyInstance, 
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  RawServerDefault, 
  FastifyBaseLogger
}
 from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"

 export type FastifyTypeInstance = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression, 
  RawReplyDefaultExpression, 
  FastifyBaseLogger,
  ZodTypeProvider
 > 

export type Client = {
  company: string
  name: string
  email: string
  phone: string
  role: string
  nif: string
  avatar?: string
  status: "Customer" | "Lead" | "Active"
}
