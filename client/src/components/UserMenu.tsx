// ツールバー右端のユーザーメニュー。
// ユーザー名をクリックするとドロップダウンが開き、API トークン・ログアウトを選べる。
// 今後の設定項目はこのメニューに足していく。

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../contexts/AuthContext'

export function UserMenu({ onOpenTokens }: { onOpenTokens: () => void }) {
    const { user, logout } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)
    const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null)
    const btnRef = useRef<HTMLButtonElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    // ExportMenu と同じ方式。親の overflow-x-auto に切られないよう、
    // ボタンの位置を測って portal で body 直下に fixed で出す。
    const toggleMenu = () => {
        if (!menuOpen && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect()
            setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
        }
        setMenuOpen((o) => !o)
    }

    // 外クリックと Esc で閉じる。設定メニューは誤爆のコストが高いので ExportMenu より厳しくする。
    useEffect(() => {
        if (!menuOpen) return
        const handlePointerDown = (e: PointerEvent) => {
            const target = e.target as Node
            if (menuRef.current?.contains(target) || btnRef.current?.contains(target)) return
            setMenuOpen(false)
        }
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMenuOpen(false)
        }
        document.addEventListener('pointerdown', handlePointerDown)
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [menuOpen])

    const selectItem = (action: () => void) => () => {
        setMenuOpen(false)
        action()
    }

    return (
        <div className="relative">
            <button
                ref={btnRef}
                type="button"
                onClick={toggleMenu}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-sm text-slate-300 hover:bg-slate-700"
            >
                <span className="max-w-32 truncate">{user?.name}</span>
                <span aria-hidden="true" className="text-xs">▾</span>
            </button>

            {menuOpen && menuPos && createPortal(
                <div
                    ref={menuRef}
                    role="menu"
                    style={{ position: 'fixed', top: menuPos.top, right: menuPos.right }}
                    className="z-50 w-44 overflow-hidden rounded-md border border-neutral-800 bg-neutral-900 text-neutral-200 shadow-lg"
                >
                    <button
                        type="button"
                        role="menuitem"
                        onClick={selectItem(onOpenTokens)}
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-800"
                    >
                        API トークン
                    </button>
                    <div className="border-t border-neutral-800" />
                    <button
                        type="button"
                        role="menuitem"
                        onClick={selectItem(logout)}
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-800"
                    >
                        ログアウト
                    </button>
                </div>,
                document.body
            )}
        </div>
    )
}
