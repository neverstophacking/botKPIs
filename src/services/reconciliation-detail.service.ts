import {
  obtenerPedidosPorRango,
} from "./woocommerce.service.js";

import {
  prisma,
} from "../config/prisma.js";

type PedidoWoo = {
  id: number;
  status: string;
  total: string | number;
  line_items?: Array<{
    quantity?: number | string;
  }>;
};

function cantidadWoo(
  pedido: PedidoWoo
): number {
  let total = 0;

  for (
    const item of
    pedido.line_items ?? []
  ) {
    total += Number(
      item.quantity ?? 0
    );
  }

  return Number(
    total.toFixed(3)
  );
}

function casiIguales(
  a: number,
  b: number,
  tolerancia = 0.01
): boolean {
  return Math.abs(
    a - b
  ) <= tolerancia;
}

export async function conciliarPedidosDetallado(
  codigoTienda: string,
  fechaInicioTexto: string,
  fechaFinTexto: string,
  fechaInicioDB: Date,
  fechaFinDB: Date
) {
  /**
   * =================================
   * PEDIDOS DESDE WOOCOMMERCE
   * =================================
   */

  const pedidosWoo =
    await obtenerPedidosPorRango(
      codigoTienda,
      fechaInicioTexto,
      fechaFinTexto
    );

  /**
   * =================================
   * TIENDA EN POSTGRESQL
   * =================================
   */

  const tienda =
    await prisma.store.findUnique({
      where: {
        code: codigoTienda,
      },
    });

  if (!tienda) {
    throw new Error(
      `La tienda "${codigoTienda}" no existe en PostgreSQL.`
    );
  }

  /**
   * =================================
   * PEDIDOS DESDE POSTGRESQL
   * =================================
   */

  const pedidosDB =
    await prisma.order.findMany({
      where: {
        storeId:
          tienda.id,

        dateCreated: {
          gte:
            fechaInicioDB,

          lte:
            fechaFinDB,
        },
      },

      include: {
        items: true,
      },
    });

  /**
   * =================================
   * MAPAS POR wooOrderId
   * =================================
   */

  const mapaWoo =
    new Map<
      number,
      PedidoWoo
    >();

  for (
    const pedido of
    pedidosWoo
  ) {
    mapaWoo.set(
      Number(pedido.id),
      pedido
    );
  }

  const mapaDB =
    new Map<
      number,
      (typeof pedidosDB)[number]
    >();

  for (
    const pedido of
    pedidosDB
  ) {
    mapaDB.set(
      Number(
        pedido.wooOrderId
      ),
      pedido
    );
  }

  /**
   * =================================
   * RESULTADOS
   * =================================
   */

  const soloWoo:
    number[] = [];

  const soloDB:
    number[] = [];

  const diferencias:
    Array<{
      wooOrderId: number;

      status?: {
        woo: string;
        db: string;
      };

      total?: {
        woo: number;
        db: number;
      };

      cantidad?: {
        woo: number;
        db: number;
      };
    }> = [];

  /**
   * =================================
   * COMPARAR WOO CONTRA DB
   * =================================
   */

  for (
    const [
      wooOrderId,
      pedidoWoo,
    ] of mapaWoo
  ) {
    const pedidoDB =
      mapaDB.get(
        wooOrderId
      );

    /**
     * Existe en Woo pero no en DB.
     */
    if (!pedidoDB) {
      soloWoo.push(
        wooOrderId
      );

      continue;
    }

    const diferencia:
      {
        wooOrderId: number;

        status?: {
          woo: string;
          db: string;
        };

        total?: {
          woo: number;
          db: number;
        };

        cantidad?: {
          woo: number;
          db: number;
        };
      } = {
        wooOrderId,
      };

    let tieneDiferencia =
      false;

    /**
     * STATUS
     */

    if (
      pedidoWoo.status !==
      pedidoDB.status
    ) {
      diferencia.status = {
        woo:
          pedidoWoo.status,

        db:
          pedidoDB.status,
      };

      tieneDiferencia =
        true;
    }

    /**
     * TOTAL
     */

    const totalWoo =
      Number(
        pedidoWoo.total ?? 0
      );

    const totalDB =
      Number(
        pedidoDB.total
      );

    if (
      !casiIguales(
        totalWoo,
        totalDB
      )
    ) {
      diferencia.total = {
        woo:
          Number(
            totalWoo.toFixed(2)
          ),

        db:
          Number(
            totalDB.toFixed(2)
          ),
      };

      tieneDiferencia =
        true;
    }

    /**
     * CANTIDAD
     */

    const cantidadWooPedido =
      cantidadWoo(
        pedidoWoo
      );

    const cantidadDB =
      Number(
        pedidoDB.items
          .reduce(
            (
              total,
              item
            ) =>
              total +
              Number(
                item.quantity
              ),
            0
          )
          .toFixed(3)
      );

    if (
      !casiIguales(
        cantidadWooPedido,
        cantidadDB,
        0.001
      )
    ) {
      diferencia.cantidad = {
        woo:
          cantidadWooPedido,

        db:
          cantidadDB,
      };

      tieneDiferencia =
        true;
    }

    if (
      tieneDiferencia
    ) {
      diferencias.push(
        diferencia
      );
    }
  }

  /**
   * =================================
   * PEDIDOS QUE ESTAN SOLO EN DB
   * =================================
   */

  for (
    const wooOrderId of
    mapaDB.keys()
  ) {
    if (
      !mapaWoo.has(
        wooOrderId
      )
    ) {
      soloDB.push(
        wooOrderId
      );
    }
  }

  /**
   * =================================
   * RESULTADO FINAL
   * =================================
   */

  const correcto =
    soloWoo.length === 0 &&
    soloDB.length === 0 &&
    diferencias.length === 0;

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

    resumen: {
      pedidos_woo:
        pedidosWoo.length,

      pedidos_db:
        pedidosDB.length,

      solo_en_woo:
        soloWoo.length,

      solo_en_db:
        soloDB.length,

      pedidos_con_diferencias:
        diferencias.length,
    },

    solo_en_woo:
      soloWoo,

    solo_en_db:
      soloDB,

    diferencias,
  };
}