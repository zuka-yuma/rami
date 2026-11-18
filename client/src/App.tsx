import { useAuth } from './contexts/AuthContext'
import LoginForm from './components/LoginForm'
import { TreeProvider } from './contexts/TreeContext'
import { AddNodeProvider } from './contexts/AddNodeContext'
import { DisplayModeProvider } from './contexts/DisplayModeContext'
import TreeView from './components/TreeView'
import Toolbar from './components/Toolbar'
import Sidebar from './components/Sidebar'
import { ApiTokenModal } from './components/ApiTokenModal'
import { issueApiToken, listApiTokens, revokeApiToken } from './api/tokens'
import type { ApiTokenSummary } from './types'
import toast, { Toaster } from 'react-hot-toast'
import { useState } from 'react'

function App() {
  const { user, loading } = useAuth()
  const [ hideDone, setHideDone ] = useState<boolean>(false)
  const [ selectedRootId, setSelectedRootId ] = useState<string | null>(null)
  const [ sidebarOpen, setSidebarOpen ] = useState<boolean>(false)
  const [ tokenModalOpen, setTokenModalOpen ] = useState<boolean>(false)
  const [ tokens, setTokens ] = useState<ApiTokenSummary[]>([])
  const [ issuedToken, setIssuedToken ] = useState<string | null>(null)
  const [ tokensLoading, setTokensLoading ] = useState<boolean>(false)

  // 一覧はサーバーを正とする。発行・失効のあとは必ず取り直す
  const loadTokens = async () => {
    setTokensLoading(true)
    try {
      setTokens(await listApiTokens())
    } catch (error) {
      console.error(error)
      toast.error('トークンの取得に失敗しました')
    } finally {
      setTokensLoading(false)
    }
  }

  // 開くたびに平文を捨てる。残すと発行していないトークンが出ているように見える
  const openTokens = () => {
    setIssuedToken(null)
    setTokenModalOpen(true)
    void loadTokens()
  }

  const closeTokens = () => {
    setTokenModalOpen(false)
    setIssuedToken(null)
  }

  const handleIssue = async (name: string) => {
    try {
      const issued = await issueApiToken({ name })
      setIssuedToken(issued.token)
      await loadTokens()
    } catch (error) {
      console.error(error)
      setIssuedToken(null)
      toast.error('トークンの発行に失敗しました')
    }
  }

  const handleRevoke = async (id: string) => {
    try {
      await revokeApiToken(id)
      await loadTokens()
      toast.success('失効しました')
    } catch (error) {
      console.error(error)
      toast.error('失効に失敗しました')
    }
  }

  if (loading) return (
    <div>
      <p>Loading...</p>
    </div>
  )

  if (!user) return (
    <div>
      <LoginForm />
    </div>
  )

  return (
    <TreeProvider>
      <AddNodeProvider>
      <DisplayModeProvider>
      <Toaster position="top-right" toastOptions={{ style: { background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155" } }} />
      <div className="flex flex-col h-screen bg-slate-950 text-slate-200">
        <Toolbar
          hideDone={hideDone}
          onToggleHideDone={() => setHideDone(v => !v)}
          onToggleSidebar={() => setSidebarOpen(v => !v)}
          onOpenTokens={openTokens}
        />
        <div className="flex flex-1 min-h-0">
          <Sidebar
            selectedRootId={selectedRootId}
            onSelect={(id) => { setSelectedRootId(id); setSidebarOpen(false) }}
            open={sidebarOpen}
          />
          <main className="flex-1 overflow-auto p-4">
            <TreeView
              hideDone={hideDone}
              rootId={selectedRootId}
            />
          </main>
        </div>
      </div>
      <ApiTokenModal
        open={tokenModalOpen}
        onClose={closeTokens}
        tokens={tokens}
        issuedToken={issuedToken}
        onIssue={(name) => void handleIssue(name)}
        onRevoke={(id) => void handleRevoke(id)}
        loading={tokensLoading}
      />
      </DisplayModeProvider>
      </AddNodeProvider>
    </TreeProvider>
  )
}

export default App
