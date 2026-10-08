import "dotenv/config"
import { prisma } from "../lib/prisma.js"
import { buscarDadosComGemini, erroDeCota, iaConfigurada } from "../src/services/iaServices.js"
import { filtroCategoriasBuild } from "../lib/categoriasBuild.js"
import type { Prisma } from "../generated/prisma/client.js"

// Gera os dados de IA de todos os itens que ainda não têm.
// Rode antes da apresentação:  npm run gerar-ia
// (pode ser rodado várias vezes: só consulta os itens que faltam)
// O plano gratuito do Gemini tem limite diário de requisições. Para gastar menos:
//   npm run gerar-ia -- 8     gera no máximo 8 itens nesta execução
// Ao bater no limite diário, o script para sozinho.
const PAUSA_MS = 5000 // pausa entre chamadas, para não estourar o limite do plano gratuito

async function main() {
    if (!iaConfigurada()) {
        console.log("Defina GEMINI_API_KEY no .env antes de rodar.")
        return
    }

    const itens = await prisma.item.findMany({
        where: { categoria: filtroCategoriasBuild },
        include: { categoria: true },
        orderBy: { id: "asc" },
    })
    const limite = Number(process.argv[2]) || Infinity
    const pendentes = itens.filter((i) => !i.dadosIA).slice(0, limite)
    console.log(`${pendentes.length} item(ns) sem dados de IA.`)

    for (const item of pendentes) {
        try {
            const dados = await buscarDadosComGemini(item.nome, item.categoria.nome)
            await prisma.item.update({
                where: { id: item.id },
                data: { dadosIA: dados as unknown as Prisma.InputJsonValue, dadosIAEm: new Date() },
            })
            console.log(`OK   ${item.nome}`)
        } catch (e: any) {
            console.log(`FALHA ${item.nome}: ${e?.message}`)
            if (erroDeCota(e)) {
                console.log("Limite diário da IA atingido. Rode de novo mais tarde (ou amanhã), ou troque GEMINI_MODEL no .env.")
                break
            }
        }
        await new Promise((r) => setTimeout(r, PAUSA_MS))
    }
}

main()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(async () => { await prisma.$disconnect() })
