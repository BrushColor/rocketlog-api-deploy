import { Request, Response } from "express"
import { AppError } from "@/utils/AppError"
import { prisma } from "@/database/prisma"
import { hash } from "bcrypt"
import z from "zod"

class UsersController {
  async create(request: Request, response: Response){
    const bodySchema = z.object({
      name: z.string().trim().min(3),
      email: z.string().email(),
      password: z.string().min(6)
    })
    
    const { name, email, password } = bodySchema.parse(request.body)

    const userWithShameEmail = await prisma.user.findFirst({ where: { email } })

    if(userWithShameEmail) {
      throw new AppError("user with same email already exists")
    }

    const hashedPassword = await hash(password, 8)
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    })

    const { password: _, ...userWithountPassword } = user

    return response.status(201).json(userWithountPassword)
  }
  
}

export { UsersController }