import { useAuth } from './contexts/AuthContext'
import LoginForm from './components/LoginForm'
import { TreeProvider } from './contexts/TreeContext'
import { AddNodeProvider } from './contexts/AddNodeContext'
import { DisplayModeProvider } from './contexts/DisplayModeContext'
import TreeView from './components/TreeView'
import Toolbar from './components/Toolbar'
import Sidebar from './components/Sidebar'
import { ApiTokenModal } from './components/ApiTokenModal'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'

function App() {
  const { user, loading } = useAuth()
  const [ hideDone, setHideDone ] = useState<boolean>(false)
  const [ selectedRootId, setSelectedRootId ] = useState<string | null>(null)
  const [ sidebarOpen, setSidebarOpen ] = useState<boolean>(false)
  const [ tokenModalOpen, setTokenModalOpen ] = useState<boolean>(false)

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
          onOpenTokens={() => setTokenModalOpen(true)}
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
      {/* TODO(Phase 7): tokens / issuedToken / onIssue / onRevoke に実データを配線する。
          /api/tokens 系のエンドポイントはサーバー側に未実装。 */}
      <ApiTokenModal
        open={tokenModalOpen}
        onClose={() => setTokenModalOpen(false)}
        tokens={[]}
        issuedToken={null}
        onIssue={() => {}}
        onRevoke={() => {}}
      />
      </DisplayModeProvider>
      </AddNodeProvider>
    </TreeProvider>
  )
}

export default App
