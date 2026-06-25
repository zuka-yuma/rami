import { PrismaClient } from '../../generated/prisma/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcrypt'
import { generateAccessToken, generateRefreshToken} from '../../utils/jwt.js'
import { UnauthorizedError, ConflictError } from '../../utils/errors.js'
import { config } from '../../config.js'

const adapter = new PrismaPg({ connectionString: config.databaseURL })
const prisma = new PrismaClient({ adapter })

export async function register(email: string, username: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (user == null) {
        const hashedPass = await bcrypt.hash(password, 12)
        const userData = await prisma.user.create({
            data: {
                email: email,
                name: username,
                password: hashedPass,
            }
        })
        const atoken = generateAccessToken(userData.id)
        const rtoken = generateRefreshToken(userData.id)
        const limit = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        await prisma.token.create({
                data: {
                    token: rtoken, 
                    userId: userData.id,
                    limit: limit
                }
            })
            const tokens: { atoken: string, rtoken: string } = { atoken: atoken, rtoken: rtoken }
            return tokens
    } else {
        throw new ConflictError()
    }
}

export async function login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email }})
    if (user == null) {
        throw new UnauthorizedError()
    } else {
        if (await bcrypt.compare(password, user.password)) {
            const atoken = generateAccessToken(user.id)
            const rtoken = generateRefreshToken(user.id)
            const limit = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            await prisma.token.create({
                data: {
                    token: rtoken, 
                    userId: user.id,
                    limit: limit
                }
            })
            const tokens: { atoken: string, rtoken: string } = { atoken: atoken, rtoken: rtoken }
            return tokens
        } else {
            throw new UnauthorizedError()
        }
    }
}

export async function refresh(token: string) {
    const user = await prisma.token.findUnique({ where: { token }})
    if (user == null) {
        throw new UnauthorizedError()
    } else {
        if (user.limit < new Date()) {
            throw new UnauthorizedError()
        } else {
            const atoken = generateAccessToken(user.userId)
            return atoken
        }
    }
}

export async function logout(token: string) {
    await prisma.token.deleteMany({where: { token } })
}

export async function getUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id }})
    if (user == null) {
        throw new UnauthorizedError()
    } else {
        return { id: user.id, email: user.email, name: user.name }
    }
}