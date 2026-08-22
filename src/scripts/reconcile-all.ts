import { conciliarTienda, } from "../services/reconciliation.service.js";
import { prisma, } from "../config/prisma.js";
import { guardarConciliacion, } from "../services/reconciliation-log.service.js";

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

function crearRangoDia(
  fecha: Date
) {
  return {
    inicio:
      new Date(
        fecha.getFullYear(),
        fecha.getMonth(),
        fecha.getDate(),
        0,
        0,
        0,
        0
      ),

    fin:
      new Date(
        fecha.getFullYear(),
        fecha.getMonth(),
        fecha.getDate(),
        23,
        59,
        59,
        999
      ),
  };
}

function simbolo(
  coincide: boolean
) {
  return coincide
    ? "OK"
    : "DIFERENCIA";
}

async function main() {
  const args =
    process.argv.slice(2);

  let fechaInicio:
    Date;

  let fechaFin:
    Date;

  if (
    args[0] &&
    args[1]
  ) {
    fechaInicio =
      new Date(
        `${args[0]}T00:00:00`
      );

    fechaFin =
      new Date(
        `${args[1]}T00:00:00`
      );
  } else {
    /**
     * Por defecto conciliamos hoy.
     */
    fechaInicio =
      new Date();

    fechaFin =
      new Date();
  }

  const fechaInicioTexto =
    formatoFecha(
      fechaInicio
    );

  const fechaFinTexto =
    formatoFecha(
      fechaFin
    );

  const rangoInicio =
    crearRangoDia(
      fechaInicio
    ).inicio;

  const rangoFin =
    crearRangoDia(
      fechaFin
    ).fin;

  console.log("");
  console.log(
    "================================"
  );
  console.log(
    " CONCILIACION WOO VS POSTGRESQL"
  );
  console.log(
    "================================"
  );

  console.log(
    `Periodo: ${fechaInicioTexto} a ${fechaFinTexto}`
  );

  let todasCorrectas =
    true;

  for (
    const tienda of
    TIENDAS
  ) {
    console.log("");
    console.log(
      "--------------------------------"
    );

    console.log(
      tienda.toUpperCase()
    );

    console.log(
      "--------------------------------"
    );

    try {
      const resultado =
        await conciliarTienda(
          tienda,
          fechaInicioTexto,
          fechaFinTexto,
          rangoInicio,
          rangoFin
        );

        await guardarConciliacion(
            resultado
        );

      if (
        !resultado.correcto
      ) {
        todasCorrectas =
          false;
      }

      for (
        const [
          nombre,
          dato,
        ] of
        Object.entries(
          resultado.comparacion
        )
      ) {
        console.log(
          `${nombre}: ${simbolo(
            dato.coincide
          )}`
        );

        console.log(
          `  Woo: ${dato.woo}`
        );

        console.log(
          `  DB:  ${dato.db}`
        );
      }

      console.log("");

      console.log(
        resultado.correcto
          ? "RESULTADO: OK"
          : "RESULTADO: DIFERENCIAS"
      );

    } catch (
      error: any
    ) {
      todasCorrectas =
        false;

      console.error(
        `ERROR conciliando ${tienda}:`
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
    "================================"
  );

  console.log(
    todasCorrectas
      ? " TODAS LAS TIENDAS COINCIDEN"
      : " EXISTEN DIFERENCIAS"
  );

  console.log(
    "================================"
  );

  /**
   * Si existen diferencias,
   * terminamos con código 1.
   *
   * Esto será útil posteriormente
   * para automatizaciones/monitoreo.
   */
  if (
    !todasCorrectas
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
  .finally(
    async () => {
      await prisma.$disconnect();
    }
  );