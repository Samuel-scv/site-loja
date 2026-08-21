-- CreateTable
CREATE TABLE `administrador` (
    `idAdmin` INTEGER NOT NULL AUTO_INCREMENT,
    `nomeAdmin` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senhaHash` VARCHAR(191) NOT NULL,
    `nivelAcesso` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `administrador_email_key`(`email`),
    PRIMARY KEY (`idAdmin`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `log_auditoria` (
    `idLog` INTEGER NOT NULL AUTO_INCREMENT,
    `idAdmin` INTEGER NOT NULL,
    `acao` VARCHAR(191) NOT NULL,
    `tabelaAfetada` VARCHAR(191) NOT NULL,
    `dataAcao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`idLog`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categoria` (
    `idCategoria` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,

    PRIMARY KEY (`idCategoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_loja` (
    `idItem` INTEGER NOT NULL AUTO_INCREMENT,
    `idCategoria` INTEGER NOT NULL,
    `idAdmin` INTEGER NOT NULL,
    `nomeItem` VARCHAR(191) NOT NULL,
    `precoPlatina` INTEGER NOT NULL DEFAULT 0,
    `precoCredito` INTEGER NOT NULL DEFAULT 0,
    `ativo` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`idItem`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tenno` (
    `idTenno` INTEGER NOT NULL AUTO_INCREMENT,
    `nickname` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `saldoPlatinas` INTEGER NOT NULL DEFAULT 0,
    `saldoCreditos` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `tenno_nickname_key`(`nickname`),
    UNIQUE INDEX `tenno_email_key`(`email`),
    PRIMARY KEY (`idTenno`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventario` (
    `idInventario` INTEGER NOT NULL AUTO_INCREMENT,
    `idTenno` INTEGER NOT NULL,
    `idItem` INTEGER NOT NULL,
    `dataAquisicao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`idInventario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pedido` (
    `idPedido` INTEGER NOT NULL AUTO_INCREMENT,
    `idTenno` INTEGER NOT NULL,
    `dataPedido` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL DEFAULT 'Pendente',
    `totalPlatina` INTEGER NOT NULL DEFAULT 0,
    `totalCredito` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`idPedido`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_pedido` (
    `idPedido` INTEGER NOT NULL,
    `idItem` INTEGER NOT NULL,
    `quantidade` INTEGER NOT NULL DEFAULT 1,
    `precoUnitario` INTEGER NOT NULL,

    PRIMARY KEY (`idPedido`, `idItem`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `log_auditoria` ADD CONSTRAINT `log_auditoria_idAdmin_fkey` FOREIGN KEY (`idAdmin`) REFERENCES `administrador`(`idAdmin`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_loja` ADD CONSTRAINT `item_loja_idCategoria_fkey` FOREIGN KEY (`idCategoria`) REFERENCES `categoria`(`idCategoria`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_loja` ADD CONSTRAINT `item_loja_idAdmin_fkey` FOREIGN KEY (`idAdmin`) REFERENCES `administrador`(`idAdmin`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventario` ADD CONSTRAINT `inventario_idTenno_fkey` FOREIGN KEY (`idTenno`) REFERENCES `tenno`(`idTenno`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventario` ADD CONSTRAINT `inventario_idItem_fkey` FOREIGN KEY (`idItem`) REFERENCES `item_loja`(`idItem`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedido` ADD CONSTRAINT `pedido_idTenno_fkey` FOREIGN KEY (`idTenno`) REFERENCES `tenno`(`idTenno`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_pedido` ADD CONSTRAINT `item_pedido_idPedido_fkey` FOREIGN KEY (`idPedido`) REFERENCES `pedido`(`idPedido`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_pedido` ADD CONSTRAINT `item_pedido_idItem_fkey` FOREIGN KEY (`idItem`) REFERENCES `item_loja`(`idItem`) ON DELETE RESTRICT ON UPDATE CASCADE;
