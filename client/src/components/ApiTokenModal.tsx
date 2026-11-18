// MCP / Webhook 用 API トークンの発行モーダル。
// 見た目のみ。データの取得・発行・失効は props 経由で親から渡す。

import { useState } from 'react'
import toast from 'react-hot-toast'
import type { ApiTokenSummary } from '../types'

type Props = {
    open: boolean
    onClose: () => void
    tokens: ApiTokenSummary[]
    issuedToken: string | null
    onIssue: (name: string) => void
    onRevoke: (id: string) => void
    loading?: boolean
}

const formatDate = (value: string | null) =>
    value ? new Date(value).toLocaleString('ja-JP', { dateStyle: 'short', timeStyle: 'short' }) : '—'

export function ApiTokenModal({
    open,
    onClose,
    tokens,
    issuedToken,
    onIssue,
    onRevoke,
    loading = false,
}: Props) {
    const [name, setName] = useState('')
    const [showRevoked, setShowRevoked] = useState(false)

    if (!open) return null

    // 失効済みは監査のため残すが、既定では隠す
    const revokedCount = tokens.filter((t) => t.revokedAt !== null).length
    const visibleTokens = showRevoked ? tokens : tokens.filter((t) => t.revokedAt === null)

    const handleIssue = () => {
        const trimmed = name.trim()
        if (!trimmed) return
        onIssue(trimmed)
        setName('')
    }

    const handleCopy = async () => {
        if (!issuedToken) return
        try {
            await navigator.clipboard.writeText(issuedToken)
            toast.success('コピーしました')
        } catch (error) {
            console.error(error)
            toast.error('コピーに失敗しました')
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-lg border border-neutral-800 bg-neutral-900 shadow-xl">
                <div className="flex items-start justify-between border-b border-neutral-800 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-neutral-100">API トークン</h2>
                        <p className="mt-1 text-sm text-neutral-400">
                            Claude の MCP 接続や Webhook からの登録に使います。
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="閉じる"
                        className="rounded-md px-2 py-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {/* 発行直後の平文トークン。再表示できないので最も目立つ位置に置く */}
                    {issuedToken && (
                        <div className="mb-5 rounded-md border border-amber-500/50 bg-amber-500/10 p-4">
                            <p className="text-sm font-medium text-amber-200">
                                このトークンは今だけ表示されます
                            </p>
                            <p className="mt-1 text-xs text-amber-200/80">
                                閉じると二度と表示できません。コピーして安全な場所に保管してください。
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                                <code className="flex-1 overflow-x-auto rounded bg-neutral-950 px-3 py-2 font-mono text-sm text-neutral-200">
                                    {issuedToken}
                                </code>
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="shrink-0 rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-amber-400"
                                >
                                    コピー
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex items-end gap-2">
                        <label className="flex-1">
                            <span className="block text-sm text-neutral-300">用途がわかる名前</span>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleIssue() }}
                                placeholder="Claude Desktop / 自宅サーバーの cron など"
                                className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-neutral-500 focus:outline-none"
                            />
                        </label>
                        <button
                            type="button"
                            onClick={handleIssue}
                            disabled={loading || !name.trim()}
                            className="shrink-0 rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            発行
                        </button>
                    </div>

                    <div className="mt-6">
                        <div className="flex items-center justify-between gap-2">
                            <h3 className="text-sm font-medium text-neutral-300">発行済み</h3>
                            {revokedCount > 0 && (
                                <label className="flex items-center gap-1.5 text-xs text-neutral-400">
                                    <input
                                        type="checkbox"
                                        checked={showRevoked}
                                        onChange={(e) => setShowRevoked(e.target.checked)}
                                        className="accent-blue-500"
                                    />
                                    失効済みも表示（{revokedCount}）
                                </label>
                            )}
                        </div>
                        {loading ? (
                            <p className="mt-3 text-sm text-neutral-500">読み込み中…</p>
                        ) : tokens.length === 0 ? (
                            <p className="mt-3 text-sm text-neutral-500">
                                まだありません。上のフォームから発行してください。
                            </p>
                        ) : visibleTokens.length === 0 ? (
                            <p className="mt-3 text-sm text-neutral-500">
                                有効なトークンはありません。
                            </p>
                        ) : (
                            <div className="mt-3 overflow-x-auto">
                                <table className="w-full border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b border-neutral-800 text-left text-xs uppercase text-neutral-500">
                                            <th className="py-2 pr-4 font-medium">名前</th>
                                            <th className="py-2 pr-4 font-medium whitespace-nowrap">作成</th>
                                            <th className="py-2 pr-4 font-medium whitespace-nowrap">最終使用</th>
                                            <th className="py-2 font-medium" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visibleTokens.map((token) => {
                                            const revoked = token.revokedAt !== null
                                            return (
                                                <tr
                                                    key={token.id}
                                                    className={`border-b border-neutral-800/60 ${revoked ? 'text-neutral-500' : ''}`}
                                                >
                                                    <td className="py-2 pr-4">
                                                        <span className={revoked ? 'line-through' : 'text-neutral-200'}>
                                                            {token.name}
                                                        </span>
                                                        {revoked && (
                                                            <span className="ml-2 rounded bg-neutral-800 px-1.5 py-0.5 text-xs text-neutral-400">
                                                                失効
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-2 pr-4 whitespace-nowrap text-neutral-400">
                                                        {formatDate(token.createdAt)}
                                                    </td>
                                                    <td className="py-2 pr-4 whitespace-nowrap text-neutral-400">
                                                        {formatDate(token.lastUsedAt)}
                                                    </td>
                                                    <td className="py-2 whitespace-nowrap text-right">
                                                        {revoked ? (
                                                            // 失効日時を残す。lastUsedAt がこれより後なら失効が間に合っていない
                                                            <span className="text-xs text-neutral-500">
                                                                {formatDate(token.revokedAt)} に失効
                                                            </span>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => onRevoke(token.id)}
                                                                className="rounded-md px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
                                                            >
                                                                失効
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
