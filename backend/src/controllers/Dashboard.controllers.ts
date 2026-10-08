import type { Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { CATEGORIAS_COM_BUILD, filtroCategoriasBuild } from "../../lib/categoriasBuild.js";
import type { AuthRequest } from "../middlewares/AuthMiddlewares.js";

export async function ObterDadosDashboard(req: AuthRequest, res: Response) {
    try {
        const [
            totalClientes, totalVendedores, totalVendas, totalItens, totalInteracoes,
            interacoesPendentes, faturamento, ultimasVendas, categorias, vendasPorVendedor
        ] = await Promise.all([
            prisma.cliente.count(),
            prisma.vendedor.count(),
            prisma.historicoVendas.count(),
            prisma.item.count({ where: { categoria: filtroCategoriasBuild } }),
            prisma.interacao.count(),
            prisma.interacao.count({ where: { resposta: null } }),
            prisma.historicoVendas.aggregate({
                _sum: { valor_pago_credito: true, valor_pago_platina: true }
            }),
            prisma.historicoVendas.findMany({
                take: 5,
                orderBy: { data_compra: 'desc' },
                include: {
                    comprador: { select: { nome: true } },
                    item: { select: { nome: true } }
                }
            }),
            prisma.categoria.findMany({
                where: { nome: { in: CATEGORIAS_COM_BUILD } },
                select: { nome: true, _count: { select: { itens: true } } },
                orderBy: { nome: 'asc' }
            }),
            prisma.historicoVendas.groupBy({
                by: ['id_vendedor'],
                _count: { _all: true }
            })
        ]);

        const vendedores = await prisma.vendedor.findMany({
            where: { id: { in: vendasPorVendedor.map((v) => v.id_vendedor) } },
            select: { id: true, nome: true }
        });

        res.status(200).json({
            totais: {
                clientes: totalClientes,
                vendedores: totalVendedores,
                vendas: totalVendas,
                itens: totalItens,
                interacoes: totalInteracoes,
                interacoesPendentes,
                faturamentoCredito: faturamento._sum.valor_pago_credito || 0,
                faturamentoPlatina: faturamento._sum.valor_pago_platina || 0
            },
            // dados prontos para os gráficos de pizza/barras
            itensPorCategoria: categorias.map((c) => ({ categoria: c.nome, total: c._count.itens })),
            vendasPorVendedor: vendasPorVendedor.map((v) => ({
                vendedor: vendedores.find((x) => x.id === v.id_vendedor)?.nome ?? "Desconhecido",
                total: v._count._all
            })),
            ultimasVendas
        });
    } catch (error) {
        console.error("Falha, ", error);
        res.status(400).json({ error: "Falha ao gerar dados do dashboard." });
    }
}
