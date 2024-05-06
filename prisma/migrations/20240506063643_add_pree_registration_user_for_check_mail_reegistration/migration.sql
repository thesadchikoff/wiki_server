-- CreateTable
CREATE TABLE "pre_register_user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "verify_code" TEXT NOT NULL,
    "write_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "pre_register_user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pre_register_user_email_key" ON "pre_register_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pre_register_user_verify_code_key" ON "pre_register_user"("verify_code");
