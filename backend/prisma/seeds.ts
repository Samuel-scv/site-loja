import bcrypt from "bcrypt"
import { prisma } from "../lib/prisma.js"

// ---------- CATÁLOGO (tema Warframe) ----------
// platina e crédito são os preços de cada anúncio; estoque é a quantidade à venda.
type Anuncio = { nome: string; platina: number; credito: number; estoque: number }

const catalogo: { categoria: string; itens: Anuncio[] }[] = [
    {
        categoria: "Warframes",
        itens: [
            { nome: "Excalibur Prime", platina: 60, credito: 0, estoque: 3 },
            { nome: "Rhino Prime", platina: 80, credito: 0, estoque: 4 },
            { nome: "Mag Prime", platina: 45, credito: 0, estoque: 5 },
            { nome: "Volt Prime", platina: 70, credito: 0, estoque: 2 },
            { nome: "Saryn Prime", platina: 120, credito: 0, estoque: 2 },
            { nome: "Nova Prime", platina: 55, credito: 0, estoque: 3 },
        ],
    },
    {
        categoria: "Armas Primárias",
        itens: [
            { nome: "Soma Prime", platina: 35, credito: 0, estoque: 6 },
            { nome: "Boltor Prime", platina: 25, credito: 0, estoque: 6 },
            { nome: "Tigris Prime", platina: 30, credito: 0, estoque: 4 },
            { nome: "Rubico Prime", platina: 40, credito: 0, estoque: 3 },
            { nome: "Latron Prime", platina: 20, credito: 100, estoque: 8 },
            { nome: "Braton Prime", platina: 15, credito: 200, estoque: 10 },
        ],
    },
    {
        categoria: "Armas Secundárias",
        itens: [
            { nome: "Lex Prime", platina: 15, credito: 0, estoque: 8 },
            { nome: "Akstiletto Prime", platina: 30, credito: 0, estoque: 4 },
            { nome: "Kuva Nukor", platina: 45, credito: 0, estoque: 3 },
            { nome: "Atomos", platina: 10, credito: 300, estoque: 12 },
            { nome: "Pyrana Prime", platina: 25, credito: 0, estoque: 5 },
        ],
    },
    {
        categoria: "Armas Corpo a Corpo",
        itens: [
            { nome: "Galatine Prime", platina: 40, credito: 0, estoque: 4 },
            { nome: "Nikana Prime", platina: 35, credito: 0, estoque: 5 },
            { nome: "Reaper Prime", platina: 30, credito: 0, estoque: 4 },
            { nome: "Orthos Prime", platina: 20, credito: 0, estoque: 6 },
            { nome: "Dual Kamas Prime", platina: 15, credito: 150, estoque: 7 },
            { nome: "Gram Prime", platina: 35, credito: 0, estoque: 3 },
        ],
    },
    {
        categoria: "Mods",
        itens: [
            { nome: "Serration", platina: 5, credito: 400, estoque: 30 },
            { nome: "Vitality", platina: 0, credito: 250, estoque: 40 },
            { nome: "Redirection", platina: 0, credito: 250, estoque: 40 },
            { nome: "Steel Fiber", platina: 0, credito: 300, estoque: 35 },
            { nome: "Flow", platina: 0, credito: 350, estoque: 30 },
            { nome: "Blind Rage", platina: 8, credito: 500, estoque: 20 },
            { nome: "Primed Continuity", platina: 25, credito: 0, estoque: 6 },
            { nome: "Primed Flow", platina: 30, credito: 0, estoque: 5 },
        ],
    },
    {
        categoria: "Companheiros",
        itens: [
            { nome: "Carrier Prime", platina: 20, credito: 0, estoque: 5 },
            { nome: "Dethcube Prime", platina: 25, credito: 0, estoque: 4 },
            { nome: "Wyrm Prime", platina: 20, credito: 0, estoque: 4 },
            { nome: "Smeeta Kavat", platina: 30, credito: 0, estoque: 3 },
            { nome: "Sunika Kubrow", platina: 25, credito: 0, estoque: 3 },
        ],
    },
    {
        categoria: "Arcanos",
        itens: [
            { nome: "Arcane Energize", platina: 50, credito: 0, estoque: 5 },
            { nome: "Arcane Grace", platina: 45, credito: 0, estoque: 4 },
            { nome: "Arcane Guardian", platina: 35, credito: 0, estoque: 6 },
            { nome: "Arcane Strike", platina: 25, credito: 0, estoque: 6 },
            { nome: "Arcane Avenger", platina: 20, credito: 0, estoque: 8 },
        ],
    },
    {
        categoria: "Recursos",
        itens: [
            { nome: "Forma", platina: 0, credito: 900, estoque: 25 },
            { nome: "Orokin Cell", platina: 0, credito: 600, estoque: 50 },
            { nome: "Neural Sensors", platina: 0, credito: 700, estoque: 40 },
            { nome: "Neurodes", platina: 0, credito: 550, estoque: 40 },
            { nome: "Argon Crystal", platina: 0, credito: 800, estoque: 30 },
            { nome: "Ferrite (x1000)", platina: 0, credito: 200, estoque: 100 },
        ],
    },
]

