import axios from "axios"

const baseURL = import.meta.env.VITE_API_URL

export const api = axios({baseURL})

export function decodeToken(token) {
    try{
        const payloudBase64 = token.split(".")[1]
        const normalizdo = payloudBase64.replace(/-/g, "+").replace(/_/g,"/")
        return JSON.parse(atob(normalizdo))
    } catch {
        return null
    }
}