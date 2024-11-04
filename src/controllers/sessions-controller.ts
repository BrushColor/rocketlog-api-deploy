import { Request, Response } from "express"
import { AppError } from "@/utils/AppError"
import { authConfig } from "@/configs/auth"
import { sign } from "jsonwebtoken";
import { prisma } from "@/database/prisma"
import { compare } from "bcrypt"
import { z } from "zod"

class SessionsController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      email: z.string(),
      password: z.string().min(6)
    })

    const { email, password } = bodySchema.parse(request.body)

    const user = await prisma.user.findFirst({
      where: { email },  
    })

    if (!user) {
      throw new AppError("Invalid email or password", 401)
    }

    const passwordMatched = await compare(password, user.password)

    if(!passwordMatched) {
      throw new AppError("Invalid email or password", 401)
    }

    const { secret, expiresIn } = authConfig.jwt

    const token = sign({ role: user.role ?? "customer"}, secret, {
      subject: user.id,
      expiresIn
    })

    const { password: hashedPassword, ...userWhithoutPassword } = user
    
    return response.json({ token, user: userWhithoutPassword })
  }
}

export { SessionsController }