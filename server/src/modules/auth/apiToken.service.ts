import { PrismaClient } from '../../generated/prisma/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { createHash, randomBytes } from 'node:crypto'
import { config } from '../../config.js'
import { UnauthorizedError } from '../../utils/errors.js'

const adapter = new PrismaPg({ connectionString: config.databaseURL })
const prisma = new PrismaClient({ adapter })

const hashToken = (plain: string) => {
  const hash = createHash('sha256')
  hash.update(plain)
  return hash.digest('hex')
}

export async function issueApiToken(userId: string, name: string) {
  const length = 32
  const result = randomBytes(length).toString('base64url')
  const openResult = "rami_" + result

  const hashed = hashToken(openResult)
  const shortHashed = openResult.slice(0, 13);
  await prisma.apiToken.create({
    data: {
      tokenHash: hashed,
      userId: userId,
      name: name,
      prefix: shortHashed,
      lastUsedAt: null,
      revokedAt: null,
      expiresAt: null,
    }
  })
  return openResult
}

export async function verifyApiToken(plain: string) {
  const apiToken = await prisma.apiToken.findUnique({
    where: {
      tokenHash: hashToken(plain)
    }
  })
  const nowDate = new Date().valueOf()
  if (apiToken === null) throw new UnauthorizedError()
  if ((apiToken.revokedAt !== null) || (apiToken.expiresAt !== null && apiToken.expiresAt < new Date())) throw new UnauthorizedError()
  if (apiToken.lastUsedAt === null || nowDate.valueOf() - apiToken.lastUsedAt.valueOf() >= 5 * 60 * 1000) {
    try {
      await prisma.apiToken.update({
        where: {
          tokenHash: apiToken.tokenHash
        },
        data: {
          lastUsedAt: new Date()
        }
      })
    } catch (e) { console.error(e) }
  }
  return apiToken.userId
}
