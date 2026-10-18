import { UnauthorizedError } from "../utils/errors.js"
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js"

const mode = process.env.MCP_TRANSPORT
if (mode !== undefined && mode !== "stdio" && mode !== "http") {
  throw new Error("MCP_TRANSPORT の値が不正")
}

export const getUserId = (authInfo: AuthInfo | undefined): string => {
  if (mode === "stdio" || mode === undefined) {
    if (process.env.RAMI_USER_ID === "" || process.env.RAMI_USER_ID === undefined) {
      throw new Error("USER_ID の値が未定義")
    }
    return process.env.RAMI_USER_ID
  } else if (mode === "http") {

    if (authInfo?.extra !== undefined && typeof authInfo?.extra.userId === "string") {
      return authInfo.extra.userId
    }
    throw new UnauthorizedError()
  }
  throw new Error("MCP_TRANSPORT の値が不正")
}
