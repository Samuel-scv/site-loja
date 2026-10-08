// Lê uma imagem escolhida no computador, reduz para no máximo 640 px de largura
// e devolve como texto (data URL em JPEG). Assim a foto fica leve e é guardada
// direto na coluna "foto" do item, sem precisar de serviço externo de imagens.
export function imagemParaTexto(arquivo, larguraMax = 640, qualidade = 0.75) {
    return new Promise((resolve, reject) => {
        if (!arquivo.type.startsWith("image/")) {
            reject(new Error("O arquivo escolhido não é uma imagem."))
            return
        }

        const leitor = new FileReader()
        leitor.onerror = () => reject(new Error("Não foi possível ler a imagem."))
        leitor.onload = () => {
            const img = new Image()
            img.onerror = () => reject(new Error("Imagem inválida."))
            img.onload = () => {
                const escala = Math.min(1, larguraMax / img.width)
                const canvas = document.createElement("canvas")
                canvas.width = Math.round(img.width * escala)
                canvas.height = Math.round(img.height * escala)
                const ctx = canvas.getContext("2d")
                ctx.fillStyle = "#ffffff" // fundo branco para PNG com transparência
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
                resolve(canvas.toDataURL("image/jpeg", qualidade))
            }
            img.src = leitor.result
        }
        leitor.readAsDataURL(arquivo)
    })
}
