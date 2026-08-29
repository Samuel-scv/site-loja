import type { Request, Response } from "express"
import { prisma } from "../../lib/prisma.js"

// Item agora é só o catálogo base (nome + categoria). Preço, estoque e status
// "ativo" pertencem à Loja, que é o anúncio de um vendedor para esse item.
export async function ListarItens(req: Request, res: Response) {
    try {
        const listar = await prisma.item.findMany({
            include: { categoria: true }
        })
        res.status(200).json(listar)
    } catch (error) {
        res.status(400).json({ error: "Falha ao listar itens." })
        return
    }
}

export async function PesquisarItem(req: Request, res: Response) {
    try {
        const { nome } = req.query

        if (!nome || typeof nome !== 'string') {
            res.status(400).json({ error: "Parametro de pesquisa inválido." })
            return
        }

        const resultados = await prisma.item.findMany({
            where: { nome: { contains: nome } },
            include: { categoria: true }
        })

        res.status(200).json(resultados)
    } catch (error) {
        res.status(400).json({ error: "Falha ao realizar a pesquisa." })
        return
    }
}

export async function CriarItem(req: Request, res: Response) {
    try {
        const { id_categoria, nome } = req.body

        if (!id_categoria || !nome) {
            res.status(400).json({ error: "Categoria e nome do item são obrigatórios." })
            return
        }

        const criar = await prisma.item.create({
            data: { id_categoria: Number(id_categoria), nome }
        })

        res.status(201).json(criar)
    } catch (error) {
        console.error("Falha, ", error)
        res.status(400).json({ error: "Falha ao criar item." })
        return
    }
}

export async function AtualizarItem(req: Request, res: Response) {
    try {
        const { id } = req.params
        const { nome, id_categoria } = req.body

        if (!id) {
            res.status(404).json({ error: "ID Inválido." })
            return
        }

        const atualizar = await prisma.item.update({
            where: { id: Number(id) },
            data: {
                nome,
                id_categoria: id_categoria ? Number(id_categoria) : undefined
            }
        })

        res.status(200).json({ mensagem: "Item atualizado: ", atualizar })
    } catch (error) {
        res.status(400).json({ error: "Falha ao atualizar item." })
        return
    }
}

export async function DeletarItem(req: Request, res: Response) {
    try {
        const { id } = req.params

        if (!id) {
            res.status(404).json({ error: "ID Inválido." })
            return
        }

        const item = await prisma.item.findUnique({ where: { id: Number(id) } })

        if (!item) {
            res.status(404).json({ error: "Item não encontrado." })
            return
        }

        const deletar = await prisma.item.delete({ where: { id: Number(id) } })

        res.status(200).json({ mensagem: "Item deletado: ", deletar })
    } catch (error) {
        res.status(400).json({ error: "Falha ao deletar item. Verifique se não há vendas registradas para ele." })
        return
    }
}