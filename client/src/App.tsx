import { useAuth } from './contexts/AuthContext'
import LoginForm from './components/LoginForm'
import { TreeProvider } from './contexts/TreeContext'
import TreeView from './components/TreeView'
import Toolbar from './components/Toolbar'
import { useState } from 'react'

function App() {
  const { user, loading } = useAuth()
  const [ hideDone, setHideDone ] = useState<boolean>(false)

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
      <Toolbar 
      hideDone={hideDone}
      onToggleHideDone={() => setHideDone(v => !v)} 
      />
      <div className="p-4">
        <TreeView hideDone={hideDone} />
      </div>
    </TreeProvider>
  )
}

export default App
