import type { Response } from "express";
import { prisma } from "../../lib/prisma.js";
import type { AuthRequest } from "../middlewares/AuthMiddlewares.js";

export async function CriarInteracao(req: AuthRequest, res: Response) {
    try {
        const { id_item, pergunta } = req.body;

        if (!id_item || !pergunta) {
            res.status(400).json({ error: "Item e pergunta são obrigatórios." });
            return;
        }

        const item = await prisma.item.findUnique({ where: { id: Number(id_item) } });
        if (!item) {
            res.status(404).json({ error: "Item não encontrado." });
            return;
        }

        const interacao = await prisma.interacao.create({
            data: {
                id_cliente: req.userId!,
                id_item: Number(id_item),
                pergunta
            }
        });

        res.status(201).json(interacao);
    } catch (error) {
        res.status(400).json({ error: "Falha ao enviar pergunta." });
    }
}

export async function MinhasInteracoes(req: AuthRequest, res: Response) {
    try {
        const interacoes = await prisma.interacao.findMany({
            where: { id_cliente: req.userId! },
            include: { item: { select: { nome: true, foto: true } } },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json(interacoes);
    } catch (error) {
        res.status(400).json({ error: "Falha ao carregar suas interações." });
    }
}

// VENDEDOR: perguntas feitas pelos clientes sobre os itens que ele tem à venda
export async function InteracoesDoVendedor(req: AuthRequest, res: Response) {
    try {
        const interacoes = await prisma.interacao.findMany({
            where: {
                item: { loja: { some: { id_vendedor: req.userId! } } }
            },
            select: {
                id: true,
                pergunta: true,
                resposta: true,
                createdAt: true,
                cliente: { select: { nome: true } },
                item: { select: { id: true, nome: true, foto: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json(interacoes);
    } catch (error) {
        res.status(400).json({ error: "Falha ao carregar as perguntas dos seus itens." });
    }
}

// VENDEDOR: responde uma pergunta feita sobre um item que ele tem à venda
export async function ResponderInteracaoDoVendedor(req: AuthRequest, res: Response) {
    try {
        const id = Number(req.params.id);
        const resposta = typeof req.body.resposta === "string" ? req.body.resposta.trim() : "";

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({ error: "ID inválido." });
            return;
        }

        if (!resposta) {
            res.status(400).json({ error: "A resposta não pode ser vazia." });
            return;
        }

        // só pode responder perguntas de itens que ele mesmo vende
        const interacao = await prisma.interacao.findFirst({
            where: { id, item: { loja: { some: { id_vendedor: req.userId! } } } }
        });

        if (!interacao) {
            res.status(404).json({ error: "Pergunta não encontrada para os seus itens." });
            return;
        }

        const atualizada = await prisma.interacao.update({
            where: { id },
            data: { resposta }
        });

        res.status(200).json(atualizada);
    } catch (error) {
        res.status(400).json({ error: "Falha ao responder pergunta." });
    }
}

export async function ListarTodasInteracoes(req: AuthRequest, res: Response) {
    try {
        const interacoes = await prisma.interacao.findMany({
            include: {
                cliente: { select: { nome: true, email: true } },
                item: { select: { nome: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json(interacoes);
    } catch (error) {
        res.status(400).json({ error: "Falha ao listar interações." });
    }
}

export async function ResponderInteracao(req: AuthRequest, res: Response) {
    try {
        const { id } = req.params;
        const { resposta } = req.body;

        if (!resposta) {
            res.status(400).json({ error: "A resposta não pode ser vazia." });
            return;
        }

        const atualizada = await prisma.interacao.update({
            where: { id: Number(id) },
            data: { resposta }
        });

        res.status(200).json(atualizada);
    } catch (error: any) {
        if (error?.code === 'P2025') {
            res.status(404).json({ error: "Interação não encontrada." });
            return;
        }
        res.status(400).json({ error: "Falha ao responder pergunta." });
    }
}

export async function DeletarInteracao(req: AuthRequest, res: Response) {
    try {
        const { id } = req.params;

        await prisma.interacao.delete({ where: { id: Number(id) } });
        res.status(200).json({ mensagem: "Interação excluída com sucesso." });
    } catch (error: any) {
        if (error?.code === 'P2025') {
            res.status(404).json({ error: "Interação não encontrada." });
            return;
        }
        res.status(400).json({ error: "Falha ao excluir interação." });
    }
}