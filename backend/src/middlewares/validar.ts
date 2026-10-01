import type { NextFunction, Request, Response } from "express"
import type { ZodType } from "zod"

type Onde = "body" | "params" | "query"

// Uso: router.post("/criar", validar(compraSchema), ComprarItem)
// Se os dados forem inválidos, responde 400 com a lista de problemas
// e a controller nem chega a rodar.
export function validar(schema: ZodType, onde: Onde = "body") {
    return (req: Request, res: Response, next: NextFunction) => {
        const resultado = schema.safeParse(req[onde])

        if (!resultado.success) {
            res.status(400).json({
                error: "Dados inválidos.",
                detalhes: resultado.error.issues.map((i) => ({
                    campo: i.path.join("."),
                    mensagem: i.message
                }))
            })
            return
        }

        // no body, troca pelos dados já convertidos (ex.: "5" vira 5)
        if (onde === "body") req.body = resultado.data
        next()
    }
}
