"use server";

import { PrismaClient, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// DEPARTMENTS
export async function getDepartments() {
  return await prisma.department.findMany({
    include: {
      parent: true,
      users: {
        where: { role: "DEPARTMENT_HEAD" }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function createDepartment(data: { name: string; parentDeptId?: string }) {
  const result = await prisma.department.create({
    data: {
      name: data.name,
      parentDeptId: data.parentDeptId || null,
    }
  });
  revalidatePath("/dashboard/organization");
  return result;
}

export async function toggleDepartmentStatus(id: string, isActive: boolean) {
  const result = await prisma.department.update({
    where: { id },
    data: { isActive }
  });
  revalidatePath("/dashboard/organization");
  return result;
}

// ASSET CATEGORIES
export async function getCategories() {
  return await prisma.assetCategory.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function createCategory(data: { name: string; description?: string }) {
  const result = await prisma.assetCategory.create({
    data
  });
  revalidatePath("/dashboard/organization");
  return result;
}

// EMPLOYEES
export async function getEmployees() {
  return await prisma.user.findMany({
    include: {
      department: true
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function createEmployee(data: { name: string; email: string; role: Role; departmentId?: string }) {
  const bcrypt = require("bcryptjs");
  const hashedPassword = await bcrypt.hash("password123", 10); // Default password

  const result = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      departmentId: data.departmentId || null,
    }
  });
  revalidatePath("/dashboard/organization");
  return result;
}

export async function updateEmployeeRole(userId: string, role: Role, departmentId?: string) {
  const result = await prisma.user.update({
    where: { id: userId },
    data: {
      role,
      departmentId: departmentId || null
    }
  });
  revalidatePath("/dashboard/organization");
  return result;
}

export async function toggleEmployeeStatus(id: string, isActive: boolean) {
  const result = await prisma.user.update({
    where: { id },
    data: { isActive }
  });
  revalidatePath("/dashboard/organization");
  return result;
}
