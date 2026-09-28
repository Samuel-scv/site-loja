import type { Response } from "express"
import { prisma } from "../../lib/prisma.js"
import type { AuthRequest } from "../middlewares/AuthMiddlewares.js"

// Erros de regra de negócio (saldo, estoque...) podem ser mostrados ao cliente.
// Qualquer outro erro (Prisma, banco) vira mensagem genérica, sem vazar detalhes.
class ErroNegocio extends Error {}

// Não existe mais Pedido/carrinho pendente no schema (virou HistoricoVendas,
// que já é o registro de uma venda concluída). Então a compra é direta:
// debita o cliente, credita o vendedor, registra no inventário e no histórico.
export async function ComprarItem(req: AuthRequest, res: Response) {
    try {
        const { id_loja, quantidade } = req.body

        if (!id_loja) {
            res.status(400).json({ error: "A listagem do item é obrigatória." })
            return
        }

        // quantidade tem que ser inteira e positiva (antes -5 passava e invertia o saldo)
        const qtd = Number(quantidade ?? 1)
        if (!Number.isInteger(qtd) || qtd <= 0) {
            res.status(400).json({ error: "Quantidade inválida." })
            return
        }

        const resultado = await prisma.$transaction(async (tx) => {
            const loja = await tx.loja.findUnique({ where: { id: Number(id_loja) } })

            if (!loja || !loja.ativo) {
                throw new ErroNegocio("Item indisponível para compra.")
            }

            const estoqueNum = Number(loja.estoque)
            const controlaEstoque = !Number.isNaN(estoqueNum)
            if (controlaEstoque && estoqueNum < qtd) {
                throw new ErroNegocio("Estoque insuficiente.")
            }

            const cliente = await tx.cliente.findUnique({ where: { id: req.userId! } })
            if (!cliente) {
                throw new ErroNegocio("Cliente não encontrado.")
            }

            const valorPlatina = Number(loja.preco_platina) * qtd
            const valorCredito = Number(loja.preco_credito) * qtd

            // a checagem de saldo é feita dentro do próprio UPDATE (atômico):
            // se duas compras rodarem ao mesmo tempo, só uma passa e o saldo nunca fica negativo
            const debito = await tx.cliente.updateMany({
                where: {
                    id: cliente.id,
                    saldo_platinas: { gte: valorPlatina },
                    saldo_creditos: { gte: valorCredito }
                },
                data: {
                    saldo_platinas: { decrement: valorPlatina },
                    saldo_creditos: { decrement: valorCredito }
                }
            })

            if (debito.count === 0) {
                throw new ErroNegocio("Saldo insuficiente para concluir a compra.")
            }

            await tx.vendedor.update({
                where: { id: loja.id_vendedor },
                data: {
                    saldo_platinas: { increment: valorPlatina },
                    saldo_creditos: { increment: valorCredito }
                }
            })

            if (controlaEstoque) {
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
    } catch (error) {
        console.error("Falha, ", error)
        if (error instanceof ErroNegocio) {
            res.status(400).json({ error: error.message })
            return
        }
        res.status(400).json({ error: "Falha ao realizar compra." })
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
