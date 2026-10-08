import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";
import { buscarDadosComGemini, erroDeCota, iaConfigurada } from "../services/iaServices.js";
import { filtroCategoriasBuild, podeTerBuild } from "../../lib/categoriasBuild.js";

type ResultadoIA =
    | { ok: true; item: { dadosIA: Prisma.JsonValue; dadosIAEm: Date | null } }
    | { ok: false; motivo: "cota" | "erro" | "naoEncontrado" };

// Consulta a IA e salva no banco. Diz o motivo quando não consegue.
async function gerarEGuardarDadosIA(id: number, esperas?: number[]): Promise<ResultadoIA> {
    const item = await prisma.item.findUnique({ where: { id }, include: { categoria: true } });
    if (!item || !podeTerBuild(item.categoria.nome)) return { ok: false, motivo: "naoEncontrado" };

    try {
        const dados = await buscarDadosComGemini(item.nome, item.categoria.nome, esperas);
        const atualizado = await prisma.item.update({
            where: { id },
            data: { dadosIA: dados as unknown as Prisma.InputJsonValue, dadosIAEm: new Date() }
        });
        return { ok: true, item: atualizado };
    } catch (erroIA: any) {
        console.log("Falha ao consultar o Gemini:", erroIA?.message);
        return { ok: false, motivo: erroDeCota(erroIA) ? "cota" : "erro" };
    }
}

