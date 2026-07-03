// ドラッグ中の「どこに落ちるか」を各ノードに配る。
// { overId, position } を持ち、各ノードが自分の id と照合してインジケータを描く。

import { createContext, useContext } from "react";

export type DropTarget = { overId: string; position: "before" | "after" | "inside" } | null;

const DropIndicatorContext = createContext<DropTarget>(null);

export const DropIndicatorProvider = DropIndicatorContext.Provider;

// eslint-disable-next-line react-refresh/only-export-components
export const useDropIndicator = () => useContext(DropIndicatorContext);
