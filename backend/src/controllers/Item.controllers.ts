import type { Response } from "express"
import type { Request } from "express"
import { prisma } from "../../lib/prisma.js"
import type { AuthRequest } from "../middlewares/AuthMiddlewares.js"

export async function ListarItens(req: Request, res: Response) {
    try {
        const listar = await prisma.itemLoja.findMany({
            where: { ativo: true },
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
        const { nomeItem } = req.query

        if (!nomeItem || typeof nomeItem !== 'string') {
            res.status(400).json({ error: "Parametro de pesquisa inválido." })
            return
        }

        const resultados = await prisma.itemLoja.findMany({
            where: {
                nomeItem: { contains: nomeItem },
                ativo: true
            },
            include: { categoria: true }
        })

        res.status(200).json(resultados)
    } catch (error) {
        res.status(400).json({ error: "Falha ao realizar a pesquisa." })
        return
    }
}

export async function CriarItem(req: AuthRequest, res: Response) {
    try {
        const { idCategoria, nomeItem, precoPlatina, precoCredito } = req.body

        if (!idCategoria || !nomeItem) {
            res.status(400).json({ error: "Categoria e nome do item são obrigatórios." })
            return
        }

        const criar = await prisma.itemLoja.create({
            data: {
                idCategoria: Number(idCategoria),
                idUsuario: req.usuarioId!,
                nomeItem,
                precoPlatina: precoPlatina ?? 0,
                precoCredito: precoCredito ?? 0
            }
        })

        await prisma.logAuditoria.create({
            data: {
                idUsuario: req.usuarioId!,
                acao: "CRIAR_ITEM",
                tabelaAfetada: "item_loja"
            }
        })

        res.status(201).json(criar)
    } catch (error) {
        console.error("Falha, ", error)
        res.status(400).json({ error: "Falha ao criar item." })
        return
    }
}

export async function AtualizarItem(req: AuthRequest, res: Response) {
    try {
        const { id } = req.params
        const { nomeItem, precoPlatina, precoCredito, idCategoria } = req.body

        if (!id) {
            res.status(404).json({ error: "ID Inválido." })
            return
        }

        const atualizar = await prisma.itemLoja.update({
            where: { idItem: Number(id) },
            data: { nomeItem, precoPlatina, precoCredito, idCategoria }
        })

        await prisma.logAuditoria.create({
            data: {
                idUsuario: req.usuarioId!,
                acao: "ATUALIZAR_ITEM",
                tabelaAfetada: "item_loja"
            }
        })

        res.status(200).json({ mensagem: "Item atualizado: ", atualizar })
    } catch (error) {
        res.status(400).json({ error: "Falha ao atualizar item." })
        return
    }
}

// Ativa/desativa em vez de deletar de verdade, já que o item pode estar
// referenciado em pedidos e inventários já existentes.
export async function AlternarStatusItem(req: AuthRequest, res: Response) {
    try {
        const { id } = req.params

        if (!id) {
            res.status(404).json({ error: "ID Inválido." })
            return
        }

        const item = await prisma.itemLoja.findUnique({ where: { idItem: Number(id) } })

        if (!item) {
            res.status(404).json({ error: "Item não encontrado." })
            return
        }

        const atualizar = await prisma.itemLoja.update({
            where: { idItem: Number(id) },
            data: { ativo: !item.ativo }
        })

        await prisma.logAuditoria.create({
            data: {
                idUsuario: req.usuarioId!,
                acao: atualizar.ativo ? "ATIVAR_ITEM" : "DESATIVAR_ITEM",
                tabelaAfetada: "item_loja"
            }
        })

        res.status(200).json(atualizar)
    } catch (error) {
        res.status(400).json({ error: "Falha ao alterar status do item." })
        return
    }
}