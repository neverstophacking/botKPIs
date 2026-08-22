import {
  conciliarYRepararTienda,
} from "../services/reconciliation-repair.service.js";

import {
  prisma,
} from "../config/prisma.js";

const TIENDAS = [
  "carnemart",
  "yalo",
  "pastora",
];

function formatoFecha(
  fecha: Date
): string {
  const anio =
    fecha.getFullYear();

  const mes =
    String(
      fecha.getMonth() + 1
    ).padStart(2, "0");

  const dia =
    String(
      fecha.getDate()
    ).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function crearRangoDB(
  fechaInicio: Date,
  fechaFin: Date
) {
  return {
    inicio:
      new Date(
        fechaInicio.getFullYear(),
        fechaInicio.getMonth(),
        fechaInicio.getDate(),
        0,
        0,
        0,
        0
      ),

    fin:
      new Date(
        fechaFin.getFullYear(),
        fechaFin.getMonth(),
        fechaFin.getDate(),
        23,
        59,
        59,
        999
      ),
  };
}

async function main() {
  const argumentos =
    process.argv.slice(2);

  let fechaInicio =
    new Date();

  let fechaFin =
    new Date();

  if (
    argumentos[0] &&
    argumentos[1]
  ) {
    fechaInicio =
      new Date(
        `${argumentos[0]}T00:00:00`
      );

    fechaFin =
      new Date(
        `${argumentos[1]}T00:00:00`
      );
  }

  const desde =
    formatoFecha(
      fechaInicio
    );

  const hasta =
    formatoFecha(
      fechaFin
    );

  const rango =
    crearRangoDB(
      fechaInicio,
      fechaFin
    );

  console.log("");
  console.log(
    "===================================="
  );

  console.log(
    " CONCILIACION + AUTORREPARACION"
  );

  console.log(
    "===================================="
  );

  console.log(
    `Periodo: ${desde} a ${hasta}`
  );

  let todoCorrecto =
    true;

  for (
    const tienda of
    TIENDAS
  ) {
    console.log("");
    console.log(
      "------------------------------------"
    );

    console.log(
      tienda.toUpperCase()
    );

    console.log(
      "------------------------------------"
    );

    try {
      const resultado =
        await conciliarYRepararTienda(
          tienda,
          desde,
          hasta,
          rango.inicio,
          rango.fin
        );

      console.log(
        `Antes: ${
          resultado.antes.correcto
            ? "OK"
            : "DIFERENCIAS"
        }`
      );

      console.log(
        `Pedidos a reparar: ${resultado.reparaciones.length}`
      );

      for (
        const reparacion of
        resultado.reparaciones
      ) {
        console.log(
          `Pedido ${reparacion.wooOrderId}: ${
            reparacion.ok
              ? "REPARADO"
              : "ERROR"
          }`
        );

        if (
          reparacion.error
        ) {
          console.log(
            `  ${reparacion.error}`
          );
        }
      }

      console.log(
        `Después: ${
          resultado.despues.correcto
            ? "OK"
            : "DIFERENCIAS"
        }`
      );

      if (
        resultado.requiere_revision_manual
      ) {
        console.log("");
        console.log(
          "ATENCION:"
        );

        console.log(
          "Existen pedidos solamente en PostgreSQL."
        );

        console.log(
          "No serán eliminados automáticamente."
        );

        console.log(
          "Pedidos:"
        );

        for (
          const wooOrderId of
          resultado.despues.solo_en_db
        ) {
          console.log(
            `- ${wooOrderId}`
          );
        }
      }

      if (
        !resultado.despues.correcto
      ) {
        todoCorrecto =
          false;
      }

    } catch (error: any) {
      todoCorrecto =
        false;

      console.error(
        `ERROR en ${tienda}:`
      );

      console.error(
        error.response?.data ||
        error.message ||
        error
      );
    }
  }

  console.log("");
  console.log(
    "===================================="
  );

  console.log(
    todoCorrecto
      ? " TODAS LAS TIENDAS CORRECTAS"
      : " QUEDARON DIFERENCIAS"
  );

  console.log(
    "===================================="
  );

  if (
    !todoCorrecto
  ) {
    process.exitCode =
      1;
  }
}

main()
  .catch((error) => {
    console.error(
      "ERROR GENERAL:"
    );

    console.error(
      error
    );

    process.exitCode =
      1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });