type ConfirmDialogProps = {
    open: boolean
    title: string
    message: string
    confirmLabel?: string
    onConfirm: () => void
    onCancel: () => void
}

export function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = '実行',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-sm rounded-lg border border-neutral-800 bg-neutral-900 p-6 shadow-xl">
                <h2 className="text-lg font-semibold text-neutral-100">{title}</h2>
                <p className="mt-2 text-sm text-neutral-400">{message}</p>
                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        className="rounded-md bg-neutral-800 px-3 py-1.5 text-sm hover:bg-neutral-700"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={onConfirm}
                        className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium hover:bg-red-500"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}
