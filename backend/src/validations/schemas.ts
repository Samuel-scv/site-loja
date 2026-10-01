import { z } from "zod"

// Zod só VALIDA o formato do que chega (body, params, query).
// Quem AUTORIZA (quem pode fazer o quê) continua sendo o token JWT + VerificarTipo.

const idPositivo = z.coerce.number().int().positive()
const naoNegativo = z.coerce.number().min(0)

export const idParamSchema = z.object({ id: idPositivo })

export const pesquisaSchema = z.object({ nome: z.string().min(1) })

export const loginSchema = z.object({
    email: z.string().email("Email inválido."),
    senha: z.string().min(1, "Senha obrigatória.")
})

// usado em cadastro de cliente, vendedor e admin
export const cadastroSchema = z.object({
    nome: z.string().trim().min(2, "Nome muito curto."),
    email: z.string().trim().email("Email inválido."),
    senha: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres.")
})

export const recargaSchema = z.object({
    platina: naoNegativo.optional(),
    credito: naoNegativo.optional()
}).refine((d) => (d.platina ?? 0) > 0 || (d.credito ?? 0) > 0, {
    message: "Informe ao menos um valor positivo para recarregar."
})

export const compraSchema = z.object({
    id_loja: idPositivo,
    quantidade: idPositivo.default(1)
})

export const criarListagemSchema = z.object({
    id_item: idPositivo,
    preco_platina: naoNegativo.default(0),
    preco_credito: naoNegativo.default(0),
    estoque: z.coerce.number().int().min(0)
})

export const atualizarListagemSchema = z.object({
    preco_platina: naoNegativo.optional(),
    preco_credito: naoNegativo.optional(),
    estoque: z.coerce.number().int().min(0).optional()
}).refine((d) => Object.values(d).some((v) => v !== undefined), {
    message: "Informe ao menos um campo para atualizar."
})

export const categoriaSchema = z.object({
    nome: z.string().trim().min(1, "O nome da categoria é obrigatório.")
})

export const criarItemSchema = z.object({
    id_categoria: idPositivo,
    nome: z.string().trim().min(1, "O nome do item é obrigatório.")
})

export const atualizarItemSchema = z.object({
    nome: z.string().trim().min(1).optional(),
    id_categoria: idPositivo.optional()
})
