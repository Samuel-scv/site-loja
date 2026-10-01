import type { Response } from "express";
import { prisma } from "../../lib/prisma.js";
import type { AuthRequest } from "../middlewares/AuthMiddlewares.js";

export async function ObterDadosDashboard(req: AuthRequest, res: Response) {
    try {
        const totalClientes = await prisma.cliente.count();
        const totalVendedores = await prisma.vendedor.count();
        const totalVendas = await prisma.historicoVendas.count();
        const totalItens = await prisma.item.count();

        const faturamento = await prisma.historicoVendas.aggregate({
            _sum: {
                valor_pago_credito: true,
                valor_pago_platina: true
            }
        });

        const ultimasVendas = await prisma.historicoVendas.findMany({
            take: 5,
            orderBy: { data_compra: 'desc' },
            include: {
                comprador: { select: { nome: true } },
                item: { select: { nome: true } }
            }
        });

        res.status(200).json({
            totais: {
                clientes: totalClientes,
                vendedores: totalVendedores,
                vendas: totalVendas,
                itens: totalItens,
                faturamentoCredito: faturamento._sum.valor_pago_credito || 0,
                faturamentoPlatina: faturamento._sum.valor_pago_platina || 0
            },
            ultimasVendas
        });
    } catch (error) {
        res.status(400).json({ error: "Falha ao gerar dados do dashboard." });
    }
}