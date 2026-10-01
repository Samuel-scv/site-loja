import { useEffect, useState } from "react"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Auth from "./pages/Auth"
import Conta from "./pages/Conta"
import Historico from "./pages/Historico"
import Vendedor from "./pages/Vendedor"
import { api, decodeToken } from "./lib/api"

const PAGINAS_PROTEGIDAS = ["conta", "historico", "vendedor"]

function App() {
  const [page, setPage] = useState("home")
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [user, setUser] = useState(null)

  function navigate(to) {
    if (PAGINAS_PROTEGIDAS.includes(to) && !token) {
      setPage("auth")
      return
    }
    setPage(to)
  }

  function handleLogin(newToken) {
    localStorage.setItem("token", newToken)
    setToken(newToken)
    setPage("home")
  }

  function handleLogout() {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
    setPage("home")
  }

  // busca nome, tipo e saldos do usuário logado (GET /auth/me)
  async function carregarUsuario() {
    try {
      const res = await api.get("/auth/me")
      setUser(res.data)
    } catch {
      // token expirado/inválido -> desloga
      handleLogout()
    }
  }

  useEffect(() => {
    if (!token) {
      setUser(null)
      return
    }

    const payload = decodeToken(token)
    if (!payload?.userId || payload.exp * 1000 < Date.now()) {
      handleLogout()
      return
    }

    carregarUsuario()
  }, [token])

  return (
    <div className="min-h-screen bg-linear-to-br from-bg-from to-bg-to">
      <Navbar onNavigate={navigate} onLogout={handleLogout} token={token} user={user} />
      {page === "home" && <Home token={token} user={user} onAtualizar={carregarUsuario} />}
      {page === "auth" && <Auth onLogin={handleLogin} />}
      {page === "conta" && <Conta user={user} />}
      {page === "historico" && <Historico />}
      {page === "vendedor" && <Vendedor user={user} />}
    </div>
  )
}

export default App
