-- CreateTable
CREATE TABLE "admin" (
    "username" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "status" BOOLEAN,
    "create_time" TEXT,
    "expire_time" TEXT,
    "salt" TEXT,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("username")
);

-- CreateTable
CREATE TABLE "faculty" (
    "username" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "status" BOOLEAN,
    "create_time" TEXT,
    "expire_time" TEXT,
    "salt" TEXT,

    CONSTRAINT "faculty_pkey" PRIMARY KEY ("username")
);

-- CreateTable
CREATE TABLE "instance" (
    "vmid" TEXT NOT NULL,
    "ownerid" TEXT,
    "node" TEXT,
    "name" TEXT,
    "is_template" BOOLEAN,
    "max_cpu" DECIMAL,
    "max_ram" DECIMAL,
    "max_disk" DECIMAL,
    "create_time" TEXT,
    "expire_time" TEXT,

    CONSTRAINT "instance_pkey" PRIMARY KEY ("vmid")
);

-- CreateTable
CREATE TABLE "instance_limit" (
    "username" TEXT NOT NULL,
    "max_cpu" DECIMAL,
    "max_ram" DECIMAL,
    "max_disk" DECIMAL,
    "max_instance" BIGINT,

    CONSTRAINT "instance_limit_pkey" PRIMARY KEY ("username")
);

-- CreateTable
CREATE TABLE "pool" (
    "id" BIGSERIAL NOT NULL,
    "owner" TEXT,
    "code" TEXT,
    "name" TEXT,
    "vmid" TEXT[],
    "member" TEXT[],
    "create_time" TEXT,
    "expire_time" TEXT,

    CONSTRAINT "pool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sizing" (
    "vmid" TEXT NOT NULL,
    "node" TEXT,
    "name" TEXT,
    "max_cpu" DECIMAL,
    "max_ram" DECIMAL,
    "max_disk" DECIMAL,
    "create_time" TEXT,

    CONSTRAINT "sizing_pkey" PRIMARY KEY ("vmid")
);

-- CreateTable
CREATE TABLE "student" (
    "username" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "status" BOOLEAN,
    "create_time" TEXT,
    "expire_time" TEXT,
    "salt" TEXT,

    CONSTRAINT "student_pkey" PRIMARY KEY ("username")
);
