import "dotenv/config"
import { GoogleGenAI, Type } from "@google/genai"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// Modelo usado na aula. Dá para trocar pelo .env (GEMINI_MODEL) sem mexer no código.
const MODELO = process.env.GEMINI_MODEL || "gemini-3.6-flash"

export type DadosIA = {
    resumo: string
    pontosFortes: string[]
    pontosFracos: string[]
    build: string[]
    comoObter: string
}

// Schema com os campos consultados
const schemaItem = {
    type: Type.OBJECT,
    properties: {
        resumo: {
            type: Type.STRING,
            description: "Resumo do item em até 2 frases"
        },
        pontosFortes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Principais pontos fortes do item (3 a 4 itens)"
        },
        pontosFracos: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Principais pontos fracos do item (2 a 3 itens)"
        },
        build: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Mods recomendados para a build (4 a 6 nomes de mods que existem no jogo)"
        },
        comoObter: {
            type: Type.STRING,
            description: "Como obter o item, em 1 frase"
        }
    },
    required: ["resumo", "pontosFortes", "pontosFracos", "build", "comoObter"]
}

export function iaConfigurada(): boolean {
    return !!process.env.GEMINI_API_KEY
}

// 503 (modelo sobrecarregado) costuma passar sozinho: espera um pouco e tenta de novo.
// 429 (cota diária do plano gratuito esgotada) NÃO é repetido: cada tentativa gastaria mais cota.
const ESPERAS_MS = [4000, 12000]

export function erroDeCota(e: any): boolean {
    const msg = String(e?.message ?? e)
    return /"code":\s*429|RESOURCE_EXHAUSTED|quota/i.test(msg)
}

function erroTemporario(e: any): boolean {
    if (erroDeCota(e)) return false
    const msg = String(e?.message ?? e)
    return /"code":\s*503|UNAVAILABLE|overloaded|high demand/i.test(msg)
}

async function consultar(nome: string, categoria: string): Promise<DadosIA> {
    const resposta = await ai.models.generateContent({
        model: MODELO,
        contents: `Item do jogo Warframe: ${nome} (categoria: ${categoria}).
Responda em português do Brasil.
Explique o item, liste pontos fortes e fracos e sugira uma build com os mods mais recomendados.
Use apenas nomes de mods que realmente existem no Warframe. Se não tiver certeza de um mod, não o inclua.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: schemaItem,
        },
    })

    return JSON.parse(resposta.text || "{}") as DadosIA
}

export async function buscarDadosComGemini(nome: string, categoria: string, esperas: number[] = ESPERAS_MS): Promise<DadosIA> {
    for (let tentativa = 0; ; tentativa++) {
        try {
            return await consultar(nome, categoria)
        } catch (e) {
            const espera = esperas[tentativa]
            if (!erroTemporario(e) || espera === undefined) throw e
            console.log(`Gemini ocupado, tentando de novo em ${espera / 1000}s...`)
            await new Promise((r) => setTimeout(r, espera))
        }
    }
}
