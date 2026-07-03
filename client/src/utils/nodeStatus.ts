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

const findNode = (nodes: TreeNode[], id: string): TreeNode | null => {
    for (const n of nodes) {
        if (n.id === id) return n;
        const f = findNode(n.children, id);
        if (f) return f;
    }
    return null;
};

// phase のステップの status 変更が順序ルール上許可されるか。
// - 最後の done 以前(手前)は自由
// - それより後ろ: todo→in_progress は「最後の in_progress の後の最初の todo」だけ、
//   in_progress→done は「最後の done の後の最初の in_progress」だけ
// phase の子でなければ常に true(自由)
export const stepChangeAllowed = (node: TreeNode, tree: TreeNode[]): boolean => {
    if (node.parentId == null) return true;
    const parent = findNode(tree, node.parentId);
    if (!parent || parent.nodetype !== "phase") return true;
    const sib = parent.children;
    const idx = sib.findIndex(s => s.id === node.id);
    let lastDone = -1;
    for (let i = 0; i < sib.length; i++) if (sib[i].status === "done") lastDone = i;
    if (idx <= lastDone) return true;
    if (node.status === "todo") {
        let lastIp = -1;
        for (let i = 0; i < sib.length; i++) if (sib[i].status === "in_progress") lastIp = i;
        return idx === sib.findIndex((s, i) => i > lastIp && s.status === "todo");
    }
    if (node.status === "in_progress") {
        return idx === sib.findIndex((s, i) => i > lastDone && s.status === "in_progress");
    }
    return true;
};

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
