import type { Request, Response } from "express"
import bcrypt from 'bcrypt'
import { prisma } from "../../lib/prisma.js"

export async function CriarVendedor(req: Request, res: Response) {
    try {
        const { nome, email, senha } = req.body

        if (!nome || !email || !senha) {
            res.status(400).json({ error: "Nome, email e senha são obrigatórios." })
            return
        }

        const senhaHash = await bcrypt.hash(senha, 10)

        const criar = await prisma.vendedor.create({
            data: {
                nome, email, senha: senhaHash,
                saldo_platinas: 0,
                saldo_creditos: 0
            },
            select: { id: true, nome: true, email: true, saldo_platinas: true, saldo_creditos: true }
        })

        res.status(201).json({ mensagem: "Vendedor cadastrado: ", criar })
    } catch (error) {
        console.error("Falha, ", error)
        res.status(400).json({ error: "Falha ao cadastrar vendedor." })
        return
    }
}

export async function ListarVendedores(req: Request, res: Response) {
    try {
        const listar = await prisma.vendedor.findMany({
            select: {
                id: true, nome: true, email: true,
                saldo_platinas: true, saldo_creditos: true, ultimoLogin: true
            },
            orderBy: { nome: 'asc' }
        })
        res.status(200).json(listar)
    } catch (error) {
        res.status(400).json({ error: "Falha ao listar vendedores." })
        return
    }
}

export async function PesquisarVendedor(req: Request, res: Response) {
    try {
        const { nome } = req.query

        if (!nome || typeof nome !== 'string') {
            res.status(400).json({ error: "Parametro de pesquisa inválido." })
            return
        }

        const resultados = await prisma.vendedor.findMany({
            where: { nome: { contains: nome } },
            select: { id: true, nome: true, email: true }
        })

        res.status(200).json(resultados)
    } catch (error) {
        res.status(400).json({ error: "Falha ao realizar a pesquisa." })
        return
    }
}