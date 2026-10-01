import axios from "axios"

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000"

export const api = axios.create({ baseURL })

// manda o token em toda requisição, se existir
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

// pega a mensagem de erro do back (ou uma padrão se o servidor não responder)
export function mensagemErro(err) {
    return err?.response?.data?.error ?? "erro ao conectar com o servidor"
}
