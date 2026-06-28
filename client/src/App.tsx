import { useAuth } from './contexts/AuthContext'
import LoginForm from './components/LoginForm'
import { TreeProvider } from './contexts/TreeContext'
import TreeView from './components/TreeView'
import Toolbar from './components/Toolbar'

function App() {
  const { user, loading } = useAuth()

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
      <Toolbar />
      <div className="p-4">
        <TreeView />
      </div>
    </TreeProvider>
  )
}

export default App
