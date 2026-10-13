import { describe, expect, it } from "vitest"
import { authenticate } from "./authenticate.js"
import type { FastifyRequest } from "fastify"
import { UnauthorizedError } from "../utils/errors.js"
import jwt from "jsonwebtoken"
import { generateAccessToken } from "../utils/jwt.js"
import { config } from "../config.js"

describe("authenticate", () => {
    const request = (head?: string) => ({
      headers: head === undefined ? {} : { authorization: head }
    }) as unknown as FastifyRequest
    it("no header", async () => {
      await expect(authenticate(request())).rejects.toThrow(UnauthorizedError)
    })
    it("blank token", async () => {
      await expect(authenticate(request("Bearer "))).rejects.toThrow(UnauthorizedError)
    })
    it("invalid token", async () => {
      await expect(authenticate(request("Bearer not-a-jwt"))).rejects.toThrow(UnauthorizedError)
    })
    it("wrong secret", async () => {
      await expect(authenticate(request(`Bearer ${jwt.sign({ userId: "u1" }, "wrong-secret")}`))).rejects.toThrow(UnauthorizedError)
    })
    it("payload mismatch", async () => {
      await expect(authenticate(request(`Bearer ${jwt.sign({ pay: "load" }, config.jwt.secret)}`))).rejects.toThrow(UnauthorizedError)
    })
    it("correct token", async () => {
      const correctRequest = request(`Bearer ${generateAccessToken("u1")}`)
      await authenticate(correctRequest)
      expect(correctRequest.user.userId).toBe("u1")
    })
})
