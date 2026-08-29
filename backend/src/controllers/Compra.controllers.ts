import type { Response } from "express"
import { prisma } from "../../lib/prisma.js"
import type { AuthRequest } from "../middlewares/AuthMiddlewares.js"

// Não existe mais Pedido/carrinho pendente no schema (virou HistoricoVendas,
// que já é o registro de uma venda concluída). Então a compra é direta:
// debita o cliente, credita o vendedor, registra no inventário e no histórico.
export async function ComprarItem(req: AuthRequest, res: Response) {
    try {
        const { id_loja, quantidade } = req.body
        const qtd = Number(quantidade) || 1

        if (!id_loja) {
            res.status(400).json({ error: "A listagem do item é obrigatória." })
            return
        }

        const resultado = await prisma.$transaction(async (tx) => {
            const loja = await tx.loja.findUnique({ where: { id: Number(id_loja) } })

            if (!loja || !loja.ativo) {
                throw new Error("Item indisponível para compra.")
            }

            const estoqueNum = Number(loja.estoque)
            if (!Number.isNaN(estoqueNum) && estoqueNum < qtd) {
                throw new Error("Estoque insuficiente.")
            }

            const cliente = await tx.cliente.findUnique({ where: { id: req.userId! } })
            if (!cliente) {
                throw new Error("Cliente não encontrado.")
            }

            const valorPlatina = Number(loja.preco_platina) * qtd
            const valorCredito = Number(loja.preco_credito) * qtd

            if (Number(cliente.saldo_platinas) < valorPlatina || Number(cliente.saldo_creditos) < valorCredito) {
                throw new Error("Saldo insuficiente para concluir a compra.")
            }

            await tx.cliente.update({
                where: { id: cliente.id },
                data: {
                    saldo_platinas: { decrement: valorPlatina },
                    saldo_creditos: { decrement: valorCredito }
                }
            })

            await tx.vendedor.update({
                where: { id: loja.id_vendedor },
                data: {
                    saldo_platinas: { increment: valorPlatina },
                    saldo_creditos: { increment: valorCredito }
                }
            })

            if (!Number.isNaN(estoqueNum)) {
                await tx.loja.update({
                    where: { id: loja.id },
                    data: { estoque: String(estoqueNum - qtd) }
                })
            }

            await tx.inventario.createMany({
                data: Array.from({ length: qtd }, () => ({
                    id_cliente: cliente.id,
                    id_item: loja.id_item
                }))
            })

            const venda = await tx.historicoVendas.create({
                data: {
                    id_comprador: cliente.id,
                    id_vendedor: loja.id_vendedor,
                    id_item: loja.id_item,
                    valor_pago_platina: valorPlatina,
                    valor_pago_credito: valorCredito
                }
            })

            await tx.log.create({
                data: {
                    id_cliente: cliente.id,
                    descricao: "COMPRA_ITEM",
                    complemento: `item ${loja.id_item}, quantidade ${qtd}`
                }
            })

            return venda
        })

        res.status(201).json({ mensagem: "Compra realizada com sucesso: ", resultado })
    } catch (error: any) {
        console.error("Falha, ", error)
        res.status(400).json({ error: error.message || "Falha ao realizar compra." })
        return
    }
}

export async function ListarHistorico(req: AuthRequest, res: Response) {
    try {
        let where = {}

        if (req.tipo === "CLIENTE") {
            where = { id_comprador: req.userId }
        } else if (req.tipo === "VENDEDOR") {
            where = { id_vendedor: req.userId }
        }
        // ADMIN vê tudo, sem filtro

        const listar = await prisma.historicoVendas.findMany({
            where,
            include: {
                comprador: { select: { nome: true } },
                vendedor: { select: { nome: true } },
                item: true
            },
            orderBy: { data_compra: 'desc' }
        })

        res.status(200).json(listar)
    } catch (error) {
        res.status(400).json({ error: "Falha ao listar histórico de vendas." })
        return
    }
}