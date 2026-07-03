// ドロップ先の挿入ライン。ノードカード(relative)の中に絶対配置で描く。
// 縦並び(ルート直下・スマホ)は上下のライン、横並び(孫以降・PC)は左右のライン。

interface Props {
    edge: "before" | "after";
    depth: number;
}

export function DropLine({ edge, depth }: Props) {
    const base = "pointer-events-none absolute z-10 rounded bg-sky-400";
    const horiz = edge === "before"
        ? `${base} left-0 right-0 -top-1 h-0.5`
        : `${base} left-0 right-0 -bottom-1 h-0.5`;

    // depth<=1（ルート直下）は常に縦並び → 上下ラインのみ
    if (depth <= 1) return <div className={horiz} />;

    // depth>=2 は PC で横並び。スマホ=上下ライン / PC=左右ラインで出し分け
    const vert = edge === "before"
        ? `${base} top-0 bottom-0 -left-1 w-0.5`
        : `${base} top-0 bottom-0 -right-1 w-0.5`;
    return (
        <>
            <div className={`${horiz} md:hidden`} />
            <div className={`${vert} hidden md:block`} />
        </>
    );
}
