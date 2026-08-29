import type { Response } from "express"
import type { Request } from "express"
import bcrypt from 'bcrypt'
import { prisma } from "../../lib/prisma.js"

export async function CriarCliente(req: Request, res: Response) {
    try {
        const { nome, email, senha } = req.body

        if (!nome || !email || !senha) {
            res.status(400).json({ error: "Nome, email e senha são obrigatórios." })
            return
        }

        const senhaHash = await bcrypt.hash(senha, 10)

        const criar = await prisma.cliente.create({
            data: {
                nome, email, senha: senhaHash,
                saldo_platinas: 0,
                saldo_creditos: 0
            },
            select: { id: true, nome: true, email: true, saldo_platinas: true, saldo_creditos: true }
        })

        res.status(201).json({ mensagem: "Cliente cadastrado: ", criar })
    } catch (error) {
        console.error("Falha, ", error)
        res.status(400).json({ error: "Falha ao cadastrar cliente." })
        return
    }
}

export async function ListarClientes(req: Request, res: Response) {
    try {
        const listar = await prisma.cliente.findMany({
            select: {
                id: true, nome: true, email: true,
                saldo_platinas: true, saldo_creditos: true, ultimoLogin: true
            },
            orderBy: { nome: 'asc' }
        })
        res.status(200).json(listar)
    } catch (error) {
        res.status(400).json({ error: "Falha ao listar clientes." })
        return
    }
}

export async function PesquisarCliente(req: Request, res: Response) {
    try {
        const { nome } = req.query

        if (!nome || typeof nome !== 'string') {
            res.status(400).json({ error: "Parametro de pesquisa inválido." })
            return
        }

        const resultados = await prisma.cliente.findMany({
            where: { nome: { contains: nome } },
            select: { id: true, nome: true, email: true, saldo_platinas: true, saldo_creditos: true }
        })

        res.status(200).json(resultados)
    } catch (error) {
        res.status(400).json({ error: "Falha ao realizar a pesquisa." })
        return
    }
}

export async function RecarregarSaldoCliente(req: Request, res: Response) {
    try {
        const { id } = req.params
        const { platina, credito } = req.body

        if (!id) {
            res.status(404).json({ error: "ID Inválido." })
            return
        }

        if (!platina && !credito) {
            res.status(400).json({ error: "Informe ao menos um valor para recarregar." })
            return
        }

        const cliente = await prisma.cliente.findUnique({ where: { id: Number(id) } })

        if (!cliente) {
            res.status(404).json({ error: "Cliente não encontrado." })
            return
        }

        const atualizar = await prisma.cliente.update({
            where: { id: Number(id) },
            data: {
                saldo_platinas: { increment: Number(platina) || 0 },
                saldo_creditos: { increment: Number(credito) || 0 }
            }
        })

        res.status(200).json(atualizar)
    } catch (error) {
        res.status(400).json({ error: "Falha ao recarregar saldo." })
        return
    }
}