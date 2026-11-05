import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { api, mensagemErro } from "../lib/api"

// endereços que os QR codes abrem: um deles é sorteado cada vez que o QR code aparece
// para colocar mais, é só adicionar outra linha com o link entre aspas
const LINKS_QR = [ 
    "https://youtu.be/zL19uMsnpSU?si=4IG5b1IPk9OuYr7e",
    "https://www.youtube.com/watch?v=paxfXEDBE80",
    "https://www.youtube.com/watch?v=UHb-zekohac",
    "https://www.youtube.com/watch?v=BbeeuzU5Qc8",
]

function sortearLink() {
return LINKS_QR[Math.floor(Math.random() * LINKS_QR.length)]
}

// mesmo limite do backend por recarga
const LIMITE = 10000

const campo = "w-full border border-border rounded-lg p-2 text-text bg-bg focus:outline-none focus:border-primary"

function AdicionarSaldo({ onAtualizar }) {
const [tipo, setTipo] = useState("platina")
const [valor, setValor] = useState("")
const [qr, setQr] = useState(null) // { tipo, valor, link } enquanto o QR code está na tela
const [msg, setMsg] = useState(null)
const [ocupado, setOcupado] = useState(false)

const nomeTipo = (t) => (t === "platina" ? "platinas" : "créditos")

function gerarQr(e) {
    e.preventDefault()
    setMsg(null)
    const n = Number(valor)
    if (!Number.isFinite(n) || n <= 0 || n > LIMITE) {
        setMsg({ erro: true, texto: `Informe um valor entre 0,01 e ${LIMITE}.` })
        return
    }
    setQr({ tipo, valor: n, link: sortearLink() }) // sorteia o link uma vez, quando o QR code aparece
}

async function confirmar() {
    setOcupado(true)
    setMsg(null)
    try {
        await api.patch("/clientes/adicionar-saldo", { tipo: qr.tipo, valor: qr.valor })
        setMsg({ erro: false, texto: `${qr.valor} ${nomeTipo(qr.tipo)} adicionadas à sua conta.` })
        setQr(null)
        setValor("")
        onAtualizar?.()
    } catch (err) {
        setMsg({ erro: true, texto: mensagemErro(err) })
    } finally {
        setOcupado(false)
    }
}

return (
    <div className="mt-8 pt-6 border-t border-border">
        <h2 className="text-lg font-bold text-text mb-3">Adicionar saldo</h2>

        {msg && <p className={`mb-3 text-sm ${msg.erro ? "text-danger" : "text-success"}`}>{msg.texto}</p>}

        {!qr ? (
            <form onSubmit={gerarQr} className="space-y-3">
                <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={campo}>
                    <option value="platina">Platinas</option>
                    <option value="credito">Créditos</option>
                </select>
                <input
                    type="number"
                    min="0.01"
                    max={LIMITE}
                    step="0.01"
                    placeholder="Quantidade"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className={campo}
                    required
                />
                <button className="w-full bg-accent hover:bg-accent-hover text-white rounded-lg px-4 py-2 transition-colors">
                    Adicionar
                </button>
            </form>
        ) : (
            <div className="text-center space-y-3">
                <p className="text-sm text-text">
                    Escaneie o QR code para pagar <span className="font-semibold">{qr.valor} {nomeTipo(qr.tipo)}</span>
                </p>
                <div className="inline-block bg-white p-3 rounded-lg">
                    <QRCodeSVG value={qr.link} size={180} />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={confirmar}
                        disabled={ocupado}
                        className="flex-1 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white rounded-lg px-4 py-2 transition-colors"
                    >
                        {ocupado ? "adicionando..." : "Confirmar pagamento"}
                    </button>
                    <button onClick={() => setQr(null)} disabled={ocupado} className="border border-border rounded-lg px-4 py-2 text-text">
                        Cancelar
                    </button>
                </div>
            </div>
        )}
    </div>
)
}

function Conta({ user, onAtualizar }) {
if (!user) {
    return <div className="max-w-sm mx-auto mt-16 text-center text-muted">carregando seus dados...</div>
}

return (
    <div className="max-w-sm mx-auto mt-16 bg-surface border border-border rounded-xl p-8">
        <h1 className="text-2xl font-bold text-text mb-6">Minha conta</h1>
        <dl className="space-y-3 text-text">
            <div>
                <dt className="text-xs uppercase text-muted">Nome</dt>
                <dd>{user.nome}</dd>
            </div>
            <div>
                <dt className="text-xs uppercase text-muted">Email</dt>
                <dd>{user.email}</dd>
            </div>
            <div>
                <dt className="text-xs uppercase text-muted">Tipo</dt>
                <dd>{user.tipo}</dd>
            </div>
            {user.tipo !== "ADMIN" && (
                <>
                    <div>
                        <dt className="text-xs uppercase text-muted">Platinas</dt>
                        <dd>{Number(user.saldo_platinas).toFixed(2)}</dd>
                    </div>
                    <div>
                        <dt className="text-xs uppercase text-muted">Créditos</dt>
                        <dd>{Number(user.saldo_creditos).toFixed(2)}</dd>
                    </div>
                </>
            )}
        </dl>

        {user.tipo === "CLIENTE" && <AdicionarSaldo onAtualizar={onAtualizar} />}
    </div>
)
}

export default Conta