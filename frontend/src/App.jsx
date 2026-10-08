import { useEffect, useState } from "react"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Detalhe from "./pages/Detalhe"
import Perguntas from "./pages/Perguntas"
import Auth from "./pages/Auth"
import Conta from "./pages/Conta"
import Historico from "./pages/Historico"
import Vendedor from "./pages/Vendedor"
import Admin from "./pages/Admin"
import { api, decodeToken } from "./lib/api"
import { lerToken, limparSessao, salvarSessao } from "./lib/sessao"

const PAGINAS_PROTEGIDAS = ["conta", "historico", "vendedor", "perguntas"]
const PAGINAS = ["home", "auth", "conta", "historico", "vendedor", "perguntas", "admin"]

// A navegação usa o histórico do navegador (endereços com #), então o botão
// "voltar" do Chrome volta para a tela anterior do site e não para outra aba.
function paraHash(page, id) {
  if (page === "home") return "#/"
  if (page === "detalhe") return `#/item/${id}`
  return `#/${page}`
}

function lerHash() {
  const h = window.location.hash.replace(/^#\/?/, "")
  if (h.startsWith("item/")) {
    const id = Number(h.slice(5))
    if (Number.isInteger(id) && id > 0) return { page: "detalhe", itemId: id }
  }
  return { page: PAGINAS.includes(h) ? h : "home", itemId: null }
}

function App() {
  const [inicial] = useState(lerHash)
  const [page, setPage] = useState(inicial.page)
  const [itemId, setItemId] = useState(inicial.itemId)
  const [token, setToken] = useState(lerToken())
  const [user, setUser] = useState(null)

  // vai para uma tela, criando uma entrada no histórico (ou trocando a atual, se substituir = true)
  function ir(novaPage, id = null, substituir = false) {
    const estado = { interno: true }
    const url = paraHash(novaPage, id)
    if (substituir) window.history.replaceState(estado, "", url)
    else window.history.pushState(estado, "", url)
    setPage(novaPage)
    setItemId(id)
    window.scrollTo(0, 0)
  }

  // botão "voltar" do navegador (e avançar): mostra a tela do endereço atual
  useEffect(() => {
    window.history.replaceState({ interno: false }, "", paraHash(inicial.page, inicial.itemId))

    function aoNavegar() {
      const atual = lerHash()
      setPage(atual.page)
      setItemId(atual.itemId)
    }

    window.addEventListener("popstate", aoNavegar)
    return () => window.removeEventListener("popstate", aoNavegar)
  }, [inicial])

  function navigate(to) {
    if (PAGINAS_PROTEGIDAS.includes(to) && !token) {
      ir("auth")
      return
    }
    ir(to)
  }

  function abrirItem(id) {
    ir("detalhe", id)
  }

  // "← voltar" da tela de detalhes: volta no histórico do site; se a pessoa chegou
  // direto pelo link do item, vai para a home
  function voltar() {
    if (window.history.state?.interno) window.history.back()
    else ir("home", null, true)
  }

  function handleLogin(newToken, usuario, manter) {
    salvarSessao(newToken, usuario, manter)
    setToken(newToken)

    if (usuario?.tipo === "ADMIN") {
      // admin que entra pelo login normal vai direto para a área restrita
      ir("admin", null, true)
    } else if (window.history.state?.interno) {
      // volta para a tela de onde a pessoa veio (ex.: o item que ela estava vendo)
      window.history.back()
    } else {
      ir("home", null, true)
    }
  }

  function handleLogout() {
    limparSessao()
    setToken(null)
    setUser(null)
    ir("home", null, true)
  }

  async function carregarUsuario() {
    try {
      const res = await api.get("/auth/me")
      setUser(res.data)
    } catch {
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

  // páginas protegidas sem login (por exemplo, voltando no histórico depois de sair) caem no login
  const paginaAtual = PAGINAS_PROTEGIDAS.includes(page) && !token ? "auth" : page

  // a área restrita tem layout próprio (sem a barra da loja)
  if (paginaAtual === "admin") {
    return <Admin user={user} token={token} onLogin={handleLogin} onLogout={handleLogout} onSair={() => ir("home")} />
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-bg-from to-bg-to text-text">
      <Navbar onNavigate={navigate} onLogout={handleLogout} token={token} user={user} />
      {paginaAtual === "home" && <Home onAbrirItem={abrirItem} onNavigate={navigate} />}
      {paginaAtual === "detalhe" && (
        <Detalhe
          key={itemId}
          itemId={itemId}
          token={token}
          user={user}
          onVoltar={voltar}
          onNavigate={navigate}
          onAtualizar={carregarUsuario}
        />
      )}
      {paginaAtual === "perguntas" && <Perguntas onAbrirItem={abrirItem} />}
      {paginaAtual === "auth" && <Auth onLogin={handleLogin} />}
      {paginaAtual === "conta" && <Conta user={user} />}
      {paginaAtual === "historico" && <Historico />}
      {paginaAtual === "vendedor" && <Vendedor user={user} />}
    </div>
  )
}

export default App