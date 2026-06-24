import { useAuth } from './contexts/AuthContext'
import LoginForm from './components/LoginForm'

function App() {
  const {user, loading, logout} = useAuth()

  if (loading === true) return (
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
    <div><p>ログイン中: {user.name}さん</p>
      <button onClick={logout}>logout</button></div>
  )
}

export default App
