import { useEffect, useState } from "react"
import { api, mensagemErro } from "../../lib/api"
import { FotoItem } from "../../components/ItemCard"
import { imagemParaTexto } from "../../lib/imagem"

const campo = "w-full border border-border rounded-lg p-2 text-text bg-surface focus:outline-none focus:border-primary"
const vazio = { id: null, nome: "", descricao: "", foto: "", id_categoria: "", destaque: false }

function Itens() {
    const [itens, setItens] = useState([])
    const [categorias, setCategorias] = useState([])
    const [form, setForm] = useState(null) // null = formulário fechado
    const [aviso, setAviso] = useState(null)
    const [ocupado, setOcupado] = useState(null) // id do item consultando a IA

    function carregar() {
        api.get("/itens/listar").then((res) => setItens(res.data)).catch((err) => setAviso({ erro: true, texto: mensagemErro(err) }))
    }

    useEffect(() => {
        carregar()
        api.get("/categorias/listar").then((res) => setCategorias(res.data)).catch(() => {})
    }, [])

    function mudar(e) {
        const { name, value, type, checked } = e.target
        setForm({ ...form, [name]: type === "checkbox" ? checked : value })
    }

    async function escolherFoto(e) {
        const arquivo = e.target.files?.[0]
        if (!arquivo) return
        try {
            const foto = await imagemParaTexto(arquivo)
            setForm((f) => ({ ...f, foto }))
            setAviso(null)
        } catch (err) {
            setAviso({ erro: true, texto: err.message })
        }
        e.target.value = "" // permite escolher o mesmo arquivo de novo
    }

    async function salvar(e) {
        e.preventDefault()
        setAviso(null)
        const corpo = {
            nome: form.nome,
            descricao: form.descricao || null,
            foto: form.foto || null,
            id_categoria: form.id_categoria,
            destaque: form.destaque,
        }
        try {
            if (form.id) await api.put(`/itens/atualizar/${form.id}`, corpo)
            else await api.post("/itens/criar", corpo)
            setForm(null)
            carregar()
        } catch (err) {
            setAviso({ erro: true, texto: mensagemErro(err) })
        }
    }

    async function alternarDestaque(item) {
        try {
            await api.put(`/itens/atualizar/${item.id}`, { destaque: !item.destaque })
            carregar()
        } catch (err) {
            setAviso({ erro: true, texto: mensagemErro(err) })
        }
    }

    async function excluir(item) {
        if (!confirm(`Excluir "${item.nome}"?`)) return
        try {
            await api.delete(`/itens/deletar/${item.id}`)
            carregar()
        } catch (err) {
            setAviso({ erro: true, texto: mensagemErro(err) })
        }
    }

    async function gerarIA(item) {
        setOcupado(item.id)
        setAviso(null)
        try {
            await api.post(`/itens/gerar-ia/${item.id}`)
            carregar()
        } catch (err) {
            setAviso({ erro: true, texto: mensagemErro(err) })
        } finally {
            setOcupado(null)
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-text">Cadastro de Itens</h1>
                <button onClick={() => setForm({ ...vazio })} className="bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 transition-colors">Novo Item</button>
            </div>

            {aviso && <p className={`mb-4 text-sm ${aviso.erro ? "text-danger" : "text-success"}`}>{aviso.texto}</p>}

            {form && (
                <form onSubmit={salvar} className="bg-surface border border-border rounded-xl p-4 mb-6 grid gap-3 md:grid-cols-2">
                    <input name="nome" required placeholder="Nome" className={campo} value={form.nome} onChange={mudar} />
                    <select name="id_categoria" required className={campo} value={form.id_categoria} onChange={mudar}>
                        <option value="">Categoria...</option>
                        {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm text-text">Foto do item (opcional)</label>
                        <div className="flex flex-wrap items-center gap-3">
                            {form.foto && <img src={form.foto} alt="prévia" className="w-24 h-16 object-cover rounded border border-border" />}
                            <input type="file" accept="image/*" onChange={escolherFoto} className="text-sm text-text" />
                            {form.foto && (
                                <button type="button" onClick={() => setForm({ ...form, foto: "" })} className="text-sm text-danger underline">remover foto</button>
                            )}
                        </div>
                        <input
                            name="foto"
                            placeholder="ou cole o link (URL) de uma imagem"
                            className={campo}
                            value={form.foto?.startsWith("data:") ? "" : form.foto}
                            onChange={mudar}
                        />
                    </div>
                    <textarea name="descricao" rows={2} placeholder="Descrição (opcional)" className={`${campo} md:col-span-2`} value={form.descricao} onChange={mudar} />
                    <label className="flex items-center gap-2 text-sm text-text">
                        <input type="checkbox" name="destaque" checked={form.destaque} onChange={mudar} /> Item em destaque
                    </label>
                    <div className="flex gap-2 md:justify-end">
                        <button type="button" onClick={() => setForm(null)} className="border border-border rounded-lg px-4 py-2 text-text">Cancelar</button>
                        <button className="bg-accent hover:bg-accent-hover text-white rounded-lg px-4 py-2 transition-colors">{form.id ? "Salvar alterações" : "Cadastrar"}</button>
                    </div>
                </form>
            )}

            <div className="bg-surface border border-border rounded-xl overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="text-left text-muted">
                        <tr>
                            <th className="p-3">FOTO</th>
                            <th className="p-3">NOME</th>
                            <th className="p-3">CATEGORIA</th>
                            <th className="p-3">IA</th>
                            <th className="p-3">AÇÕES</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {itens.map((i) => (
                            <tr key={i.id}>
                                <td className="p-3"><FotoItem item={i} className="w-20 h-12 rounded" texto="text-lg" /></td>
                                <td className="p-3 font-semibold text-text">{i.nome}</td>
                                <td className="p-3 text-muted">{i.categoria?.nome}</td>
                                <td className="p-3">
                                    {ocupado === i.id ? (
                                        <span className="text-muted">consultando...</span>
                                    ) : i.dadosIA ? (
                                        <span className="text-success">✓ gerado</span>
                                    ) : (
                                        <button onClick={() => gerarIA(i)} className="text-primary underline">gerar</button>
                                    )}
                                </td>
                                <td className="p-3 whitespace-nowrap">
                                    <button title="Destaque" onClick={() => alternarDestaque(i)} className={`text-xl mr-2 ${i.destaque ? "text-amber-500" : "text-muted"}`}>{i.destaque ? "★" : "☆"}</button>
                                    <button onClick={() => setForm({ id: i.id, nome: i.nome, descricao: i.descricao ?? "", foto: i.foto ?? "", id_categoria: i.id_categoria, destaque: i.destaque })} className="text-primary underline mr-3">editar</button>
                                    <button onClick={() => excluir(i)} className="text-danger underline">excluir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Itens
