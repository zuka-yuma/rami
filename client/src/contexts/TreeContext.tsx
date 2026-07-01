import { createContext, useContext, type ReactNode } from "react";
import { useTree } from "../hooks/useTree";
import type { TreeNode, CreateNodeInput, UpdateNodeInput, MoveNodeInput, ToggleTypeInput, AddStepsInput, ReorderInput } from "../types"

interface ITreeContext {
    tree: TreeNode[]
    loading: boolean
    addNode: (input: CreateNodeInput) => Promise<void>
    updateNode: (id: string, input: UpdateNodeInput) => Promise<void>
    removeNode: (id: string) => Promise<void>
    moveNode: (id: string, input: MoveNodeInput) => Promise<void>
    toggleNodeType: (id: string, input: ToggleTypeInput) => Promise<void>
    addSteps: (parentId: string, input: AddStepsInput) => Promise<void>
    reorderSteps: (parentId: string | null, input: ReorderInput) => Promise<void>
    reorderNodes: (parentId: string | null, input: ReorderInput) => Promise<void>
}

const TreeContext = createContext<ITreeContext>({
    tree: [],
    loading: true,
    addNode: async () => {},
    updateNode: async () => {},
    removeNode: async () => {},
    moveNode: async () => {},
    toggleNodeType: async () => {},
    addSteps: async () => {},
    reorderSteps: async () => {},
    reorderNodes: async () => {}
})

export const TreeProvider = ( props: { children: ReactNode } ) => {

    const { tree, loading, addNode, updateNode, removeNode, moveNode, toggleNodeType, addSteps, reorderSteps, reorderNodes } = useTree()

    return (
        <TreeContext.Provider
            value={{
                tree,
                loading,
                addNode,
                updateNode,
                removeNode,
                moveNode,
                toggleNodeType,
                addSteps,
                reorderSteps,
                reorderNodes
            }}>
                {props.children}
        </TreeContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTreeContext = () => useContext(TreeContext)