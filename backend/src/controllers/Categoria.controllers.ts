import type { Request, Response } from "express"
import { prisma } from "../../lib/prisma.js"

export async function ListarCategorias(req: Request, res: Response) {
    try {
        const listar = await prisma.categoria.findMany({
            orderBy: { nome: 'asc' }
        })
        res.status(200).json(listar)
    } catch (error) {
        res.status(400).json({ error: "Falha ao listar categorias." })
        return
    }
}

export async function CriarCategoria(req: Request, res: Response) {
    try {
        const { nome, descricao } = req.body

        if (!nome) {
            res.status(400).json({ error: "O nome da categoria é obrigatório." })
            return
        }

        const criar = await prisma.categoria.create({
            data: { nome, descricao }
        })

        res.status(201).json(criar)
    } catch (error) {
        res.status(400).json({ error: "Falha ao criar categoria." })
        return
    }
}

export async function AtualizarCategoria(req: Request, res: Response) {
    try {
        const { id } = req.params
        const { nome, descricao } = req.body

        if (!id) {
            res.status(404).json({ error: "ID Inválido." })
            return
        }

        if (!nome) {
            res.status(400).json({ error: "O nome da categoria é obrigatório." })
            return
        }

        const atualizar = await prisma.categoria.update({
            where: { idCategoria: Number(id) },
            data: { nome, descricao }
        })

        res.status(200).json({ mensagem: "Categoria atualizada: ", atualizar })
    } catch (error) {
        res.status(400).json({ error: "Falha ao atualizar categoria." })
        return
    }
}

export async function DeletarCategoria(req: Request, res: Response) {
    try {
        const { id } = req.params

        if (!id) {
            res.status(404).json({ error: "ID Inválido." })
            return
        }

        const categoria = await prisma.categoria.findUnique({
            where: { idCategoria: Number(id) }
        })

        if (!categoria) {
            res.status(404).json({ error: "Categoria não encontrada." })
            return
        }

        const deletar = await prisma.categoria.delete({
            where: { idCategoria: Number(id) }
        })

        res.status(200).json({ mensagem: "Categoria deletada: ", deletar })
    } catch (error) {
        res.status(400).json({ error: "Falha ao deletar categoria. Verifique se não há itens vinculados a ela." })
        return
    }
}