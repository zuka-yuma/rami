import { useAuth } from './contexts/AuthContext'
import LoginForm from './components/LoginForm'
import { TreeProvider } from './contexts/TreeContext'
import { AddNodeProvider } from './contexts/AddNodeContext'
import TreeView from './components/TreeView'
import Toolbar from './components/Toolbar'
import Sidebar from './components/Sidebar'
import { useState } from 'react'

function App() {
  const { user, loading } = useAuth()
  const [ hideDone, setHideDone ] = useState<boolean>(false)
  const [ selectedRootId, setSelectedRootId ] = useState<string | null>(null)
  const [ sidebarOpen, setSidebarOpen ] = useState<boolean>(false)

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
      <div className="flex flex-col h-screen">
        <Toolbar
          hideDone={hideDone}
          onToggleHideDone={() => setHideDone(v => !v)}
          onToggleSidebar={() => setSidebarOpen(v => !v)}
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
      </AddNodeProvider>
    </TreeProvider>
  )
}

export default App
