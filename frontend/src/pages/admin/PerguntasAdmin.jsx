import { useEffect, useState } from "react"
import { api, formatarData, mensagemErro } from "../../lib/api"

function PerguntasAdmin() {
    const [lista, setLista] = useState([])
    const [erro, setErro] = useState(null)
    const [respondendo, setRespondendo] = useState(null) // id da pergunta em edição
    const [texto, setTexto] = useState("")

    function carregar() {
        api.get("/interacoes/listar")
            .then((res) => setLista(res.data))
            .catch((err) => setErro(mensagemErro(err)))
    }

    useEffect(() => { carregar() }, [])

    async function responder(id) {
        setErro(null)
        try {
            await api.put(`/interacoes/responder/${id}`, { resposta: texto })
            setRespondendo(null)
            setTexto("")
            carregar()
        } catch (err) {
            setErro(mensagemErro(err))
        }
    }

    async function excluir(id) {
        if (!confirm("Excluir esta pergunta?")) return
        try {
            await api.delete(`/interacoes/deletar/${id}`)
            carregar()
        } catch (err) {
            setErro(mensagemErro(err))
        }
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-text mb-4">Controle de Perguntas</h1>
            {erro && <p className="mb-4 text-sm text-danger">{erro}</p>}
            {lista.length === 0 && !erro && <p className="text-muted">Nenhuma pergunta recebida.</p>}

            <div className="space-y-3">
                {lista.map((p) => (
                    <div key={p.id} className="bg-surface border border-border rounded-xl p-4">
                        <div className="flex flex-wrap justify-between gap-2 text-sm">
                            <p className="font-semibold text-text">{p.item.nome}</p>
                            <p className="text-muted">{p.cliente.nome} ({p.cliente.email}) · {formatarData(p.createdAt)}</p>
                        </div>
                        <p className="mt-2 text-text">{p.pergunta}</p>

                        {p.resposta && (
                            <p className="mt-2 text-sm bg-bg border border-border rounded-lg p-2 text-text">
                                <span className="font-semibold">Resposta:</span> {p.resposta}
                            </p>
                        )}

                        {respondendo === p.id ? (
                            <div className="mt-3 space-y-2">
                                <textarea
                                    rows={3}
                                    value={texto}
                                    onChange={(e) => setTexto(e.target.value)}
                                    placeholder="Escreva a resposta"
                                    className="w-full border border-border rounded-lg p-2 text-text focus:outline-none focus:border-primary"
                                />
                                <div className="flex gap-2">
                                    <button onClick={() => responder(p.id)} className="bg-accent hover:bg-accent-hover text-white rounded-lg px-4 py-1 transition-colors">Enviar resposta</button>
                                    <button onClick={() => setRespondendo(null)} className="border border-border rounded-lg px-4 py-1 text-text">Cancelar</button>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-3 flex flex-wrap gap-4 text-sm">
                                <button onClick={() => { setRespondendo(p.id); setTexto(p.resposta ?? "") }} className="text-primary underline">
                                    {p.resposta ? "editar resposta" : "responder"}
                                </button>
                                <a
                                    className="text-primary underline"
                                    href={`mailto:${p.cliente.email}?subject=${encodeURIComponent(`Sobre: ${p.item.nome}`)}&body=${encodeURIComponent(p.resposta ?? "")}`}
                                >
                                    enviar e-mail
                                </a>
                                <button onClick={() => excluir(p.id)} className="text-danger underline">excluir</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PerguntasAdmin
