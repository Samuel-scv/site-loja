import { useEffect, useState } from "react"
import { api, formatarData, mensagemErro } from "../lib/api"
import { FotoItem } from "../components/ItemCard"

function Perguntas({ onAbrirItem }) {
    const [lista, setLista] = useState([])
    const [erro, setErro] = useState(null)
    const [carregando, setCarregando] = useState(true)

    useEffect(() => {
        api.get("/interacoes/minhas")
            .then((res) => setLista(res.data))
            .catch((err) => setErro(mensagemErro(err)))
            .finally(() => setCarregando(false))
    }, [])

    return (
        <div className="max-w-4xl mx-auto mt-10 px-4 pb-16">
            <h1 className="text-3xl font-bold text-text mb-6">Minhas Perguntas</h1>

            {erro && <p className="mb-4 text-sm text-danger">{erro}</p>}
            {carregando && <p className="text-muted">carregando...</p>}
            {!carregando && !erro && lista.length === 0 && <p className="text-muted">Você ainda não fez nenhuma pergunta.</p>}

            {lista.length > 0 && (
                <div className="bg-surface border border-border rounded-xl overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-left text-muted">
                            <tr>
                                <th className="p-3">ITEM</th>
                                <th className="p-3">FOTO</th>
                                <th className="p-3">PERGUNTA</th>
                                <th className="p-3">RESPOSTA</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {lista.map((p) => (
                                <tr key={p.id}>
                                    <td className="p-3 font-semibold text-text">
                                        <button onClick={() => onAbrirItem(p.id_item)} className="hover:text-primary hover:underline text-left">{p.item.nome}</button>
                                    </td>
                                    <td className="p-3"><FotoItem item={p.item} className="w-20 h-12 rounded" texto="text-lg" /></td>
                                    <td className="p-3 text-text">
                                        {p.pergunta}
                                        <p className="text-xs text-muted italic">Enviado em: {formatarData(p.createdAt)}</p>
                                    </td>
                                    <td className="p-3 text-text">
                                        {p.resposta ?? <span className="text-muted italic">Aguardando...</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default Perguntas
