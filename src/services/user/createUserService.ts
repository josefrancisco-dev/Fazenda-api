import { Client } from "@/types"
import prisma from "../../../prisma"

class CreateUserService {
  async execute({
      company, 
      name,
      email,
      phone,
      role, 
      nif,
      avatar, 
      status 
    }: Client) {
    const createUser = await prisma.client.create({
      data: {
        company,   
        name,
        email,
        phone,
        role, 
        nif,
        avatar: avatar ?? null,
        status,
        date: new Date().toLocaleDateString("pt-PT"), 
      }
    })
    return createUser
  }
}

export { CreateUserService }