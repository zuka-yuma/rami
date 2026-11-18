import { client } from "./client";
import type { IssueApiTokenInput, ApiTokenSummary, ApiToken } from "../types";

export async function issueApiToken(body: IssueApiTokenInput) {
  return await client.post<ApiToken>("/tokens", body)
    .then(res => res.data)
}

export async function listApiTokens() {
  return await client.get<ApiTokenSummary[]>("/tokens")
    .then(res => res.data)
}

export async function revokeApiToken(id: string) {
  return await client.post(`/tokens/${id}/revoke`)
}