// Item.nome não é único no schema, então procuramos antes de criar.
// Assim dá para rodar o seed várias vezes sem duplicar nada.
async function garantirItem(nome: string, id_categoria: number) {
    const existente = await prisma.item.findFirst({ where: { nome, id_categoria } })
    return existente ?? prisma.item.create({ data: { nome, id_categoria } })
}

async function garantirListagem(dados: {
    id_item: number
    id_vendedor: number
    preco_platina: number
    preco_credito: number
    estoque: string
}) {
    const existente = await prisma.loja.findFirst({
        where: { id_item: dados.id_item, id_vendedor: dados.id_vendedor },
    })
    if (!existente) await prisma.loja.create({ data: { ...dados, ativo: true } })
}

async function main() {
    console.log("Iniciando seed...")

    // ---------- ADMIN ----------
    const senhaAdmin = await bcrypt.hash("admin123", 10)
    const admin = await prisma.admin.upsert({
        where: { email: "admin@lojagames.com" },
        update: {},
        create: {
            nome: "Administrador Geral",
            email: "admin@lojagames.com",
            senha: senhaAdmin,
        },
    })

    // ---------- VENDEDORES ----------
    const senhaVendedor = await bcrypt.hash("vendedor123", 10)
    const vendedor1 = await prisma.vendedor.upsert({
        where: { email: "vendedor1@lojagames.com" },
        update: {},
        create: {
            nome: "Loja do João",
            email: "vendedor1@lojagames.com",
            senha: senhaVendedor,
            saldo_platinas: 0,
            saldo_creditos: 0,
        },
    })

    const vendedor2 = await prisma.vendedor.upsert({
        where: { email: "vendedor2@lojagames.com" },
        update: {},
        create: {
            nome: "Games da Maria",
            email: "vendedor2@lojagames.com",
            senha: senhaVendedor,
            saldo_platinas: 0,
            saldo_creditos: 0,
        },
    })

    // ---------- CLIENTES ----------
    const senhaCliente = await bcrypt.hash("cliente123", 10)
    const cliente1 = await prisma.cliente.upsert({
        where: { email: "cliente1@lojagames.com" },
        update: {},
        create: {
            nome: "Carlos Souza",
            email: "cliente1@lojagames.com",
            senha: senhaCliente,
            saldo_platinas: 500,
            saldo_creditos: 1000,
        },
    })

    const cliente2 = await prisma.cliente.upsert({
        where: { email: "cliente2@lojagames.com" },
        update: {},
        create: {
            nome: "Ana Lima",
            email: "cliente2@lojagames.com",
            senha: senhaCliente,
            saldo_platinas: 250,
            saldo_creditos: 500,
        },
    })

    // ---------- LIMPEZA DOS ITENS ANTIGOS (genéricos da primeira versão do seed) ----------
    // Se algum já foi vendido, o banco impede a exclusão e ele simplesmente fica.
    for (const nome of ["Skin Dragão Lendário", "1000 Moedas de Ouro", "Conta Nível 50"]) {
        try {
            await prisma.item.deleteMany({ where: { nome } })
        } catch {
            console.log(`Item antigo mantido (já tem vendas): ${nome}`)
        }
    }
    for (const nome of ["Skins", "Moedas do Jogo", "Contas"]) {
        try {
            await prisma.categoria.deleteMany({ where: { nome } })
        } catch {
            console.log(`Categoria antiga mantida (ainda tem itens): ${nome}`)
        }
    }

    // ---------- CATEGORIAS, ITENS E LISTAGENS ----------
    // Os anúncios se alternam entre os dois vendedores.
    const vendedores = [vendedor1, vendedor2]
    let contador = 0
    let totalItens = 0
    const itensPorNome = new Map<string, number>()

    for (const grupo of catalogo) {
        const categoria = await prisma.categoria.upsert({
            where: { nome: grupo.categoria },
            update: {},
            create: { nome: grupo.categoria },
        })

        for (const anuncio of grupo.itens) {
            const item = await garantirItem(anuncio.nome, categoria.id)
            itensPorNome.set(anuncio.nome, item.id)
            totalItens++

            const vendedor = vendedores[contador % vendedores.length]!
            contador++

            await garantirListagem({
                id_item: item.id,
                id_vendedor: vendedor.id,
                preco_platina: anuncio.platina,
                preco_credito: anuncio.credito,
                estoque: String(anuncio.estoque),
            })
        }
    }

    // ---------- INVENTÁRIO DE EXEMPLO ----------
    const inventario = [
        { id_cliente: cliente1.id, nome: "Excalibur Prime" },
        { id_cliente: cliente1.id, nome: "Serration" },
        { id_cliente: cliente2.id, nome: "Lex Prime" },
        { id_cliente: cliente2.id, nome: "Forma" },
    ]

    for (const registro of inventario) {
        const id_item = itensPorNome.get(registro.nome)
        if (!id_item) continue

        const existente = await prisma.inventario.findFirst({
            where: { id_cliente: registro.id_cliente, id_item },
        })
        if (!existente) {
            await prisma.inventario.create({ data: { id_cliente: registro.id_cliente, id_item } })
        }
    }

    console.log("Seed concluído com sucesso!")
    console.log({
        admin: admin.email,
        vendedores: [vendedor1.email, vendedor2.email],
        clientes: [cliente1.email, cliente2.email],
        categorias: catalogo.length,
        itens: totalItens,
    })
}

main()
    .catch((e) => {
        console.error("Erro ao rodar seed:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })