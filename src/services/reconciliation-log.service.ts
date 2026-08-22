import { prisma } from "../config/prisma.js";

type DatosConciliacion = {
  tienda: string;

  periodo: {
    desde: string;
    hasta: string;
  };

  correcto: boolean;

  comparacion: Record<
    string,
    {
      woo: number;
      db: number;
      coincide: boolean;
    }
  >;
};

function fechaDesdeTexto(
  fecha: string
): Date {
  return new Date(
    `${fecha}T00:00:00`
  );
}

function fechaHastaTexto(
  fecha: string
): Date {
  return new Date(
    `${fecha}T23:59:59.999`
  );
}

export async function guardarConciliacion(
  resultado: DatosConciliacion
) {
  return prisma.reconciliationRun.create({
    data: {
      storeCode:
        resultado.tienda,

      dateFrom:
        fechaDesdeTexto(
          resultado.periodo.desde
        ),

      dateTo:
        fechaHastaTexto(
          resultado.periodo.hasta
        ),

      ok:
        resultado.correcto,

      details:
        resultado.comparacion,
    },
  });
}