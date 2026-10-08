import { useEffect, useState } from "react"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { api, formatarData, mensagemErro } from "../../lib/api"

const CORES = ["#7c3aed", "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6", "#8b5cf6"]

function Cartao({ titulo, valor }) {
    return (
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-primary">{valor}</p>
            <p className="text-sm font-semibold text-text">{titulo}</p>
        </div>
    )
}

function Grafico({ titulo, dados }) {
    return (
        <div className="bg-surface border border-border rounded-xl p-4">
            <h3 className="font-bold text-text text-center mb-2">{titulo}</h3>
            {dados.length === 0 ? (
                <p className="text-center text-muted py-16">sem dados</p>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={dados} dataKey="total" nameKey="nome" innerRadius={55} outerRadius={100} label={{ fill: "#d4dde6" }}>
                            {dados.map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: "#151a20", border: "1px solid #252d36", borderRadius: 8 }} itemStyle={{ color: "#d4dde6" }} labelStyle={{ color: "#d4dde6" }} />
                        <Legend wrapperStyle={{ color: "#d4dde6" }} />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}

function Dashboard() {
    const [dados, setDados] = useState(null)
    const [erro, setErro] = useState(null)

    useEffect(() => {
        api.get("/dashboard")
            .then((res) => setDados(res.data))
            .catch((err) => setErro(mensagemErro(err)))
    }, [])

    if (erro) return <p className="text-danger">{erro}</p>
    if (!dados) return <p className="text-muted">carregando...</p>

    const t = dados.totais

    return (
        <div>
            <h1 className="text-2xl font-bold text-text mb-4">Visão Geral do Sistema</h1>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Cartao titulo="Nº Clientes" valor={t.clientes} />
                <Cartao titulo="Nº Itens" valor={t.itens} />
                <Cartao titulo="Nº Perguntas" valor={t.interacoes} />
                <Cartao titulo="Sem resposta" valor={t.interacoesPendentes} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
                <Grafico titulo="Itens por Categoria" dados={dados.itensPorCategoria.map((c) => ({ nome: c.categoria, total: c.total }))} />
                <Grafico titulo="Vendas por Vendedor" dados={dados.vendasPorVendedor.map((v) => ({ nome: v.vendedor, total: v.total }))} />
            </div>

            <div className="bg-surface border border-border rounded-xl p-4 overflow-x-auto">
                <h3 className="font-bold text-text mb-2">Últimas vendas</h3>
                {dados.ultimasVendas.length === 0 ? (
                    <p className="text-muted text-sm">Nenhuma venda registrada.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="text-left text-muted">
                            <tr><th className="p-2">Data</th><th className="p-2">Item</th><th className="p-2">Comprador</th></tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {dados.ultimasVendas.map((v) => (
                                <tr key={v.id}>
                                    <td className="p-2">{formatarData(v.data_compra)}</td>
                                    <td className="p-2">{v.item?.nome}</td>
                                    <td className="p-2">{v.comprador?.nome}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

export default Dashboard
