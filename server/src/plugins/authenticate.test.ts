import { describe, expect, it } from "vitest"
import { authenticate } from "./authenticate.js"
import type { FastifyRequest, FastifyReply } from "fastify"
import { UnauthorizedError } from "../utils/errors.js"
import jwt from "jsonwebtoken"
import { generateAccessToken } from "../utils/jwt.js"
import { config } from "../config.js"

describe("authenticate", () => {
    const request = (head?: string) => ({
      headers: head === undefined ? {} : { authorization: head }
    }) as unknown as FastifyRequest
    const reply = () => ({}) as unknown as FastifyReply
    it("no header", async () => {
      await expect(authenticate(request(), reply())).rejects.toThrow(UnauthorizedError)
    })
    it("blank token", async () => {
      await expect(authenticate(request("Bearer "), reply())).rejects.toThrow(UnauthorizedError)
    })
    it("invalid token", async () => {
      await expect(authenticate(request("Bearer not-a-jwt"), reply())).rejects.toThrow(UnauthorizedError)
    })
    it("wrong secret", async () => {
      await expect(authenticate(request(`Bearer ${jwt.sign({ userId: "u1" }, "wrong-secret")}`), reply())).rejects.toThrow(UnauthorizedError)
    })
    it("payload mismatch", async () => {
      await expect(authenticate(request(`Bearer ${jwt.sign({ pay: "load" }, config.jwt.secret)}`), reply())).rejects.toThrow(UnauthorizedError)
    })
    it("correct token", async () => {
      const correctRequest = request(`Bearer ${generateAccessToken("u1")}`)
      await authenticate(correctRequest, reply())
      expect(correctRequest.user.userId).toBe("u1")
    })
})
