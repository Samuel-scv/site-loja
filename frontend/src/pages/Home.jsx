import { useEffect, useState } from "react"
import { api, mensagemErro } from "../lib/api"
import ItemCard from "../components/ItemCard"

function Lista({ itens, onAbrir }) {
    return (
        <ul className="space-y-2">
            {itens.map((i) => <ItemCard key={i.id} item={i} onAbrir={onAbrir} />)}
        </ul>
    )
}

function Etiqueta({ cor, children }) {
    const estilos = {
        rosa: "bg-[#3d1830] text-[#ff7ac0] border-[#7a2a5c]",
        verde: "bg-[#0f3b2c] text-[#4ade9d] border-[#1b6b4f]",
        azul: "bg-[#12323a] text-[#5fd0e6] border-[#1f6678]",
    }
    return <span className={`inline-block border rounded px-2 py-0.5 text-sm ${estilos[cor]}`}>{children}</span>
}

function Home({ onAbrirItem, onNavigate }) {
    const [destaques, setDestaques] = useState([])
    const [recentes, setRecentes] = useState([])
    const [resultados, setResultados] = useState(null) // null = não está pesquisando
    const [busca, setBusca] = useState("")
    const [erro, setErro] = useState(null)
    const [carregando, setCarregando] = useState(true)

    async function carregarVitrine() {
        setCarregando(true)
        setErro(null)
        try {
            const [d, r] = await Promise.all([api.get("/itens/destaques"), api.get("/itens/recentes")])
            setDestaques(d.data)
            setRecentes(r.data)
            setResultados(null)
        } catch (err) {
            setErro(mensagemErro(err))
        } finally {
            setCarregando(false)
        }
    }

    useEffect(() => { carregarVitrine() }, [])

    async function pesquisar(e) {
        e.preventDefault()
        if (!busca.trim()) {
            setBusca("")
            carregarVitrine()
            return
        }
        setErro(null)
        try {
            const res = await api.get("/itens/pesquisa", { params: { nome: busca.trim() } })
            setResultados(res.data)
        } catch (err) {
            setErro(mensagemErro(err))
        }
    }

    function exibirDestaques() {
        setBusca("")
        carregarVitrine()
    }

    return (
        <div className="max-w-6xl mx-auto mt-8 px-4 pb-16">
            <form onSubmit={pesquisar} className="mb-8 flex flex-wrap gap-2 bg-surface border border-border rounded-lg p-3">
                <input
                    className="flex-1 min-w-48 border border-border rounded p-2 focus:outline-none focus:border-primary"
                    placeholder="Filtrar por item (nome, categoria ou descrição)"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />
                <button className="bg-primary hover:bg-primary-hover text-white rounded px-4 transition-colors">Pesquisar</button>
                <button type="button" onClick={exibirDestaques} className="bg-[#9d2a6e] hover:bg-[#b83284] text-white rounded px-4 transition-colors">
                    Exibir Destaques
                </button>
            </form>

            {erro && <p className="mb-4 text-sm text-danger">{erro}</p>}
            {carregando && <p className="text-muted">carregando...</p>}

            {resultados ? (
                <>
                    <div className="mb-3"><Etiqueta cor="azul">Resultados da pesquisa</Etiqueta></div>
                    {resultados.length === 0
                        ? <p className="text-muted">Nenhum item encontrado.</p>
                        : <Lista itens={resultados} onAbrir={onAbrirItem} />}
                </>
            ) : (
                !carregando && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <section>
                            <div className="mb-3"><Etiqueta cor="rosa">Itens em destaque</Etiqueta></div>
                            {destaques.length === 0
                                ? <p className="text-muted">Nenhum item em destaque no momento.</p>
                                : <Lista itens={destaques} onAbrir={onAbrirItem} />}
                        </section>
                        <section>
                            <div className="mb-3"><Etiqueta cor="verde">Últimos cadastrados</Etiqueta></div>
                            {recentes.length === 0
                                ? <p className="text-muted">Nenhum item cadastrado.</p>
                                : <Lista itens={recentes} onAbrir={onAbrirItem} />}
                        </section>
                    </div>
                )
            )}

            <p className="mt-12 text-center text-sm text-muted">
                <button onClick={() => onNavigate("admin")} className="underline hover:text-primary">Área restrita (administradores)</button>
            </p>
        </div>
    )
}

export default Home
