-- CreateTable
CREATE TABLE "cliente" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "saldo_platinas" DECIMAL(10,2) NOT NULL,
    "saldo_creditos" DECIMAL(10,2) NOT NULL,
    "codigoRecuperacao" VARCHAR(4),
    "ultimoLogin" TIMESTAMP(3),

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendedor" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "saldo_platinas" DECIMAL(10,2) NOT NULL,
    "saldo_creditos" DECIMAL(10,2) NOT NULL,
    "codigoRecuperacao" VARCHAR(4),
    "ultimoLogin" TIMESTAMP(3),

    CONSTRAINT "vendedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "codigoRecuperacao" VARCHAR(4),
    "ultimoLogin" TIMESTAMP(3),

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categoria" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "foto" TEXT,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_categoria" INTEGER NOT NULL,

    CONSTRAINT "item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loja" (
    "id" SERIAL NOT NULL,
    "id_item" INTEGER NOT NULL,
    "id_vendedor" INTEGER NOT NULL,
    "preco_platina" DECIMAL(10,2) NOT NULL,
    "preco_credito" DECIMAL(10,2) NOT NULL,
    "estoque" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "loja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interacao" (
    "id" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_item" INTEGER NOT NULL,
    "pergunta" TEXT NOT NULL,
    "resposta" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario" (
    "id" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_item" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_vendas" (
    "id" SERIAL NOT NULL,
    "data_compra" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_comprador" INTEGER NOT NULL,
    "id_vendedor" INTEGER NOT NULL,
    "id_item" INTEGER NOT NULL,
    "valor_pago_platina" DECIMAL(10,2) NOT NULL,
    "valor_pago_credito" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "historico_vendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs" (
    "id" SERIAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "complemento" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_cliente" INTEGER,
    "id_vendedor" INTEGER,
    "id_admin" INTEGER,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cliente_uuid_key" ON "cliente"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_email_key" ON "cliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vendedor_uuid_key" ON "vendedor"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "vendedor_email_key" ON "vendedor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_uuid_key" ON "admin"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "admin_email_key" ON "admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categoria_nome_key" ON "categoria"("nome");

-- AddForeignKey
ALTER TABLE "item" ADD CONSTRAINT "item_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loja" ADD CONSTRAINT "loja_id_item_fkey" FOREIGN KEY ("id_item") REFERENCES "item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loja" ADD CONSTRAINT "loja_id_vendedor_fkey" FOREIGN KEY ("id_vendedor") REFERENCES "vendedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interacao" ADD CONSTRAINT "interacao_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interacao" ADD CONSTRAINT "interacao_id_item_fkey" FOREIGN KEY ("id_item") REFERENCES "item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario" ADD CONSTRAINT "inventario_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario" ADD CONSTRAINT "inventario_id_item_fkey" FOREIGN KEY ("id_item") REFERENCES "item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_vendas" ADD CONSTRAINT "historico_vendas_id_comprador_fkey" FOREIGN KEY ("id_comprador") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_vendas" ADD CONSTRAINT "historico_vendas_id_vendedor_fkey" FOREIGN KEY ("id_vendedor") REFERENCES "vendedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_vendas" ADD CONSTRAINT "historico_vendas_id_item_fkey" FOREIGN KEY ("id_item") REFERENCES "item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_id_vendedor_fkey" FOREIGN KEY ("id_vendedor") REFERENCES "vendedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_id_admin_fkey" FOREIGN KEY ("id_admin") REFERENCES "admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
