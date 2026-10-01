import axios from "axios"

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000"

export const api = axios.create({ baseURL })

// Envia o token de autenticação em todas as requisições, se existir
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

export function decodeToken(token) {
    try {
        const payloadBase64 = token.split(".")[1]
        const normalizado = payloadBase64.replace(/-/g, "+").replace(/_/g, "/")
        return JSON.parse(atob(normalizado))
    } catch {
        return null
    }
}

// Extrai a mensagem de erro da API ou retorna uma padrão
export function mensagemErro(err) {
    return err?.response?.data?.error ?? "Erro ao conectar com o servidor."
}