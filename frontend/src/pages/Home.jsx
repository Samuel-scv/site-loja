import { useEffect, useState } from "react"
import { api, mensagemErro } from "../lib/api"

function Home({ token, user, onAtualizar }) {
    const [listagens, setListagens] = useState([])
    const [busca, setBusca] = useState("")
    const [aviso, setAviso] = useState(null)
    const [carregando, setCarregando] = useState(false)

    async function carregar(nome = "") {
        setCarregando(true)
        try {
            const res = nome
                ? await api.get("/loja/pesquisa", { params: { nome } })
                : await api.get("/loja/listar")
            setListagens(res.data)
        } catch (err) {
            setAviso({ erro: true, texto: mensagemErro(err) })
        } finally {
            setCarregando(false)
        }
    }

    useEffect(() => { carregar() }, [])

    async function comprar(id_loja) {
        setAviso(null)
        try {
            await api.post("/compras/criar", { id_loja, quantidade: 1 })
            setAviso({ erro: false, texto: "compra realizada" })
            carregar(busca)
            onAtualizar?.()
        } catch (err) {
            setAviso({ erro: true, texto: mensagemErro(err) })
        }
    }

    return (
        <div className="max-w-2xl mx-auto mt-12 px-4">
            <h1 className="text-4xl font-bold text-text mb-2">Loja</h1>
            <p className="text-muted mb-6">Itens à venda por platinas e créditos.</p>

            <form onSubmit={(e) => { e.preventDefault(); carregar(busca) }} className="mb-4 flex gap-2">
                <input
                    className="w-full border border-border rounded-lg p-2 text-text focus:outline-none focus:border-primary"
                    placeholder="Buscar item"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />
                <button className="bg-primary hover:bg-primary-hover text-white rounded-lg px-4 transition-colors">buscar</button>
            </form>

            {aviso && <p className={`mb-4 text-sm ${aviso.erro ? "text-danger" : "text-success"}`}>{aviso.texto}</p>}
            {carregando && <p className="text-muted">carregando...</p>}
            {!carregando && listagens.length === 0 && <p className="text-muted">nenhum item à venda no momento.</p>}

            <ul className="bg-surface border border-border rounded-xl divide-y divide-border">
                {listagens.map((l) => (
                    <li key={l.id} className="p-4 flex flex-wrap justify-between items-center gap-3">
                        <div>
                            <p className="text-text font-semibold">{l.item.nome}</p>
                            <p className="text-sm text-muted">
                                {l.item.categoria?.nome} · vendido por {l.vendedor.nome} · estoque {l.estoque}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right text-sm">
                                <p className="text-primary font-semibold">{l.preco_platina} platinas</p>
                                <p className="text-muted">{l.preco_credito} créditos</p>
                            </div>
                            {user?.tipo === "CLIENTE" && (
                                <button
                                    onClick={() => comprar(l.id)}
                                    className="bg-accent hover:bg-accent-hover text-white rounded-lg px-4 py-2 transition-colors"
                                >
                                    comprar
                                </button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>

            {!token && <p className="mt-4 text-sm text-muted">Faça login como cliente para comprar.</p>}
        </div>
    )
}

export default Home
