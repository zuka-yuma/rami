import { createContext, useContext, useState, type ReactNode } from "react"
import { useIsDesktop } from "../utils/nodeStatus"

export type DisplayMode = "vertical" | "horizontal"

interface IDisplayModeContext {
    displayMode: DisplayMode
    setDisplayMode: (mode: DisplayMode) => void
}

const DisplayModeContext = createContext<IDisplayModeContext>({
    displayMode: "horizontal",
    setDisplayMode: () => {}
})

export function DisplayModeProvider({ children }: { children: ReactNode }) {
    const isDesktop = useIsDesktop()
    const [displayMode, setDisplayMode] = useState<DisplayMode>(isDesktop ? "horizontal" : "vertical")

    return (
        <DisplayModeContext.Provider value={{ displayMode, setDisplayMode }}>
            {children}
        </DisplayModeContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useDisplayMode = () => useContext(DisplayModeContext)
