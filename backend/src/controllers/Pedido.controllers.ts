import type { Request, Response } from "express"
import { prisma } from "../../lib/prisma.js"

export async function CriarPedido(req: Request, res: Response) {
    try {
        const { idTenno, itens } = req.body

        if (!idTenno || !Array.isArray(itens) || itens.length === 0) {
            res.status(400).json({ error: "Tenno e ao menos um item são obrigatórios." })
            return
        }

        const pedido = await prisma.$transaction(async (tx) => {
            const tenno = await tx.tenno.findUnique({ where: { idTenno: Number(idTenno) } })
            if (!tenno) {
                throw new Error("Tenno não encontrado.")
            }

            const itensLoja = await tx.itemLoja.findMany({
                where: {
                    idItem: { in: itens.map((i: any) => Number(i.idItem)) },
                    ativo: true
                }
            })

            if (itensLoja.length !== itens.length) {
                throw new Error("Um ou mais itens são inválidos ou estão inativos.")
            }

            let totalPlatina = 0
            let totalCredito = 0
            const itensPedidoData = itens.map((i: any) => {
                const item = itensLoja.find((it) => it.idItem === Number(i.idItem))!
                const quantidade = Number(i.quantidade) || 1
                totalPlatina += item.precoPlatina * quantidade
                totalCredito += item.precoCredito * quantidade
                return {
                    idItem: item.idItem,
                    quantidade,
                    precoUnitario: item.precoPlatina > 0 ? item.precoPlatina : item.precoCredito
                }
            })

            if (tenno.saldoPlatinas < totalPlatina || tenno.saldoCreditos < totalCredito) {
                throw new Error("Saldo insuficiente para concluir o pedido.")
            }

            await tx.tenno.update({
                where: { idTenno: tenno.idTenno },
                data: {
                    saldoPlatinas: tenno.saldoPlatinas - totalPlatina,
                    saldoCreditos: tenno.saldoCreditos - totalCredito
                }
            })

            return tx.pedido.create({
                data: {
                    idTenno: tenno.idTenno,
                    status: "Pendente",
                    totalPlatina,
                    totalCredito,
                    itensPedido: { create: itensPedidoData }
                },
                include: { itensPedido: true }
            })
        })

        res.status(201).json(pedido)
    } catch (error: any) {
        console.error("Falha, ", error)
        res.status(400).json({ error: error.message || "Falha ao criar pedido." })
        return
    }
}

export async function ListarPedidos(req: Request, res: Response) {
    try {
        const listar = await prisma.pedido.findMany({
            include: {
                tenno: { select: { nickname: true } },
                itensPedido: { include: { item: true } }
            },
            orderBy: { dataPedido: 'desc' }
        })
        res.status(200).json(listar)
    } catch (error) {
        res.status(400).json({ error: "Falha ao listar pedidos." })
        return
    }
}

// Confirma o pedido e transfere os itens para o inventário do Tenno
export async function ConfirmarPedido(req: Request, res: Response) {
    try {
        const { id } = req.params

        if (!id) {
            res.status(404).json({ error: "ID Inválido." })
            return
        }

        const pedido = await prisma.$transaction(async (tx) => {
            const pedidoAtual = await tx.pedido.findUnique({
                where: { idPedido: Number(id) },
                include: { itensPedido: true }
            })

            if (!pedidoAtual) {
                throw new Error("Pedido não encontrado.")
            }

            if (pedidoAtual.status !== "Pendente") {
                throw new Error("Este pedido já foi processado.")
            }

            await tx.inventario.createMany({
                data: pedidoAtual.itensPedido.flatMap((ip) =>
                    Array.from({ length: ip.quantidade }, () => ({
                        idTenno: pedidoAtual.idTenno,
                        idItem: ip.idItem
                    }))
                )
            })

            return tx.pedido.update({
                where: { idPedido: Number(id) },
                data: { status: "Concluido" }
            })
        })

        res.status(200).json({ mensagem: "Pedido confirmado: ", pedido })
    } catch (error: any) {
        res.status(400).json({ error: error.message || "Falha ao confirmar pedido." })
        return
    }
}

// Cancela um pedido pendente e estorna o saldo do Tenno
export async function CancelarPedido(req: Request, res: Response) {
    try {
        const { id } = req.params

        if (!id) {
            res.status(404).json({ error: "ID Inválido." })
            return
        }

        const pedido = await prisma.$transaction(async (tx) => {
            const pedidoAtual = await tx.pedido.findUnique({ where: { idPedido: Number(id) } })

            if (!pedidoAtual) {
                throw new Error("Pedido não encontrado.")
            }

            if (pedidoAtual.status !== "Pendente") {
                throw new Error("Somente pedidos pendentes podem ser cancelados.")
            }

            await tx.tenno.update({
                where: { idTenno: pedidoAtual.idTenno },
                data: {
                    saldoPlatinas: { increment: pedidoAtual.totalPlatina },
                    saldoCreditos: { increment: pedidoAtual.totalCredito }
                }
            })

            return tx.pedido.update({
                where: { idPedido: Number(id) },
                data: { status: "Cancelado" }
            })
        })

        res.status(200).json({ mensagem: "Pedido cancelado: ", pedido })
    } catch (error: any) {
        res.status(400).json({ error: error.message || "Falha ao cancelar pedido." })
        return
    }
}