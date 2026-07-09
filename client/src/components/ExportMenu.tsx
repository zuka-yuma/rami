import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import { ConfirmDialog } from './ConfirmDialog'
import { getJSON, getCSV, pushJSON } from '../api/transfer'

export function ExportMenu({ onImported }: { onImported: () => void }) {
    const [menuOpen, setMenuOpen] = useState(false)
    const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const exportBtnRef = useRef<HTMLButtonElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const pendingData = useRef<unknown>(null)

    const toggleMenu = () => {
        if (!menuOpen && exportBtnRef.current) {
            const rect = exportBtnRef.current.getBoundingClientRect()
            setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
        }
        setMenuOpen((o) => !o)
    }

    const handleExportJSON = async () => {
        setMenuOpen(false)
        const res = await getJSON()
        const url = window.URL.createObjectURL(new Blob([res]))
        const link = document.createElement('a')
        link.href = url
        link.download = 'rami.json'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
    }

    const handleExportCSV = async () => {
        setMenuOpen(false)
        const res = await getCSV()
        const url = window.URL.createObjectURL(new Blob([res]))
        const link = document.createElement('a')
        link.href = url
        link.download = 'rami.csv'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
    }

    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        e.target.value = '' 
        if (!file) return
        const text = await file.text()
        try {
            pendingData.current = JSON.parse(text)
            setConfirmOpen(true)
        } catch (error) {
            if (error instanceof SyntaxError) {
                console.error(error)
                toast.error('JSON の読み込みに失敗しました')
            }
        }
    }

    const handleConfirmImport = async () => {
        setConfirmOpen(false)
        if (!pendingData.current) return
        try {
            await pushJSON(pendingData.current)
            onImported()
            toast.success('インポートしました')
        } catch (error) {
            console.error(error)
            toast.error('JSON の反映に失敗しました')
        }
    }
    
    return (
        <>
            <div className="flex items-center gap-1.5">
                <div className="relative">
                    <button
                        ref={exportBtnRef}
                        onClick={toggleMenu}
                        className="rounded-md bg-neutral-800 px-3 py-1.5 text-sm hover:bg-neutral-700"
                    >
                        エクスポート ▾
                    </button>
                    {menuOpen && menuPos && createPortal(
                        <div
                            style={{ position: 'fixed', top: menuPos.top, right: menuPos.right }}
                            className="z-50 w-44 overflow-hidden rounded-md border border-neutral-800 bg-neutral-900 shadow-lg"
                        >
                            <button
                                onClick={handleExportJSON}
                                className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-800"
                            >
                                JSON
                            </button>
                            <button
                                onClick={handleExportCSV}
                                className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-800"
                            >
                                CSV
                            </button>
                        </div>,
                        document.body
                    )}
                </div>

                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-md bg-neutral-800 px-3 py-1.5 text-sm hover:bg-neutral-700"
                >
                    インポート
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={handleFileSelected}
                />
            </div>

            <ConfirmDialog
                open={confirmOpen}
                title="ツリーをインポート"
                message="現在のツリーはすべて置き換えられます。続けますか？"
                confirmLabel="インポート"
                onConfirm={handleConfirmImport}
                onCancel={() => setConfirmOpen(false)}
            />
        </>
    )
}
