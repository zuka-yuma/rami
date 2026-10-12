// ステータスドットのクリック処理をまとめたフック。
// 順序ルール(stepChangeAllowed)の判定と、2つの強制手段(Shift+クリック / 長押し)を扱う。
// 強制手段がデスクトップ専用のShiftだけだとモバイルで逃げ道が無いため、長押しを併設している。

import { useCallback, useEffect, useRef, useState } from "react"
import type { PointerEvent as ReactPointerEvent, MouseEvent } from "react"
import type { TreeNode } from "../types"
import { useTreeContext } from "../contexts/TreeContext"
import { nextStatus, stepChangeAllowed } from "../utils/nodeStatus"

// 長押しが強制として成立するまでの時間。index.css の force-ring アニメーションと揃える。
const LONG_PRESS_MS = 500

export const useStatusCycle = (node: TreeNode) => {
    const { tree, updateNode } = useTreeContext()
    const [denied, setDenied] = useState<boolean>(false)
    const [pressing, setPressing] = useState<boolean>(false)
    // 長押し成立をクリックより先に判定するため、state ではなく ref で持つ
    const forcedRef = useRef<boolean>(false)
    const timerRef = useRef<number | null>(null)

    const clearTimer = useCallback(() => {
        if (timerRef.current !== null) {
            window.clearTimeout(timerRef.current)
            timerRef.current = null
        }
        setPressing(false)
    }, [])

    // アンマウント時にタイマーを残さない
    useEffect(() => clearTimer, [clearTimer])

    const applyNext = useCallback(async () => {
        await updateNode(node.id, { status: nextStatus(node.status) })
    }, [node.id, node.status, updateNode])

    const onPointerDown = useCallback((e: ReactPointerEvent) => {
        e.stopPropagation()
        forcedRef.current = false
        setPressing(true)
        timerRef.current = window.setTimeout(() => {
            forcedRef.current = true
            timerRef.current = null
            setPressing(false)
            void applyNext()
        }, LONG_PRESS_MS)
    }, [applyNext])

    const onClick = useCallback((e: MouseEvent) => {
        e.stopPropagation()
        clearTimer()
        // 長押しで既に遷移済みならクリックでは何もしない
        if (forcedRef.current) {
            forcedRef.current = false
            return
        }
        if (!e.shiftKey && !stepChangeAllowed(node, tree)) {
            setDenied(true)
            window.setTimeout(() => setDenied(false), 800)
            return
        }
        void applyNext()
    }, [applyNext, clearTimer, node, tree])

    const dotHandlers = {
        onClick,
        onPointerDown,
        onPointerUp: clearTimer,
        onPointerLeave: clearTimer,
        onPointerCancel: clearTimer,
        // モバイルの長押しでコンテキストメニューが出るのを防ぐ
        onContextMenu: (e: MouseEvent) => e.preventDefault(),
    }

    return { denied, pressing, dotHandlers }
}
