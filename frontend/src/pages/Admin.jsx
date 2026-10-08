import { useState } from "react"
import { api, mensagemErro } from "../lib/api"
import Dashboard from "./admin/Dashboard"
import Itens from "./admin/Itens"
import Clientes from "./admin/Clientes"
import PerguntasAdmin from "./admin/PerguntasAdmin"

const campo = "w-full border border-border rounded-lg p-2 text-text focus:outline-none focus:border-primary"

function LoginAdmin({ onLogin, onSair }) {
    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")
    const [erro, setErro] = useState(null)

    async function entrar(e) {
        e.preventDefault()
        setErro(null)
        try {
            const res = await api.post("/auth/login", { email, senha })
            if (res.data.usuario.tipo !== "ADMIN") {
                setErro("Esta área é restrita aos administradores.")
                return
            }
            onLogin(res.data.token, res.data.usuario, false)
        } catch (err) {
            setErro(mensagemErro(err))
        }
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-bg-from to-bg-to flex items-center justify-center px-4">
            <form onSubmit={entrar} className="w-full max-w-sm bg-surface border border-border rounded-xl p-8 space-y-4">
                <h1 className="text-2xl font-bold text-text text-center">Admin: Loja</h1>
                {erro && <p className="text-sm text-danger">{erro}</p>}
                <div>
                    <label className="text-sm text-text">E-mail:</label>
                    <input type="email" required className={campo} value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                    <label className="text-sm text-text">Senha:</label>
                    <input type="password" required className={campo} value={senha} onChange={(e) => setSenha(e.target.value)} />
                </div>
                <button className="bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 transition-colors">Entrar</button>
                <button type="button" onClick={onSair} className="block text-sm text-muted underline">← voltar à loja</button>
            </form>
        </div>
    )
}

const MENU = [
    ["geral", "Visão Geral"],
    ["itens", "Cadastro de Itens"],
    ["clientes", "Controle de Clientes"],
    ["perguntas", "Controle de Perguntas"],
]

function Admin({ user, token, onLogin, onLogout, onSair }) {
    const [secao, setSecao] = useState("geral")

    if (!token) return <LoginAdmin onLogin={onLogin} onSair={onSair} />
    if (!user) return <p className="p-8 text-muted">carregando...</p>
    if (user.tipo !== "ADMIN") {
        return (
            <div className="p-8">
                <p className="text-danger mb-4">Esta área é restrita aos administradores.</p>
                <button onClick={onSair} className="text-primary underline">← voltar à loja</button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-bg text-text">
            <header className="bg-nav text-nav-text px-6 py-3 flex items-center justify-between">
                <h1 className="text-xl font-bold">Loja: Admin</h1>
                <span className="text-sm">{user.nome}</span>
            </header>
            <div className="flex flex-col md:flex-row">
                <nav className="md:w-56 md:min-h-[calc(100vh-52px)] bg-border p-3 flex md:flex-col gap-1 overflow-x-auto">
                    {MENU.map(([id, nome]) => (
                        <button
                            key={id}
                            onClick={() => setSecao(id)}
                            className={`text-left px-3 py-2 rounded-lg text-sm whitespace-nowrap ${secao === id ? "bg-primary text-white" : "text-text hover:bg-surface"}`}
                        >
                            {nome}
                        </button>
                    ))}
                    <button onClick={onSair} className="text-left px-3 py-2 rounded-lg text-sm text-text hover:bg-surface whitespace-nowrap">Ver loja</button>
                    <button onClick={onLogout} className="text-left px-3 py-2 rounded-lg text-sm text-danger hover:bg-surface whitespace-nowrap">Sair do Sistema</button>
                </nav>
                <main className="flex-1 p-6 min-w-0">
                    {secao === "geral" && <Dashboard />}
                    {secao === "itens" && <Itens />}
                    {secao === "clientes" && <Clientes />}
                    {secao === "perguntas" && <PerguntasAdmin />}
                </main>
            </div>
        </div>
    )
}

export default Admin
