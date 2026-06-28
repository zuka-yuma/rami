// アプリケーション上部のツールバー。
// ルートにタスク/フェーズを追加するボタンと、ユーザー情報・ログアウトボタンを表示。

import { useTreeContext } from "../contexts/TreeContext"
import { useAuth } from "../contexts/AuthContext"
import type { NodeType } from "../types"

export default function Toolbar() {
    const { addNode } = useTreeContext()
    const { user, logout } = useAuth()

    // ルートに新規ノードを追加する共通ハンドラ。
    // parentId を省略するとサーバー側で top-level（ルート）として作成される。
    const handleAdd = async (nodeType: NodeType) => {
        const title = window.prompt(`${nodeType === "task" ? "タスク" : "フェーズ"}のタイトル`)
        if (!title) return
        await addNode({
            title,
            nodeType,
            priority: "medium",
        })
    }

    return (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b">
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => handleAdd("task")}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    ＋ タスク追加
                </button>
                <button
                    type="button"
                    onClick={() => handleAdd("phase")}
                    className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                    ＋ フェーズ追加
                </button>
            </div>
            <div className="flex items-center gap-3 text-sm">
                <span>ログイン中: {user?.name}</span>
                <button
                    type="button"
                    onClick={logout}
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                    ログアウト
                </button>
            </div>
        </div>
    )
}
