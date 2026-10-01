import { useEffect, useState } from "react"
import { api, mensagemErro } from "../lib/api"

const campo = "w-full border border-border rounded-lg p-2 text-text focus:outline-none focus:border-primary"
const vazio = { id_item: "", preco_platina: "", preco_credito: "", estoque: "" }

function Vendedor({ user }) {
    const [itens, setItens] = useState([])
    const [minhas, setMinhas] = useState([])
    const [form, setForm] = useState(vazio)
    const [erro, setErro] = useState(null)

    function carregarMinhas() {
        api.get("/loja/minhas")
            .then((res) => setMinhas(res.data))
            .catch((err) => setErro(mensagemErro(err)))
    }

    useEffect(() => {
        api.get("/itens/listar").then((res) => setItens(res.data)).catch(() => {})
        carregarMinhas()
    }, [])

    function mudar(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    async function criar(e) {
        e.preventDefault()
        setErro(null)
        try {
            await api.post("/loja/criar", {
                id_item: Number(form.id_item),
                preco_platina: Number(form.preco_platina) || 0,
                preco_credito: Number(form.preco_credito) || 0,
                estoque: Number(form.estoque)
            })
            setForm(vazio)
            carregarMinhas()
        } catch (err) {
            setErro(mensagemErro(err))
        }
    }

    async function alternar(id) {
        try {
            await api.patch(`/loja/status/${id}`)
            carregarMinhas()
        } catch (err) {
            setErro(mensagemErro(err))
        }
    }

    if (user && user.tipo !== "VENDEDOR") {
        return <div className="max-w-sm mx-auto mt-16 text-center text-muted">esta área é só para vendedores.</div>
    }

    return (
        <div className="max-w-2xl mx-auto mt-12 px-4">
            <h1 className="text-2xl font-bold text-text mb-6">Minhas listagens</h1>

            <form onSubmit={criar} className="bg-surface border border-border rounded-xl p-6 mb-6 space-y-3">
                <h2 className="text-text font-semibold">Nova listagem</h2>
                {erro && <p className="text-danger text-sm">{erro}</p>}
                <select name="id_item" value={form.id_item} onChange={mudar} className={campo} required>
                    <option value="">Escolha um item</option>
                    {itens.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}
                </select>
                <div className="grid grid-cols-3 gap-3">
                    <input name="preco_platina" type="number" min="0" step="0.01" placeholder="Platinas" value={form.preco_platina} onChange={mudar} className={campo} />
                    <input name="preco_credito" type="number" min="0" step="0.01" placeholder="Créditos" value={form.preco_credito} onChange={mudar} className={campo} />
                    <input name="estoque" type="number" min="0" step="1" placeholder="Estoque" value={form.estoque} onChange={mudar} className={campo} required />
                </div>
                <button className="bg-accent hover:bg-accent-hover text-white rounded-lg px-4 py-2 transition-colors">publicar</button>
            </form>

            {minhas.length === 0 && <p className="text-muted">você ainda não tem listagens.</p>}

            <ul className="bg-surface border border-border rounded-xl divide-y divide-border">
                {minhas.map((l) => (
                    <li key={l.id} className="p-4 flex justify-between items-center gap-3">
                        <div>
                            <p className="text-text font-semibold">{l.item.nome}</p>
                            <p className="text-sm text-muted">{l.preco_platina} platinas · {l.preco_credito} créditos · estoque {l.estoque}</p>
                        </div>
                        <button
                            onClick={() => alternar(l.id)}
                            className={`text-sm font-semibold underline ${l.ativo ? "text-accent" : "text-muted"}`}
                        >
                            {l.ativo ? "ativa" : "pausada"}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Vendedor
