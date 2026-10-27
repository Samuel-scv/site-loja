import { useEffect, useState } from "react"
import { api, formatarData, mensagemErro } from "../lib/api"

const campo = "w-full border border-border rounded-lg p-2 text-text focus:outline-none focus:border-primary"

function PerguntasVendedor({ user }) {
    const [perguntas, setPerguntas] = useState([])
    const [respondendo, setRespondendo] = useState(null) // id da pergunta em edição
    const [texto, setTexto] = useState("")
    const [erro, setErro] = useState(null)
    const [carregando, setCarregando] = useState(true)

    function carregar() {
        api.get("/interacoes/do-vendedor")
            .then((res) => setPerguntas(res.data))
            .catch((err) => setErro(mensagemErro(err)))
            .finally(() => setCarregando(false))
    }

    useEffect(() => { carregar() }, [])

    async function responder(id) {
        setErro(null)
        try {
            await api.put(`/interacoes/responder-vendedor/${id}`, { resposta: texto })
            setRespondendo(null)
            setTexto("")
            carregar()
        } catch (err) {
            setErro(mensagemErro(err))
        }
    }
    
    if (user && user.tipo !== "VENDEDOR") {
        return <div className="max-w-sm mx-auto mt-16 text-center text-muted">esta área é só para vendedores.</div>
    }

    return (
        <div className="max-w-2xl mx-auto mt-12 px-4 pb-16">
            <h1 className="text-2xl font-bold text-text mb-6">Perguntas dos clientes</h1>
            {erro && <p className="mb-4 text-sm text-danger">{erro}</p>}
            {carregando && <p className="text-muted">carregando...</p>}
            {!carregando && perguntas.length === 0 && !erro && <p className="text-muted">Não possui perguntas.</p>}

            <div className="space-y-3">
                {perguntas.map((p) => (
                    <div key={p.id} className="bg-surface border border-border rounded-xl p-4">
                        <div className="flex flex-wrap justify-between gap-2 text-sm">
                            <p className="font-semibold text-text">{p.item.nome}</p>
                            <p className="text-muted">{p.cliente.nome} · {formatarData(p.createdAt)}</p>
                        </div>
                        <p className="mt-2 text-text">{p.pergunta}</p>
                        {p.resposta ? (
                            <p className="mt-2 text-sm bg-bg border border-border rounded-lg p-2 text-text">
                                <span className="font-semibold">Resposta:</span> {p.resposta}
                            </p>
                        ) : (
                            <p className="mt-2 text-sm text-muted">ainda sem resposta</p>
                        )}

                        {respondendo === p.id ? (
                            <div className="mt-3 space-y-2">
                                <textarea
                                    rows={3}
                                    value={texto}
                                    onChange={(e) => setTexto(e.target.value)}
                                    placeholder="Escreva a resposta"
                                    className={campo}
                                />
                                <div className="flex gap-2">
                                    <button onClick={() => responder(p.id)} className="bg-accent hover:bg-accent-hover text-white rounded-lg px-4 py-1 transition-colors">Enviar resposta</button>
                                    <button onClick={() => setRespondendo(null)} className="border border-border rounded-lg px-4 py-1 text-text">Cancelar</button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => { setRespondendo(p.id); setTexto(p.resposta ?? "") }}
                                className="mt-3 text-sm text-primary underline"
                            >
                                {p.resposta ? "editar resposta" : "responder"}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PerguntasVendedor