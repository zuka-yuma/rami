// ノード追加モーダル。種類(タスク/フェーズ)・タイトル・優先度・期限(任意)を入力する。
// parentId が null ならルート、指定があればその子として追加する。
// 期限は年/月/日を別 input に分け、送信時に "YYYY-MM-DD" に組み立てる(NodeDetail と同方式)。

import { useState, useRef } from "react";
import { useTreeContext } from "../contexts/TreeContext";
import type { NodeType, Priority } from "../types";

interface Props {
    parentId: string | null;
    onClose: () => void;
}

const isValidDate = (s: string): boolean => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const d = new Date(s);
    return !isNaN(d.getTime()) && d.getDate() === Number(s.slice(8, 10));
};

export default function AddNodeModal({ parentId, onClose }: Props) {
    const { addNode } = useTreeContext();
    const [nodeType, setNodeType] = useState<NodeType>("task");
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState<Priority>("medium");
    const [year, setYear] = useState("");
    const [month, setMonth] = useState("");
    const [day, setDay] = useState("");
    const [dateError, setDateError] = useState(false);

    const yearRef = useRef<HTMLInputElement>(null);
    const monthRef = useRef<HTMLInputElement>(null);
    const dayRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async () => {
        if (!title.trim()) return;
        let deadline: string | undefined;
        if (year || month || day) {
            const composed = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
            if (!year || !month || !day || !isValidDate(composed)) {
                setDateError(true);
                return;
            }
            deadline = composed;
        }
        await addNode({
            title: title.trim(),
            nodeType,
            priority,
            ...(parentId ? { parentId } : {}),
            ...(deadline ? { deadline } : {}),
        });
        onClose();
    };

    const dateFieldClass = (w: string) =>
        `${w} border rounded px-1 text-center focus:outline-none focus:ring-2 ${
            dateError ? "border-red-500 border-2 focus:ring-red-300" : "border-slate-600 bg-slate-700 text-slate-100 focus:ring-blue-300"}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="w-80 rounded-lg bg-slate-800 p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <h2 className="mb-3 text-lg font-semibold text-slate-100">ノードを追加</h2>

                <div className="mb-3 flex gap-2">
                    <button type="button" onClick={() => setNodeType("task")}
                        className={`flex-1 rounded px-3 py-1 ${nodeType === "task" ? "bg-blue-500 text-white" : "bg-slate-700 text-slate-200"}`}>
                        タスク
                    </button>
                    <button type="button" onClick={() => setNodeType("phase")}
                        className={`flex-1 rounded px-3 py-1 ${nodeType === "phase" ? "bg-purple-500 text-white" : "bg-slate-700 text-slate-200"}`}>
                        フェーズ
                    </button>
                </div>

                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="タイトル" autoFocus
                    onKeyDown={(e) => { if (e.key === "Enter") handleSubmit() }}
                    className="mb-3 w-full rounded border border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-400 px-2 py-1" />

                <label className="mb-3 flex items-center justify-between text-sm text-slate-200">
                    優先度
                    <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}
                        className="rounded border border-slate-600 bg-slate-700 text-slate-100 px-2 py-1">
                        <option value="high">高</option>
                        <option value="medium">中</option>
                        <option value="low">低</option>
                    </select>
                </label>

                <div className="mb-4 flex items-center justify-between text-sm text-slate-200">
                    期限
                    <span className="inline-flex items-center gap-1">
                        <input type="text" inputMode="numeric" maxLength={4} ref={yearRef} placeholder="YYYY"
                            value={year}
                            onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, "");
                                setYear(v); setDateError(false);
                                if (v.length === 4) monthRef.current?.focus();
                            }}
                            className={dateFieldClass("w-14")} />
                        <span>-</span>
                        <input type="text" inputMode="numeric" maxLength={2} ref={monthRef} placeholder="MM"
                            value={month}
                            onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, "");
                                setMonth(v); setDateError(false);
                                if (v.length === 2) dayRef.current?.focus();
                            }}
                            className={dateFieldClass("w-10")} />
                        <span>-</span>
                        <input type="text" inputMode="numeric" maxLength={2} ref={dayRef} placeholder="DD"
                            value={day}
                            onChange={(e) => { setDay(e.target.value.replace(/\D/g, "")); setDateError(false); }}
                            className={dateFieldClass("w-10")} />
                    </span>
                </div>

                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onClose}
                        className="rounded bg-slate-700 px-3 py-1 text-slate-200 hover:bg-slate-600">
                        キャンセル
                    </button>
                    <button type="button" onClick={handleSubmit} disabled={!title.trim()}
                        className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600 disabled:opacity-50">
                        追加
                    </button>
                </div>
            </div>
        </div>
    );
}
