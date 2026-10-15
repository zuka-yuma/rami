import { UnauthorizedError } from "../utils/errors.js"

export const getUserId = (): string => {
  if (process.env.RAMI_USER_ID === "" || process.env.RAMI_USER_ID === undefined) {
    throw new UnauthorizedError()
  }
  return process.env.RAMI_USER_ID
}
