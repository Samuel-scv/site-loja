/*
  Warnings:

  - The primary key for the `categoria` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `descricao` on the `categoria` table. All the data in the column will be lost.
  - You are about to drop the column `idCategoria` on the `categoria` table. All the data in the column will be lost.
  - The primary key for the `inventario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dataAquisicao` on the `inventario` table. All the data in the column will be lost.
  - You are about to drop the column `idInventario` on the `inventario` table. All the data in the column will be lost.
  - You are about to drop the column `idItem` on the `inventario` table. All the data in the column will be lost.
  - You are about to drop the column `idTenno` on the `inventario` table. All the data in the column will be lost.
  - You are about to drop the `administrador` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `item_loja` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `item_pedido` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `log_auditoria` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pedido` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tenno` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[nome]` on the table `categoria` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `categoria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `inventario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_cliente` to the `inventario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_item` to the `inventario` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `inventario` DROP FOREIGN KEY `inventario_idItem_fkey`;

-- DropForeignKey
ALTER TABLE `inventario` DROP FOREIGN KEY `inventario_idTenno_fkey`;

-- DropForeignKey
ALTER TABLE `item_loja` DROP FOREIGN KEY `item_loja_idAdmin_fkey`;

-- DropForeignKey
ALTER TABLE `item_loja` DROP FOREIGN KEY `item_loja_idCategoria_fkey`;

-- DropForeignKey
ALTER TABLE `item_pedido` DROP FOREIGN KEY `item_pedido_idItem_fkey`;

-- DropForeignKey
ALTER TABLE `item_pedido` DROP FOREIGN KEY `item_pedido_idPedido_fkey`;

-- DropForeignKey
ALTER TABLE `log_auditoria` DROP FOREIGN KEY `log_auditoria_idAdmin_fkey`;

-- DropForeignKey
ALTER TABLE `pedido` DROP FOREIGN KEY `pedido_idTenno_fkey`;

-- DropIndex
DROP INDEX `inventario_idItem_fkey` ON `inventario`;

-- DropIndex
DROP INDEX `inventario_idTenno_fkey` ON `inventario`;

-- AlterTable
ALTER TABLE `categoria` DROP PRIMARY KEY,
    DROP COLUMN `descricao`,
    DROP COLUMN `idCategoria`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `inventario` DROP PRIMARY KEY,
    DROP COLUMN `dataAquisicao`,
    DROP COLUMN `idInventario`,
    DROP COLUMN `idItem`,
    DROP COLUMN `idTenno`,
    ADD COLUMN `data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `id_cliente` INTEGER NOT NULL,
    ADD COLUMN `id_item` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- DropTable
DROP TABLE `administrador`;

-- DropTable
DROP TABLE `item_loja`;

-- DropTable
DROP TABLE `item_pedido`;

-- DropTable
DROP TABLE `log_auditoria`;

-- DropTable
DROP TABLE `pedido`;

-- DropTable
DROP TABLE `tenno`;

-- CreateTable
CREATE TABLE `cliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `saldo_platinas` DECIMAL(10, 2) NOT NULL,
    `saldo_creditos` DECIMAL(10, 2) NOT NULL,
    `codigoRecuperacao` VARCHAR(4) NULL,
    `ultimoLogin` DATETIME(3) NULL,

    UNIQUE INDEX `cliente_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendedor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `saldo_platinas` DECIMAL(10, 2) NOT NULL,
    `saldo_creditos` DECIMAL(10, 2) NOT NULL,
    `codigoRecuperacao` VARCHAR(4) NULL,
    `ultimoLogin` DATETIME(3) NULL,

    UNIQUE INDEX `vendedor_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `codigoRecuperacao` VARCHAR(4) NULL,
    `ultimoLogin` DATETIME(3) NULL,

    UNIQUE INDEX `admin_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `id_categoria` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loja` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_item` INTEGER NOT NULL,
    `id_vendedor` INTEGER NOT NULL,
    `preco_platina` DECIMAL(10, 2) NOT NULL,
    `preco_credito` DECIMAL(10, 2) NOT NULL,
    `estoque` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historico_vendas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data_compra` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id_comprador` INTEGER NOT NULL,
    `id_vendedor` INTEGER NOT NULL,
    `id_item` INTEGER NOT NULL,
    `valor_pago_platina` DECIMAL(10, 2) NOT NULL,
    `valor_pago_credito` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `descricao` VARCHAR(191) NOT NULL,
    `complemento` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id_cliente` INTEGER NULL,
    `id_vendedor` INTEGER NULL,
    `id_admin` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `categoria_nome_key` ON `categoria`(`nome`);

-- AddForeignKey
ALTER TABLE `item` ADD CONSTRAINT `item_id_categoria_fkey` FOREIGN KEY (`id_categoria`) REFERENCES `categoria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loja` ADD CONSTRAINT `loja_id_item_fkey` FOREIGN KEY (`id_item`) REFERENCES `item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loja` ADD CONSTRAINT `loja_id_vendedor_fkey` FOREIGN KEY (`id_vendedor`) REFERENCES `vendedor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventario` ADD CONSTRAINT `inventario_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `cliente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventario` ADD CONSTRAINT `inventario_id_item_fkey` FOREIGN KEY (`id_item`) REFERENCES `item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historico_vendas` ADD CONSTRAINT `historico_vendas_id_comprador_fkey` FOREIGN KEY (`id_comprador`) REFERENCES `cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historico_vendas` ADD CONSTRAINT `historico_vendas_id_vendedor_fkey` FOREIGN KEY (`id_vendedor`) REFERENCES `vendedor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historico_vendas` ADD CONSTRAINT `historico_vendas_id_item_fkey` FOREIGN KEY (`id_item`) REFERENCES `item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logs` ADD CONSTRAINT `logs_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `cliente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logs` ADD CONSTRAINT `logs_id_vendedor_fkey` FOREIGN KEY (`id_vendedor`) REFERENCES `vendedor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logs` ADD CONSTRAINT `logs_id_admin_fkey` FOREIGN KEY (`id_admin`) REFERENCES `admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
