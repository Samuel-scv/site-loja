import { useState, useEffect } from "react"
import { api, decodeToken, mensagemErro } from "./lib/api"

const campo = "w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#3d6f9e] focus:ring-2 focus:ring-[#3d6f9e]/30"
const botao = "rounded-md bg-[#16212e] px-4 py-2 font-semibold text-white hover:bg-[#25364a] focus-visible:ring-2 focus-visible:ring-[#3d6f9e] disabled:opacity-50"

function Login({ aoEntrar }) {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")

  async function entrar(e) {
    e.preventDefault()
    setErro("")
    try {
      const { data } = await api.post("/auth/login", { email, senha })
      localStorage.setItem("token", data.token)
      localStorage.setItem("usuario", JSON.stringify(data.usuario))
      aoEntrar(data.usuario)
    } catch (err) {
      setErro(mensagemErro(err))
    }
  }

  return (
    <main className="mx-auto mt-24 w-full max-w-sm px-4">
      <h1 className="mb-1 text-3xl font-bold">Mercado</h1>
      <p className="mb-6 text-slate-600">Entre para ver e comprar itens.</p>
      <form onSubmit={entrar} className="space-y-3">
        <input className={campo} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={campo} type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        {erro && <p role="alert" className="text-sm text-[#b3392f]">{erro}</p>}
        <button className={`${botao} w-full`}>Entrar</button>
      </form>
    </main>
  )
}

function Loja({ usuario }) {
  const [listagens, setListagens] = useState([])
  const [busca, setBusca] = useState("")
  const [aviso, setAviso] = useState(null)

  async function carregar(nome = "") {
    try {
      const { data } = nome
        ? await api.get("/loja/pesquisa", { params: { nome } })
        : await api.get("/loja/listar")
      setListagens(data)
    } catch (err) {
      setAviso({ erro: true, texto: mensagemErro(err) })
    }
  }

  useEffect(() => { carregar() }, [])

  async function comprar(id_loja) {
    setAviso(null)
    try {
      await api.post("/compras/criar", { id_loja, quantidade: 1 })
      setAviso({ erro: false, texto: "Compra realizada." })
      carregar(busca)
    } catch (err) {
      setAviso({ erro: true, texto: mensagemErro(err) })
    }
  }

  return (
    <section>
      <form onSubmit={(e) => { e.preventDefault(); carregar(busca) }} className="mb-4 flex gap-2">
        <input className={campo} placeholder="Buscar item" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <button className={botao}>Buscar</button>
      </form>

      {aviso && (
        <p role="alert" className={`mb-4 text-sm ${aviso.erro ? "text-[#b3392f]" : "text-[#2f7a4d]"}`}>{aviso.texto}</p>
      )}

      {listagens.length === 0 && <p className="text-slate-600">Nenhum item à venda no momento.</p>}

      <ul className="divide-y divide-slate-300 rounded-md bg-white shadow-sm">
        {listagens.map((l) => (
          <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold">{l.item.nome}</p>
              <p className="text-sm text-slate-600">{l.item.categoria?.nome} · vendido por {l.vendedor.nome} · estoque {l.estoque}</p>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-right text-sm">
                <span className="block font-semibold text-[#3d6f9e]">{l.preco_platina} platinas</span>
                <span className="block font-semibold text-[#9a7420]">{l.preco_credito} créditos</span>
              </p>
              {usuario.tipo === "CLIENTE" && (
                <button className={botao} onClick={() => comprar(l.id)}>Comprar</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Historico() {
  const [vendas, setVendas] = useState([])
  const [erro, setErro] = useState("")

  useEffect(() => {
    api.get("/compras/historico")
      .then(({ data }) => setVendas(data))
      .catch((err) => setErro(mensagemErro(err)))
  }, [])

  if (erro) return <p role="alert" className="text-[#b3392f]">{erro}</p>
  if (vendas.length === 0) return <p className="text-slate-600">Nenhuma compra registrada ainda.</p>

  return (
    <ul className="divide-y divide-slate-300 rounded-md bg-white shadow-sm">
      {vendas.map((v) => (
        <li key={v.id} className="p-4">
          <p className="font-semibold">{v.item.nome}</p>
          <p className="text-sm text-slate-600">
            {new Date(v.data_compra).toLocaleString("pt-BR")} · {v.comprador.nome} comprou de {v.vendedor.nome} · {v.valor_pago_platina} platinas, {v.valor_pago_credito} créditos
          </p>
        </li>
      ))}
    </ul>
  )
}

function App() {
  const [usuario, setUsuario] = useState(() => {
    const token = localStorage.getItem("token")
    const salvo = localStorage.getItem("usuario")
    // descarta a sessão se o token estiver vencido
    const dados = token ? decodeToken(token) : null
    if (!dados || !salvo || dados.exp * 1000 < Date.now()) return null
    return JSON.parse(salvo)
  })
  const [aba, setAba] = useState("loja")

  function sair() {
    localStorage.removeItem("token")
    localStorage.removeItem("usuario")
    setUsuario(null)
  }

  if (!usuario) return <Login aoEntrar={setUsuario} />

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mercado</h1>
          <p className="text-sm text-slate-600">{usuario.nome} · {usuario.tipo.toLowerCase()}</p>
        </div>
        <button onClick={sair} className="text-sm font-semibold underline">Sair</button>
      </header>

      <nav className="mb-4 flex gap-4 border-b border-slate-300">
        {[["loja", "Loja"], ["historico", "Histórico"]].map(([id, nome]) => (
          <button
            key={id}
            onClick={() => setAba(id)}
            className={`-mb-px border-b-2 pb-2 font-semibold ${aba === id ? "border-[#3d6f9e] text-[#16212e]" : "border-transparent text-slate-500"}`}
          >
            {nome}
          </button>
        ))}
      </nav>

      {aba === "loja" ? <Loja usuario={usuario} /> : <Historico />}
    </div>
  )
}

export default App