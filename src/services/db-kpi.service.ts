import { prisma } from "../config/prisma.js";

const ESTADOS_VALIDOS = [
  "processing",
  "completed",
];

export async function calcularKpisDesdeDB(
  codigoTienda: string,
  fechaInicio: Date,
  fechaFin: Date
) {
  const tienda = await prisma.store.findUnique({
    where: {
      code: codigoTienda,
    },
  });

  if (!tienda) {
    throw new Error(
      `La tienda "${codigoTienda}" no existe en PostgreSQL.`
    );
  }

  // Todos los pedidos del periodo
  const pedidosEncontrados =
    await prisma.order.count({
      where: {
        storeId: tienda.id,

        dateCreated: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
    });

  // Solamente processing y completed
  const pedidosValidos =
    await prisma.order.findMany({
      where: {
        storeId: tienda.id,

        status: {
          in: ESTADOS_VALIDOS,
        },

        dateCreated: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },

      include: {
        items: true,
      },
    });

  let ventas = 0;
  let cantidadVendida = 0;

  for (const pedido of pedidosValidos) {
    ventas += Number(pedido.total);

    for (const item of pedido.items) {
      cantidadVendida += Number(
        item.quantity
      );
    }
  }

  const cantidadPedidosValidos =
    pedidosValidos.length;

  const ticketPromedio =
    cantidadPedidosValidos > 0
      ? ventas / cantidadPedidosValidos
      : 0;

  return {
    pedidos_encontrados:
      pedidosEncontrados,

    pedidos_validos:
      cantidadPedidosValidos,

    ventas:
      Number(ventas.toFixed(2)),

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