export async function ListarItens(req: Request, res: Response) {
    try {
        const listar = await prisma.item.findMany({
            where: { categoria: filtroCategoriasBuild },
            include: { categoria: true },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(listar);
    } catch (error) {
        res.status(400).json({ error: "Falha ao listar itens." });
    }
}

export async function CriarItem(req: Request, res: Response) {
    try {
        const { id_categoria, nome, descricao, foto, destaque } = req.body;

        if (!id_categoria || !nome) {
            res.status(400).json({ error: "Categoria e nome são obrigatórios." });
            return;
        }

        const categoria = await prisma.categoria.findUnique({ where: { id: Number(id_categoria) } });
        if (!categoria || !podeTerBuild(categoria.nome)) {
            res.status(400).json({ error: "Só são aceitos itens que possuem build (Warframes, armas e companheiros)." });
            return;
        }

        const criar = await prisma.item.create({
            data: {
                id_categoria: Number(id_categoria),
                nome,
                descricao: descricao || null,
                foto: foto || null,
                destaque: destaque === true || destaque === "true"
            }
        });

        res.status(201).json(criar);
    } catch (error) {
        res.status(400).json({ error: "Falha ao criar item." });
    }
}

export async function AtualizarItem(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { nome, descricao, foto, destaque, id_categoria } = req.body;

        if (id_categoria) {
            const categoria = await prisma.categoria.findUnique({ where: { id: Number(id_categoria) } });
            if (!categoria || !podeTerBuild(categoria.nome)) {
                res.status(400).json({ error: "Só são aceitos itens que possuem build (Warframes, armas e companheiros)." });
                return;
            }
        }

        const atualizar = await prisma.item.update({
            where: { id: Number(id) },
            data: {
                nome,
                descricao,
                foto,
                destaque: destaque !== undefined ? (destaque === true || destaque === "true") : undefined,
                id_categoria: id_categoria ? Number(id_categoria) : undefined
            }
        });

        res.status(200).json({ mensagem: "Item atualizado: ", atualizar });
    } catch (error: any) {
        if (error?.code === 'P2025') {
            res.status(404).json({ error: "Item não encontrado." });
            return;
        }
        res.status(400).json({ error: "Falha ao atualizar item." });
    }
}

export async function DeletarItem(req: Request, res: Response) {
    try {
        const { id } = req.params;

        const deletar = await prisma.item.delete({ where: { id: Number(id) } });
        res.status(200).json({ mensagem: "Item deletado com sucesso.", deletar });
    } catch (error) {
        res.status(400).json({ error: "Falha ao deletar item. Verifique dependências." });
    }
}

export async function PesquisarItem(req: Request, res: Response) {
    try {
        const { nome } = req.query

        if (!nome || typeof nome !== 'string') {
            res.status(400).json({ error: "Parametro de pesquisa inválido." })
            return
        }

        // procura no nome, na descrição e no nome da categoria (sem diferenciar maiúsculas)
        const resultados = await prisma.item.findMany({
            where: {
                categoria: filtroCategoriasBuild,
                OR: [
                    { nome: { contains: nome, mode: 'insensitive' } },
                    { descricao: { contains: nome, mode: 'insensitive' } },
                    { categoria: { nome: { contains: nome, mode: 'insensitive' } } }
                ]
            },
            include: { categoria: true },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json(resultados);
    } catch (error) {
        res.status(400).json({ error: "Falha ao realizar a pesquisa." });
    }
}

// botão "Exibir Destaques" (destaque = true)
export async function ListarDestaques(req: Request, res: Response) {
    try {
        const listar = await prisma.item.findMany({
            where: { destaque: true, categoria: filtroCategoriasBuild },
            include: { categoria: true },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(listar);
    } catch (error) {
        res.status(400).json({ error: "Falha ao listar destaques." });
    }
}

// últimos cadastrados
export async function ListarRecentes(req: Request, res: Response) {
    try {
        const listar = await prisma.item.findMany({
            where: { categoria: filtroCategoriasBuild },
            include: { categoria: true },
            orderBy: { createdAt: 'desc' },
            take: 8
        });
        res.status(200).json(listar);
    } catch (error) {
        res.status(400).json({ error: "Falha ao listar itens recentes." });
    }
}

// detalhes de um item (tela "Ver Detalhes"), com as ofertas ativas na loja
export async function BuscarItem(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({ error: "ID Inválido." });
            return;
        }

        const item = await prisma.item.findUnique({
            where: { id },
            include: {
                categoria: true,
                loja: {
                    where: { ativo: true },
                    include: { vendedor: { select: { id: true, nome: true } } }
                }
            }
        });

        if (!item || !podeTerBuild(item.categoria.nome)) {
            res.status(404).json({ error: "Item não encontrado." });
            return;
        }

        res.status(200).json(item);
    } catch (error) {
        res.status(400).json({ error: "Falha ao buscar item." });
    }
}


// ADMIN: gera (ou gera de novo) os dados de IA de um item
export async function GerarDadosIA(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({ error: "ID Inválido." });
            return;
        }

        if (!iaConfigurada()) {
            res.status(503).json({ error: "IA não configurada (GEMINI_API_KEY ausente)." });
            return;
        }

        const resultado = await gerarEGuardarDadosIA(id);

        if (!resultado.ok) {
            if (resultado.motivo === "cota") {
                res.status(429).json({ error: "Limite diário da IA atingido. Tente mais tarde ou troque o modelo (GEMINI_MODEL)." });
            } else {
                res.status(502).json({ error: "Não foi possível obter os dados da IA agora." });
            }
            return;
        }

        res.status(200).json(resultado.item);
    } catch (error) {
        res.status(400).json({ error: "Falha ao gerar dados da IA." });
    }
}


// pedidos em andamento, para dois acessos ao mesmo item não consultarem a IA duas vezes
const consultasEmAndamento = new Map<number, Promise<ResultadoIA>>();

// Dados de IA de um item (público). A tela de detalhes chama esta rota depois de mostrar o item,
// então a IA nunca trava a tela. Se já estiver no banco devolve na hora; senão consulta e salva.
export async function ObterDadosIA(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({ error: "ID Inválido." });
            return;
        }

        const item = await prisma.item.findUnique({ where: { id }, include: { categoria: true } });

        if (!item || !podeTerBuild(item.categoria.nome)) {
            res.status(404).json({ error: "Item não encontrado." });
            return;
        }

        if (item.dadosIA || !iaConfigurada()) {
            res.status(200).json({ dadosIA: item.dadosIA ?? null });
            return;
        }

        let consulta = consultasEmAndamento.get(id);
        if (!consulta) {
            consulta = gerarEGuardarDadosIA(id, [3000]).finally(() => consultasEmAndamento.delete(id));
            consultasEmAndamento.set(id, consulta);
        }

        const resultado = await consulta;
        // se a IA falhou agora, devolve null com o motivo: a tela segue normal e o usuário pode tentar de novo
        if (!resultado.ok) {
            res.status(200).json({ dadosIA: null, motivo: resultado.motivo });
            return;
        }
        res.status(200).json({ dadosIA: resultado.item.dadosIA });
    } catch (error) {
        res.status(400).json({ error: "Falha ao obter dados da IA." });
    }
}
