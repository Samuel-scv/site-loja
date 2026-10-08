import { useEffect, useState } from "react"
import { api, mensagemErro } from "../lib/api"
import { FotoItem } from "../components/ItemCard"

function Lista({ titulo, itens }) {
    if (!itens?.length) return null
    return (
        <div className="mb-4">
            <h3 className="font-semibold text-text mb-1">{titulo}: *</h3>
            <ul className="list-disc pl-6 text-sm text-text space-y-1">
                {itens.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
        </div>
    )
}

function Detalhe({ itemId, token, user, onVoltar, onNavigate, onAtualizar }) {
    const [item, setItem] = useState(null)
    const [ia, setIa] = useState(null)
    const [iaCarregando, setIaCarregando] = useState(false)
    const [iaErro, setIaErro] = useState(null)
    const [erro, setErro] = useState(null)
    const [aviso, setAviso] = useState(null)
    const [pergunta, setPergunta] = useState("")
    const [enviando, setEnviando] = useState(false)

    useEffect(() => {
        api.get(`/itens/${itemId}`)
            .then((res) => setItem(res.data))
            .catch((err) => setErro(mensagemErro(err)))
    }, [itemId])

    // só consulta a IA quando o usuário clica em "Sugestão de build"
    async function sugerirBuild() {
        setIaCarregando(true)
        setIaErro(null)
        try {
            const res = await api.get(`/itens/${itemId}/ia`)
            if (res.data.dadosIA) setIa(res.data.dadosIA)
            else setIaErro(res.data.motivo === "cota"
                ? "O limite diário da IA foi atingido. Tente novamente mais tarde."
                : "A IA não respondeu agora. Tente de novo em instantes.")
        } catch {
            setIaErro("A IA não respondeu agora. Tente de novo em instantes.")
        } finally {
            setIaCarregando(false)
        }
    }

    async function enviarPergunta(e) {
        e.preventDefault()
        setAviso(null)
        setEnviando(true)
        try {
            await api.post("/interacoes/criar", { id_item: itemId, pergunta })
            setPergunta("")
            setAviso({ erro: false, texto: "Pergunta enviada! Acompanhe a resposta em \"minhas perguntas\"." })
        } catch (err) {
            setAviso({ erro: true, texto: mensagemErro(err) })
        } finally {
            setEnviando(false)
        }
    }

    async function comprar(id_loja) {
        setAviso(null)
        try {
            await api.post("/compras/criar", { id_loja, quantidade: 1 })
            setAviso({ erro: false, texto: "Compra realizada!" })
            const res = await api.get(`/itens/${itemId}`)
            setItem(res.data)
            onAtualizar?.()
        } catch (err) {
            setAviso({ erro: true, texto: mensagemErro(err) })
        }
    }

    if (erro) return <p className="max-w-3xl mx-auto mt-12 px-4 text-danger">{erro}</p>
    if (!item) return <p className="max-w-3xl mx-auto mt-12 px-4 text-muted">carregando...</p>

    return (
        <div className="max-w-3xl mx-auto mt-8 px-4 pb-16">
            <button onClick={onVoltar} className="mb-4 text-sm text-primary hover:underline">← voltar</button>

            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <FotoItem item={item} className="w-full h-64" texto="text-7xl" />

                <div className="p-6">
                    <h1 className="text-2xl font-bold text-text">{item.nome}</h1>
                    <p className="mb-3">
                        <span className="inline-block border rounded px-2 py-0.5 text-xs bg-[#12323a] text-[#5fd0e6] border-[#1f6678]">{item.categoria?.nome}</span>
                    </p>
                    {item.descricao && <p className="text-sm text-text italic mb-4">{item.descricao}</p>}

                    {!ia && (
                        <div className="mt-4">
                            <button
                                onClick={sugerirBuild}
                                disabled={iaCarregando}
                                className="bg-accent hover:bg-accent-hover disabled:opacity-60 text-white rounded-lg px-4 py-2 transition-colors"
                            >
                                {iaCarregando ? "Consultando a IA..." : "Sugestão de build"}
                            </button>
                            {iaCarregando && (
                                <p className="mt-2 text-sm text-muted italic">A primeira consulta pode levar alguns segundos.</p>
                            )}
                            {iaErro && (
                                <p className="mt-2 text-sm text-danger">{iaErro}</p>
                            )}
                        </div>
                    )}

                    {ia && (
                        <div className="mt-4">
                            {ia.resumo && <p className="text-sm text-text mb-4">{ia.resumo} *</p>}
                            <Lista titulo="Pontos Fortes" itens={ia.pontosFortes} />
                            <Lista titulo="Pontos Fracos" itens={ia.pontosFracos} />
                            <Lista titulo="Build recomendada" itens={ia.build} />
                            {ia.comoObter && (
                                <p className="text-sm text-text mb-2"><span className="font-semibold">Como obter / usar: *</span> {ia.comoObter}</p>
                            )}
                            <p className="text-xs text-muted italic mt-3">* Informações geradas por IA. Sujeito a erros.</p>
                        </div>
                    )}

                    {item.loja?.length > 0 && (
                        <div className="mt-6 border-t border-border pt-4">
                            <h2 className="font-semibold text-text mb-2">À venda</h2>
                            <ul className="divide-y divide-border">
                                {item.loja.map((l) => (
                                    <li key={l.id} className="py-2 flex flex-wrap justify-between items-center gap-2 text-sm">
                                        <span className="text-muted">{l.vendedor?.nome} · estoque {l.estoque}</span>
                                        <span className="flex items-center gap-3">
                                            <span className="text-price font-semibold">{l.preco_platina} platinas</span>
                                            <span className="text-muted">{l.preco_credito} créditos</span>
                                            {user?.tipo === "CLIENTE" && (
                                                <button onClick={() => comprar(l.id)} className="bg-accent hover:bg-accent-hover text-white rounded-lg px-3 py-1 transition-colors">
                                                    comprar
                                                </button>
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="mt-6 border-t border-border pt-4">
                        {!token && (
                            <p className="font-semibold text-text">
                                😎 Gostou?{" "}
                                <button onClick={() => onNavigate("auth")} className="text-primary underline">Identifique-se</button>{" "}
                                e faça uma pergunta!
                            </p>
                        )}

                        {token && user?.tipo === "CLIENTE" && (
                            <form onSubmit={enviarPergunta} className="space-y-3">
                                <h2 className="font-bold text-text">😀 Você pode fazer uma pergunta sobre este item!</h2>
                                <p className="bg-bg border border-border rounded-lg p-2 text-sm text-muted">{user.nome} ({user.email})</p>
                                <textarea
                                    required
                                    rows={3}
                                    value={pergunta}
                                    onChange={(e) => setPergunta(e.target.value)}
                                    placeholder="Escreva sua pergunta ou proposta"
                                    className="w-full border border-border rounded-lg p-2 text-text focus:outline-none focus:border-primary"
                                />
                                <button disabled={enviando} className="bg-primary hover:bg-primary-hover disabled:opacity-60 text-white rounded-lg px-4 py-2 transition-colors">
                                    {enviando ? "Enviando..." : "Enviar Pergunta"}
                                </button>
                            </form>
                        )}

                        {token && user && user.tipo !== "CLIENTE" && (
                            <p className="text-sm text-muted">Somente clientes podem enviar perguntas.</p>
                        )}

                        {aviso && <p className={`mt-3 text-sm ${aviso.erro ? "text-danger" : "text-success"}`}>{aviso.texto}</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Detalhe
