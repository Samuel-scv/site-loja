import { useState } from "react"
import { useForm } from "react-hook-form"
import { api, mensagemErro } from "../lib/api"

const campo = "w-full border border-border rounded-lg p-2 text-text focus:outline-none focus:border-primary"

function Auth({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true)
    const [erro, setErro] = useState(null)
    const { register, handleSubmit, reset } = useForm({ defaultValues: { tipo: "clientes" } })

    async function onSubmit(data) {
        setErro(null)
        try {
            if (isLogin) {
                const res = await api.post("/auth/login", { email: data.email, senha: data.senha })
                onLogin(res.data.token)
            } else {
                // cadastro público: /clientes/criar ou /vendedores/criar
                await api.post(`/${data.tipo}/criar`, {
                    nome: data.nome,
                    email: data.email,
                    senha: data.senha
                })
                setIsLogin(true)
                reset()
            }
        } catch (err) {
            setErro(mensagemErro(err))
        }
    }

    return (
        <div className="max-w-sm mx-auto mt-16 bg-surface border border-border rounded-xl p-8">
            <h1 className="text-2xl font-bold text-text mb-6">{isLogin ? "Login" : "Cadastro"}</h1>

            {erro && <p className="mb-4 text-sm text-danger">{erro}</p>}

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                {!isLogin && (
                    <>
                        <input type="text" placeholder="Nome" className={campo} {...register("nome")} />
                        <select className={campo} {...register("tipo")}>
                            <option value="clientes">Quero comprar (cliente)</option>
                            <option value="vendedores">Quero vender (vendedor)</option>
                        </select>
                    </>
                )}
                <input type="email" placeholder="Email" className={campo} {...register("email")} />
                <input type="password" placeholder="Senha (mínimo 6 caracteres)" className={campo} {...register("senha")} />
                <button type="submit" className="w-full bg-accent hover:bg-accent-hover text-white rounded-lg p-2 transition-colors">
                    {isLogin ? "Login" : "Cadastrar"}
                </button>
            </form>
            <button
                className="mt-4 text-sm text-muted hover:text-primary underline"
                onClick={() => { setIsLogin(!isLogin); setErro(null) }}
            >
                {isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Faça login"}
            </button>
        </div>
    )
}

export default Auth
