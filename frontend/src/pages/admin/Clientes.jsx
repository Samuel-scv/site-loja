import { useEffect, useState } from "react"
import { api, formatarData, mensagemErro } from "../../lib/api"

function Clientes() {
    const [lista, setLista] = useState([])
    const [erro, setErro] = useState(null)

    useEffect(() => {
        api.get("/clientes/listar")
            .then((res) => setLista(res.data))
            .catch((err) => setErro(mensagemErro(err)))
    }, [])

    return (
        <div>
            <h1 className="text-2xl font-bold text-text mb-4">Controle de Clientes</h1>
            {erro && <p className="mb-4 text-sm text-danger">{erro}</p>}

            <div className="bg-surface border border-border rounded-xl overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="text-left text-muted">
                        <tr>
                            <th className="p-3">NOME</th>
                            <th className="p-3">E-MAIL</th>
                            <th className="p-3">PLATINAS</th>
                            <th className="p-3">CRÉDITOS</th>
                            <th className="p-3">ÚLTIMO LOGIN</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {lista.map((c) => (
                            <tr key={c.id}>
                                <td className="p-3 font-semibold text-text">{c.nome}</td>
                                <td className="p-3 text-muted">{c.email}</td>
                                <td className="p-3">{c.saldo_platinas}</td>
                                <td className="p-3">{c.saldo_creditos}</td>
                                <td className="p-3 text-muted">{formatarData(c.ultimoLogin) || "—"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Clientes
