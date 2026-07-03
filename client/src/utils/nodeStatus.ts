// ノードのステータス●の色付け用。自分＋全子孫の中で最も緊急度の高い状態を返す。
// 優先順位: 遅延(in_progress かつ期限切れ) > 期限切れ(todo かつ期限切れ) > in_progress > todo > done

import type { TreeNode } from "../types";

export type Urgency = "delay" | "overdue" | "in_progress" | "todo" | "done";

const isOverdue = (deadline: string | null): boolean =>
    deadline != null && new Date(deadline) < new Date();

const selfUrgency = (node: TreeNode): Urgency => {
    if (node.status === "in_progress" && isOverdue(node.deadline)) return "delay";
    if (node.status === "todo" && isOverdue(node.deadline)) return "overdue";
    return node.status;
};

const RANK: Record<Urgency, number> = { delay: 5, overdue: 4, in_progress: 3, todo: 2, done: 1 };

// 期限テキストの色。そのノード自身の期限×ステータスで決める。
export const deadlineColor = (node: TreeNode): string => {
    if (isOverdue(node.deadline) && node.status === "in_progress") return "text-orange-400";
    if (isOverdue(node.deadline) && node.status === "todo") return "text-red-400";
    return "text-slate-400";
};

export const subtreeUrgency = (node: TreeNode): Urgency => {
    let worst = selfUrgency(node);
    for (const child of node.children) {
        const u = subtreeUrgency(child);
        if (RANK[u] > RANK[worst]) worst = u;
    }
    return worst;
};
