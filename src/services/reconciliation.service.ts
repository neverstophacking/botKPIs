import { obtenerPedidosPorRango, } from "./woocommerce.service.js";
import { calcularKpisDesdeDB, } from "./db-kpi.service.js";

type ResultadoKpis = {
  pedidos_encontrados: number;
  pedidos_validos: number;
  ventas: number;
  cantidad_vendida: number;
  ticket_promedio: number;
};

const ESTADOS_VALIDOS = [
  "processing",
  "completed",
];

function casiIguales(
  a: number,
  b: number,
  tolerancia = 0.01
): boolean {
  return Math.abs(a - b) <= tolerancia;
}

function calcularKpisWoo(
  pedidos: any[]
): ResultadoKpis {
  const pedidosValidos =
    pedidos.filter((pedido) =>
      ESTADOS_VALIDOS.includes(
        pedido.status
      )
    );

  let ventas = 0;
  let cantidadVendida = 0;

  for (const pedido of pedidosValidos) {
    ventas += Number(
      pedido.total ?? 0
    );

    for (
      const item of
      pedido.line_items ?? []
    ) {
      cantidadVendida += Number(
        item.quantity ?? 0
      );
    }
  }

  const totalPedidosValidos =
    pedidosValidos.length;

  const ticketPromedio =
    totalPedidosValidos > 0
      ? ventas /
        totalPedidosValidos
      : 0;

  return {
    pedidos_encontrados:
      pedidos.length,

    pedidos_validos:
      totalPedidosValidos,

    ventas:
      Number(
        ventas.toFixed(2)
      ),

    cantidad_vendida:
      Number(
        cantidadVendida.toFixed(3)
      ),

    ticket_promedio:
      Number(
        ticketPromedio.toFixed(2)
      ),
  };
}

export async function conciliarTienda(
  codigoTienda: string,
  fechaInicioTexto: string,
  fechaFinTexto: string,
  fechaInicioDB: Date,
  fechaFinDB: Date
) {
  const pedidosWoo =
    await obtenerPedidosPorRango(
      codigoTienda,
      fechaInicioTexto,
      fechaFinTexto
    );

  const woo =
    calcularKpisWoo(
      pedidosWoo
    );

  const db =
    await calcularKpisDesdeDB(
      codigoTienda,
      fechaInicioDB,
      fechaFinDB
    );

  const comparacion = {
    pedidos_encontrados: {
      woo:
        woo.pedidos_encontrados,

      db:
        db.pedidos_encontrados,

      coincide:
        woo.pedidos_encontrados ===
        db.pedidos_encontrados,
    },

    pedidos_validos: {
      woo:
        woo.pedidos_validos,

      db:
        db.pedidos_validos,

      coincide:
        woo.pedidos_validos ===
        db.pedidos_validos,
    },

    ventas: {
      woo:
        woo.ventas,

      db:
        db.ventas,

      coincide:
        casiIguales(
          woo.ventas,
          db.ventas
        ),
    },

    cantidad_vendida: {
      woo:
        woo.cantidad_vendida,

      db:
        db.cantidad_vendida,

      coincide:
        casiIguales(
          woo.cantidad_vendida,
          db.cantidad_vendida,
          0.001
        ),
    },

    ticket_promedio: {
      woo:
        woo.ticket_promedio,

      db:
        db.ticket_promedio,

      coincide:
        casiIguales(
          woo.ticket_promedio,
          db.ticket_promedio
        ),
    },
  };

  const correcto =
    Object.values(
      comparacion
    ).every(
      (item) =>
        item.coincide
    );

  return {
    tienda:
      codigoTienda,

    periodo: {
      desde:
        fechaInicioTexto,

      hasta:
        fechaFinTexto,
    },

    correcto,

    comparacion,
  };
}