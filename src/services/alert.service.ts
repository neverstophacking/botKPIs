import {
  prisma,
} from "../config/prisma.js";

type CrearAlertaInput = {
  type: string;

  severity:
    | "warning"
    | "error"
    | "critical";

  storeCode?: string;

  message: string;

  details?: unknown;
};

/**
 * Evita generar una alerta idéntica
 * cada hora mientras el problema
 * todavía sigue abierto.
 */
export async function crearAlertaSiNoExiste(
  datos: CrearAlertaInput
) {
  const existente =
    await prisma.systemAlert.findFirst({
      where: {
        type:
          datos.type,

        storeCode:
          datos.storeCode ??
          null,

        resolved:
          false,
      },

      orderBy: {
        createdAt:
          "desc",
      },
    });

  if (existente) {
    return existente;
  }

  return prisma.systemAlert.create({
    data: {
      type:
        datos.type,

      severity:
        datos.severity,

      storeCode:
        datos.storeCode ??
        null,

      message:
        datos.message,

      details:
        datos.details
          ? (
              datos.details as any
            )
          : undefined,
    },
  });
}

export async function resolverAlerta(
  id: number
) {
  return prisma.systemAlert.update({
    where: {
      id,
    },

    data: {
      resolved:
        true,

      resolvedAt:
        new Date(),
    },
  });
}