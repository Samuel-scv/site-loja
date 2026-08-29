import type { Response } from "express"
import { prisma } from "../../lib/prisma.js"
import type { AuthRequest } from "../middlewares/AuthMiddlewares.js"

// vitrine pública: só o que está ativo
export async function ListarLoja(req: AuthRequest, res: Response) {
    try {
        const listar = await prisma.loja.findMany({
            where: { ativo: true },
            include: {
                item: { include: { categoria: true } },
                vendedor: { select: { id: true, nome: true } }
            }
        })
        res.status(200).json(listar)
    } catch (error) {
        res.status(400).json({ error: "Falha ao listar itens à venda." })
        return
    }
}

export async function PesquisarLoja(req: AuthRequest, res: Response) {
    try {
        const { nome } = req.query

        if (!nome || typeof nome !== 'string') {
            res.status(400).json({ error: "Parametro de pesquisa inválido." })
            return
        }

        const resultados = await prisma.loja.findMany({
            where: {
                ativo: true,
                item: { nome: { contains: nome } }
            },
            include: {
                item: { include: { categoria: true } },
                vendedor: { select: { id: true, nome: true } }
            }
        })

        res.status(200).json(resultados)
    } catch (error) {
        res.status(400).json({ error: "Falha ao realizar a pesquisa." })
        return
    }
}

export async function ListarMinhasListagens(req: AuthRequest, res: Response) {
    try {
        const listar = await prisma.loja.findMany({
            where: { id_vendedor: req.userId! },
            include: { item: true }
        })
        res.status(200).json(listar)
    } catch (error) {
        res.status(400).json({ error: "Falha ao listar suas listagens." })
        return
    }
}

export async function CriarListagem(req: AuthRequest, res: Response) {
    try {
        const { id_item, preco_platina, preco_credito, estoque } = req.body

        if (!id_item || !estoque) {
            res.status(400).json({ error: "Item e estoque são obrigatórios." })
            return
        }

        const criar = await prisma.loja.create({
            data: {
                id_item: Number(id_item),
                id_vendedor: req.userId!,
                preco_platina: preco_platina ?? 0,
                preco_credito: preco_credito ?? 0,
                estoque: String(estoque)
            }
        })

        res.status(201).json(criar)
    } catch (error) {
        console.error("Falha, ", error)
        res.status(400).json({ error: "Falha ao criar listagem." })
        return
    }
}

export async function AtualizarListagem(req: AuthRequest, res: Response) {
    try {
        const { id } = req.params
        const { preco_platina, preco_credito, estoque } = req.body

        if (!id) {
            res.status(404).json({ error: "ID Inválido." })
            return
        }

        const listagem = await prisma.loja.findUnique({ where: { id: Number(id) } })

        if (!listagem) {
            res.status(404).json({ error: "Listagem não encontrada." })
            return
        }

        // vendedor só mexe nas próprias listagens; admin pode em qualquer uma
        if (req.tipo === "VENDEDOR" && listagem.id_vendedor !== req.userId) {
            res.status(403).json({ error: "Você só pode alterar suas próprias listagens." })
            return
        }

        const atualizar = await prisma.loja.update({
            where: { id: Number(id) },
            data: {
                preco_platina,
                preco_credito,
                estoque: estoque !== undefined ? String(estoque) : undefined
            }
        })

        res.status(200).json({ mensagem: "Listagem atualizada: ", atualizar })
    } catch (error) {
        res.status(400).json({ error: "Falha ao atualizar listagem." })
        return
    }
}

export async function AlternarStatusListagem(req: AuthRequest, res: Response) {
    try {
        const { id } = req.params

        if (!id) {
            res.status(404).json({ error: "ID Inválido." })
            return
        }

        const listagem = await prisma.loja.findUnique({ where: { id: Number(id) } })

        if (!listagem) {
            res.status(404).json({ error: "Listagem não encontrada." })
            return
        }

        if (req.tipo === "VENDEDOR" && listagem.id_vendedor !== req.userId) {
            res.status(403).json({ error: "Você só pode alterar suas próprias listagens." })
            return
        }

        const atualizar = await prisma.loja.update({
            where: { id: Number(id) },
            data: { ativo: !listagem.ativo }
        })

        res.status(200).json(atualizar)
    } catch (error) {
        res.status(400).json({ error: "Falha ao alterar status da listagem." })
        return
    }
}