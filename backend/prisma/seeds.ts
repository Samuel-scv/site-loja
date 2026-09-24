import bcrypt from "bcrypt"
import { prisma } from "../lib/prisma.js"

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

    // ---------- CATEGORIAS ----------
    const categoriaSkins = await prisma.categoria.upsert({
        where: { nome: "Skins" },
        update: {},
        create: { nome: "Skins" },
    })

    const categoriaMoedas = await prisma.categoria.upsert({
        where: { nome: "Moedas do Jogo" },
        update: {},
        create: { nome: "Moedas do Jogo" },
    })

    const categoriaContas = await prisma.categoria.upsert({
        where: { nome: "Contas" },
        update: {},
        create: { nome: "Contas" },
    })

    // ---------- ITENS ----------
    const item1 = await prisma.item.upsert({
        where: { id: 1 },
        update: {},
        create: { nome: "Skin Dragão Lendário", id_categoria: categoriaSkins.id },
    })

    const item2 = await prisma.item.upsert({
        where: { id: 2 },
        update: {},
        create: { nome: "1000 Moedas de Ouro", id_categoria: categoriaMoedas.id },
    })

    const item3 = await prisma.item.upsert({
        where: { id: 3 },
        update: {},
        create: { nome: "Conta Nível 50", id_categoria: categoriaContas.id },
    })

    // ---------- LISTAGENS NA LOJA ----------
    await prisma.loja.createMany({
        data: [
            {
                id_item: item1.id,
                id_vendedor: vendedor1.id,
                preco_platina: 50,
                preco_credito: 0,
                estoque: "10",
                ativo: true,
            },
            {
                id_item: item2.id,
                id_vendedor: vendedor2.id,
                preco_platina: 0,
                preco_credito: 200,
                estoque: "50",
                ativo: true,
            },
            {
                id_item: item3.id,
                id_vendedor: vendedor1.id,
                preco_platina: 120,
                preco_credito: 0,
                estoque: "3",
                ativo: true,
            },
        ],
        skipDuplicates: true,
    })

    // ---------- INVENTÁRIO DE EXEMPLO ----------
    await prisma.inventario.createMany({
        data: [
            { id_cliente: cliente1.id, id_item: item1.id },
            { id_cliente: cliente2.id, id_item: item2.id },
        ],
        skipDuplicates: true,
    })

    console.log("Seed concluído com sucesso!")
    console.log({ admin: admin.email, vendedores: [vendedor1.email, vendedor2.email], clientes: [cliente1.email, cliente2.email] })
}

main()
    .catch((e) => {
        console.error("Erro ao rodar seed:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })