import { describe, expect, it } from 'vitest'
import { prisma } from '../../test/setup.js'
import { issueApiToken, listApiTokens, revokeApiToken, verifyApiToken } from './apiToken.service.js'
import { UnauthorizedError } from '../../utils/errors.js'

const createUser = (email: string) =>
  prisma.user.create({
    data: { name: email, email, password: 'password' },
  })

const findToken = (userId: string) =>
  prisma.apiToken.findFirst({ where: { userId } })

describe('apiToken.service', () => {
  it('発行したトークンで userId が解決できる', async () => {
    const user = await createUser('issue@example.com')
    const plain = await issueApiToken(user.id, 'test')

    expect(plain.startsWith('rami_')).toBe(true)
    await expect(verifyApiToken(plain)).resolves.toBe(user.id)
  })

  it('失効させると verify が落ちる', async () => {
    const user = await createUser('revoke@example.com')
    const plain = await issueApiToken(user.id, 'test')
    const token = await findToken(user.id)

    expect(await revokeApiToken(user.id, token!.id)).toBe(1)
    await expect(verifyApiToken(plain)).rejects.toThrow(UnauthorizedError)
  })

  // where に userId を入れている意図を固定する。コードを読むだけでは
  // 「意図してそうした」のか「たまたまそうなっている」のか区別できない。
  it('他人のトークンは失効させられない', async () => {
    const owner = await createUser('owner@example.com')
    const other = await createUser('other@example.com')
    const plain = await issueApiToken(owner.id, 'owner token')
    const token = await findToken(owner.id)

    expect(await revokeApiToken(other.id, token!.id)).toBe(0)

    // 他人が叩いても失効していないこと
    const after = await prisma.apiToken.findUnique({ where: { id: token!.id } })
    expect(after?.revokedAt).toBeNull()
    await expect(verifyApiToken(plain)).resolves.toBe(owner.id)
  })

  it('二重失効は成功を返し、最初の失効日時を上書きしない', async () => {
    const user = await createUser('twice@example.com')
    await issueApiToken(user.id, 'test')
    const token = await findToken(user.id)

    expect(await revokeApiToken(user.id, token!.id)).toBe(1)
    const first = await prisma.apiToken.findUnique({ where: { id: token!.id } })

    expect(await revokeApiToken(user.id, token!.id)).toBe(1)
    const second = await prisma.apiToken.findUnique({ where: { id: token!.id } })

    expect(second?.revokedAt).toEqual(first?.revokedAt)
  })

  it('存在しない id は 0 を返す', async () => {
    const user = await createUser('missing@example.com')
    expect(await revokeApiToken(user.id, '00000000-0000-0000-0000-000000000000')).toBe(0)
  })

  it('一覧は失効済みを含み、他人のものは含まない', async () => {
    const user = await createUser('list@example.com')
    const other = await createUser('list-other@example.com')
    await issueApiToken(user.id, 'keep')
    await issueApiToken(other.id, 'other')
    const mine = await prisma.apiToken.findFirst({ where: { userId: user.id } })
    await revokeApiToken(user.id, mine!.id)

    const tokens = await listApiTokens(user.id)
    expect(tokens).toHaveLength(1)
    expect(tokens[0]!.name).toBe('keep')
    expect(tokens[0]!.revokedAt).not.toBeNull()
    expect(tokens[0]).not.toHaveProperty('tokenHash')
  })
})
