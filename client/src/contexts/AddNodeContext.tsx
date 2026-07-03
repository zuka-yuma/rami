// ノード追加モーダルをアプリ全体で共有するための Provider。
// どのボタンからも openAdd(parentId) で開ける。parentId 省略/null でルート追加。

import { createContext, useContext, useState, type ReactNode } from "react";
import AddNodeModal from "../components/AddNodeModal";

const AddNodeContext = createContext<(parentId?: string | null) => void>(() => {});

// eslint-disable-next-line react-refresh/only-export-components
export const useAddNode = () => useContext(AddNodeContext);

export function AddNodeProvider({ children }: { children: ReactNode }) {
    const [target, setTarget] = useState<{ parentId: string | null } | null>(null);
    const openAdd = (parentId: string | null = null) => setTarget({ parentId });

    return (
        <AddNodeContext.Provider value={openAdd}>
            {children}
            {target && <AddNodeModal parentId={target.parentId} onClose={() => setTarget(null)} />}
        </AddNodeContext.Provider>
    );
}
