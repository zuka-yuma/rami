// ノードの詳細編集パネル。ステータス・優先度・期限・nodeType 切替を持つ。
// TreeNode / PhaseNode の下に開閉式で表示される。

import type { TreeNode as TreeNodeType, Status, Priority } from "../types"
import { useTreeContext } from "../contexts/TreeContext"
import { useState, useRef } from "react"

interface Props {
    node: TreeNodeType
}

export default function NodeDetail({ node }: Props) {
    const { updateNode, toggleNodeType } = useTreeContext()

    const isValidDate = (s: string): boolean => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
        const d = new Date(s)
        return !isNaN(d.getTime())
    }

    const initial = node.deadline?.slice(0, 10) ?? ""
    const isValid = isValidDate(initial)
    const [year, setYear] = useState<string>(isValid ? initial.slice(0, 4): "")
    const [month, setMonth] = useState<string>(isValid ? initial.slice(5, 7) : "")
    const [day, setDay] = useState<string>(isValid ? initial.slice(8, 10): "")
    const [errorFields, setErrorFields] = useState<Array<"year" | "month" | "day">>([])
    const [isModified, setIsModified] = useState<boolean>(false)

    const findInvalidFields = (y: string, m: string, d: string): Array<"year" | "month" | "day"> => {
        const errors: Array<"year" | "month" | "day"> =[]
        const yearNum = Number(y)
        const monthNum = Number(m)
        const dayNum = Number(d)
        if (y.length !== 4 || yearNum < 1 || yearNum > 9999) errors.push("year")
        if (monthNum < 1 || monthNum > 12) errors.push("month")
        if (dayNum < 1 || dayNum > 31) errors.push("day")
        if (errors.length === 0) {
            const composed = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
            const date = new Date(composed)
            if (isNaN(date.getTime()) || date.getDate() !== dayNum) {
                errors.push("day")
            }
        }
        return errors
    }

    const yearRef = useRef<HTMLInputElement>(null)
    const monthRef = useRef<HTMLInputElement>(null)
    const dayRef = useRef<HTMLInputElement>(null)

    const handleToggleType = async() => {
        const newType = node.nodetype === "task" ? "phase" : "task"
        await toggleNodeType(node.id, {nodeType: newType})
    }

    // 日付 input 群（年・月・日）の中でフォーカスが移動するだけのときは
    // saveDeadline をスキップする。自動フォーカス移動による blur 連鎖で
    // 意図せず saveDeadline が複数回走るのを防ぐ。
    // Enter キーや日付 input 群の外への移動では relatedTarget が他になるので
    // 通常通り saveDeadline が呼ばれる。
    // また、別ウィンドウへの移動（document.hasFocus() === false）は saveDeadline をスキップ
    // することで、戻ってきたときに「2 回目」カウントされてしまうのを防ぐ。
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const next = e.relatedTarget as HTMLElement | null
        if (next === yearRef.current || next === monthRef.current || next === dayRef.current) {
            return
        }
        // setTimeout で 1 ティック遅らせて、blur 直後の正確なフォーカス状態を取得する
        setTimeout(() => {
            if (!document.hasFocus()) return
            saveDeadline()
        }, 0)
    }

    const saveDeadline = () => {
        if (!year && !month && !day) {
            updateNode(node.id, { deadline: null })
            setIsModified(false)
            return
        }
        if (!year || !month || !day) {
            return
        }
        const invalid = findInvalidFields(year, month, day)
        if (invalid.length === 0) {
            const composed = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
            updateNode(node.id, { deadline: composed })
            setErrorFields([])
            setIsModified(false)
            return
        }
        if (errorFields.length > 0 && !isModified) {
            updateNode(node.id, { deadline: null })
            setYear(""); setMonth(""); setDay("")
            setErrorFields([])
            setIsModified(false)
            return
        }
        setErrorFields(invalid)
        const order: Array<"year" | "month" | "day"> = ["year", "month", "day"]
        const first = order.find(f => invalid.includes(f))
        if (first === "year")yearRef.current?.focus()
        else if (first === "month") monthRef.current?.focus()
        else if (first === "day") dayRef.current?.focus()
        setIsModified(false)
    }

    return (
        <div className="ml-4 mt-2 p-3 bg-gray-50 rounded border text-sm">
            <div className="flex flex-wrap gap-3 items-center">
                <label>
                    ステータス:
                    <select
                        value={node.status}
                        onChange = {(e) => updateNode(node.id, { status: e.target.value as Status})}
                        className="ml-1 border rounded px-1"
                    >
                        <option value="todo">未着手</option>
                        <option value="in_progress">進行中</option>
                        <option value="done">完了</option>
                    </select>
                </label>

                <label>
                    優先度:
                    <select
                        value={node.priority}
                        onChange={(e) => updateNode(node.id, { priority: e.target.value as Priority })}
                        className="ml-1 border rounded px-1"
                    >
                        <option value="high">高</option>
                        <option value="medium">中</option>
                        <option value="low">低</option>
                    </select>
                </label>

                <label>
                    期限:
                    {/* 年・月・日を別 input に分け、表示上の "-" は span で描画。
                       保存時に saveDeadline で "YYYY-MM-DD" 形式に組み立てる。 */}
                    <span className="inline-flex items-center gap-1 ml-1">
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            ref={yearRef}
                            placeholder="YYYY"
                            value={year}
                            onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, "")
                                setYear(v)
                                setIsModified(true)
                                // 4 桁入力したら month へ自動フォーカス移動
                                if (v.length === 4) monthRef.current?.focus()
                            }}
                            onBlur={handleBlur}
                            onKeyDown={(e) => {
                                // blur が発火すると onBlur 経由で saveDeadline が呼ばれるので、
                                // ここでは saveDeadline を直接呼ばない（二重実行防止）
                                if (e.key === "Enter") e.currentTarget.blur()
                            }}
                            className={`w-14 border rounded px-1 text-center focus:outline-none focus:ring-2 ${errorFields.includes("year") ? "border-red-500 border-2 focus:ring-red-300" : "focus:ring-blue-300"}`}
                        />
                        <span>-</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={2}
                            ref={monthRef}
                            placeholder="MM"
                            value={month}
                            onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, "")
                                setMonth(v)
                                setIsModified(true)
                                // 2 桁入力したら day へ自動フォーカス移動
                                if (v.length === 2) dayRef.current?.focus()
                            }}
                            onBlur={handleBlur}
                            onKeyDown={(e) => {
                                // blur が発火すると onBlur 経由で saveDeadline が呼ばれるので、
                                // ここでは saveDeadline を直接呼ばない（二重実行防止）
                                if (e.key === "Enter") e.currentTarget.blur()
                            }}
                            className={`w-10 border rounded px-1 text-center focus:outline-none focus:ring-2 ${errorFields.includes("month") ? "border-red-500 border-2 focus:ring-red-300" : "focus:ring-blue-300"}`}
                        />
                        <span>-</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={2}
                            ref={dayRef}
                            placeholder="DD"
                            value={day}
                            onChange={(e) => {
                                setDay(e.target.value.replace(/\D/g, ""))
                                setIsModified(true)
                            }}
                            onBlur={handleBlur}
                            onKeyDown={(e) => {
                                // blur が発火すると onBlur 経由で saveDeadline が呼ばれるので、
                                // ここでは saveDeadline を直接呼ばない（二重実行防止）
                                if (e.key === "Enter") e.currentTarget.blur()
                            }}
                            className={`w-10 border rounded px-1 text-center focus:outline-none focus:ring-2 ${errorFields.includes("day") ? "border-red-500 border-2 focus:ring-red-300" : "focus:ring-blue-300"}`}
                        />
                    </span>
                </label>

                <button
                    type="button"
                    onClick={handleToggleType}
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                    {node.nodetype === "task" ? "→ Phase に切替" : "→ Task に切替"}
                </button>
            </div>
        </div>
    )
}
