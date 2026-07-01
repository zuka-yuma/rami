// アプリケーション上部のツールバー。
// ルートにタスク/フェーズを追加するボタンと、ユーザー情報・ログアウトボタンを表示。

import { useAddNode } from "../contexts/AddNodeContext"
import { useAuth } from "../contexts/AuthContext"

interface Props {
    hideDone: boolean
    onToggleHideDone: () => void
    onToggleSidebar: () => void
}

export default function Toolbar({ hideDone, onToggleHideDone, onToggleSidebar }: Props) {
    const openAdd = useAddNode()
    const { user, logout } = useAuth()

    return (
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-100 border-b">
            <div className="flex items-center gap-1.5 min-w-0 overflow-x-auto">
                <button
                    type="button"
                    onClick={onToggleSidebar}
                    aria-label="サイドバー表示切り替え"
                    className="md:hidden shrink-0 px-2 py-1 rounded hover:bg-gray-200"
                >
                    ☰
                </button>
                <button
                    type="button"
                    onClick={() => openAdd()}
                    className="shrink-0 whitespace-nowrap px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    ＋追加
                </button>
                <button
                    type="button"
                    onClick={onToggleHideDone}
                    className={`shrink-0 whitespace-nowrap px-3 py-1 rounded ${hideDone
                        ? "bg-gray-700 text-white"
                        : "bg-gray-200 hover:bg-gray-300"}`}
                >
                    {hideDone ? "完了表示" : "完了を隠す"}
                </button>
            </div>
            <div className="flex items-center gap-2 shrink-0 text-sm">
                <span className="hidden sm:inline text-gray-600">{user?.name}</span>
                <button
                    type="button"
                    onClick={logout}
                    className="whitespace-nowrap px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                    ログアウト
                </button>
            </div>
        </div>
    )
}
