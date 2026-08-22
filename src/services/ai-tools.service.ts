import {
  calcularConsolidado,
  calcularVariacion,
} from "./consolidado.service.js";

import {
  calcularKpisDesdeDB,
} from "./db-kpi.service.js";

import {
  calcularTopProductosDesdeDB,
} from "./db-productos.service.js";

type Tienda =
  | "todas"
  | "carnemart"
  | "yalo"
  | "pastora";

type Periodo =
  | "hoy"
  | "ayer"
  | "semana"
  | "mes";

const ZONA_HORARIA =
  "America/Mexico_City";

function fechaMexico(): Date {
  return new Date(
    new Date().toLocaleString(
      "en-US",
      {
        timeZone: ZONA_HORARIA,
      }
    )
  );
}

function crearRangoDia(
  fecha: Date
) {
  return {
    inicio: new Date(
      fecha.getFullYear(),
      fecha.getMonth(),
      fecha.getDate(),
      0,
      0,
      0,
      0
    ),

    fin: new Date(
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

function crearRangoPeriodo(
  periodo: Periodo
) {
  const hoy =
    fechaMexico();

  if (periodo === "hoy") {
    return crearRangoDia(hoy);
  }

  if (periodo === "ayer") {
    const ayer =
      new Date(hoy);

    ayer.setDate(
      ayer.getDate() - 1
    );

    return crearRangoDia(
      ayer
    );
  }

  if (periodo === "semana") {
    const dia =
      hoy.getDay();

    const diasDesdeLunes =
      dia === 0
        ? 6
        : dia - 1;

    const inicio =
      new Date(hoy);

    inicio.setDate(
      hoy.getDate() -
      diasDesdeLunes
    );

    return {
      inicio:
        new Date(
          inicio.getFullYear(),
          inicio.getMonth(),
          inicio.getDate(),
          0,
          0,
          0,
          0
        ),

      fin:
        crearRangoDia(
          hoy
        ).fin,
    };
  }

  return {
    inicio:
      new Date(
        hoy.getFullYear(),
        hoy.getMonth(),
        1,
        0,
        0,
        0,
        0
      ),

    fin:
      crearRangoDia(
        hoy
      ).fin,
  };
}

export async function toolGetKpis(
  tienda: Tienda,
  periodo: Periodo
) {
  const {
    inicio,
    fin,
  } =
    crearRangoPeriodo(
      periodo
    );

  if (
    tienda === "todas"
  ) {
    return calcularConsolidado(
      inicio,
      fin
    );
  }

  return calcularKpisDesdeDB(
    tienda,
    inicio,
    fin
  );
}

export async function toolGetComparison(
  tienda: Tienda
) {
  const hoy =
    fechaMexico();

  const ayer =
    new Date(hoy);

  ayer.setDate(
    ayer.getDate() - 1
  );

  const rangoHoy =
    crearRangoDia(hoy);

  const rangoAyer =
    crearRangoDia(ayer);

  if (
    tienda === "todas"
  ) {
    const [
      resultadoHoy,
      resultadoAyer,
    ] =
      await Promise.all([
        calcularConsolidado(
          rangoHoy.inicio,
          rangoHoy.fin
        ),

        calcularConsolidado(
          rangoAyer.inicio,
          rangoAyer.fin
        ),
      ]);

    const hoyKpis =
      resultadoHoy.consolidado;

    const ayerKpis =
      resultadoAyer.consolidado;

    return {
      hoy:
        hoyKpis,

      ayer:
        ayerKpis,

      variaciones: {
        ventas:
          calcularVariacion(
            hoyKpis.ventas,
            ayerKpis.ventas
          ),

        pedidos:
          calcularVariacion(
            hoyKpis.pedidos_validos,
            ayerKpis.pedidos_validos
          ),

        ticket:
          calcularVariacion(
            hoyKpis.ticket_promedio,
            ayerKpis.ticket_promedio
          ),
      },
    };
  }

  const [
    hoyKpis,
    ayerKpis,
  ] =
    await Promise.all([
      calcularKpisDesdeDB(
        tienda,
        rangoHoy.inicio,
        rangoHoy.fin
      ),

      calcularKpisDesdeDB(
        tienda,
        rangoAyer.inicio,
        rangoAyer.fin
      ),
    ]);

  return {
    hoy:
      hoyKpis,

    ayer:
      ayerKpis,

    variaciones: {
      ventas:
        calcularVariacion(
          hoyKpis.ventas,
          ayerKpis.ventas
        ),

      pedidos:
        calcularVariacion(
          hoyKpis.pedidos_validos,
          ayerKpis.pedidos_validos
        ),

      ticket:
        calcularVariacion(
          hoyKpis.ticket_promedio,
          ayerKpis.ticket_promedio
        ),
    },
  };
}

export async function toolGetTopProducts(
  tienda: Tienda,
  periodo: Periodo
) {
  const {
    inicio,
    fin,
  } =
    crearRangoPeriodo(
      periodo
    );

  return calcularTopProductosDesdeDB(
    inicio,
    fin,
    5,
    tienda === "todas"
      ? undefined
      : tienda
  );
}