import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(40),
  email: z.email("Ingresa un email valido.").trim().toLowerCase(),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres.").max(128),
});

export const loginSchema = z.object({
  email: z.email("Ingresa un email valido.").trim().toLowerCase(),
  password: z.string().min(1, "Ingresa tu contrasena."),
});

export const topicSchema = z.object({
  categoryId: z.string().min(1, "Selecciona una categoria."),
  title: z.string().trim().min(6, "El titulo debe tener al menos 6 caracteres.").max(120),
  body: z.string().trim().min(20, "El mensaje debe tener al menos 20 caracteres.").max(8000),
});

export const replySchema = z.object({
  topicId: z.string().min(1, "Falta el tema."),
  body: z.string().trim().min(4, "La respuesta es demasiado corta.").max(6000),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(40),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresa tu contrasena actual."),
    newPassword: z.string().min(8, "La nueva contrasena debe tener al menos 8 caracteres.").max(128),
    confirmPassword: z.string().min(8, "Confirma la nueva contrasena.").max(128),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Las contrasenas no coinciden.",
    path: ["confirmPassword"],
  });

export const searchSchema = z.object({
  q: z.string().trim().max(80).catch(""),
});

export const moderationSchema = z.object({
  id: z.string().min(1, "Falta el identificador."),
  reason: z.string().trim().max(180).optional(),
});

export const moveTopicSchema = z.object({
  id: z.string().min(1, "Falta el tema."),
  categoryId: z.string().min(1, "Falta la categoria."),
});

export const userRoleSchema = z.object({
  userId: z.string().min(1, "Falta el usuario."),
  role: z.enum(["MEMBER", "VIP", "VIP_PLUS", "ADMIN", "ADMIN_PLUS", "STAFF"]),
});

export const userStatusSchema = z.object({
  userId: z.string().min(1, "Falta el usuario."),
  reason: z.string().trim().max(180).optional(),
});

export const adminSearchSchema = z.object({
  userQ: z.string().trim().max(80).catch(""),
  userRole: z.enum(["", "MEMBER", "VIP", "VIP_PLUS", "ADMIN", "ADMIN_PLUS", "STAFF"]).catch(""),
  userPage: z.coerce.number().int().min(1).catch(1),
  topicQ: z.string().trim().max(80).catch(""),
  topicPage: z.coerce.number().int().min(1).catch(1),
});

export const categorySearchSchema = z.object({
  q: z.string().trim().max(80).catch(""),
  page: z.coerce.number().int().min(1).catch(1),
});

export function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}
