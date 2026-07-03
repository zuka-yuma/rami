// 「完了を隠す」状態を各ノードに配る。ツリーはフィルタせず全ノードを持ったまま、
// 各ノードが表示時に done の子を除外する（StepProgress などは全ステップで計算するため）。

import { createContext, useContext } from "react";

const HideDoneContext = createContext(false);

export const HideDoneProvider = HideDoneContext.Provider;

// eslint-disable-next-line react-refresh/only-export-components
export const useHideDone = () => useContext(HideDoneContext);
