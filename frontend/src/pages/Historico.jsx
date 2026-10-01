import { useEffect, useState } from "react"
import { api, mensagemErro } from "../lib/api"

function Historico() {
    const [vendas, setVendas] = useState([])
    const [erro, setErro] = useState(null)
    const [carregando, setCarregando] = useState(true)

    useEffect(() => {
        api.get("/compras/historico")
            .then((res) => setVendas(res.data))
            .catch((err) => setErro(mensagemErro(err)))
            .finally(() => setCarregando(false))
    }, [])

    return (
        <div className="max-w-2xl mx-auto mt-12 px-4">
            <h1 className="text-2xl font-bold text-text mb-6">Histórico</h1>

            {carregando && <p className="text-muted">carregando...</p>}
            {erro && <p className="text-danger">{erro}</p>}
            {!carregando && !erro && vendas.length === 0 && <p className="text-muted">nenhuma compra registrada ainda.</p>}

            <ul className="bg-surface border border-border rounded-xl divide-y divide-border">
                {vendas.map((v) => (
                    <li key={v.id} className="p-4">
                        <p className="text-text font-semibold">{v.item.nome}</p>
                        <p className="text-sm text-muted">
                            {new Date(v.data_compra).toLocaleString("pt-BR")} · {v.comprador.nome} comprou de {v.vendedor.nome} · {v.valor_pago_platina} platinas, {v.valor_pago_credito} créditos
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Historico
