import {
  obtenerPedidoPorId,
} from "./woocommerce.service.js";

import {
  prisma,
} from "../config/prisma.js";

export async function repararPedido(
  codigoTienda: string,
  wooOrderId: number
) {
  /**
   * Buscar tienda en PostgreSQL
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
   * Traer pedido directamente desde WooCommerce
   */
  const pedidoWoo =
    await obtenerPedidoPorId(
      codigoTienda,
      wooOrderId
    );

  if (!pedidoWoo) {
    throw new Error(
      `El pedido ${wooOrderId} no existe en WooCommerce.`
    );
  }

  /**
   * Upsert del pedido
   */
  const pedidoDB =
    await prisma.order.upsert({
      where: {
        storeId_wooOrderId: {
          storeId:
            tienda.id,

          wooOrderId:
            Number(
              pedidoWoo.id
            ),
        },
      },

      update: {
        status:
          pedidoWoo.status,

        currency:
          pedidoWoo.currency,

        dateCreated:
          new Date(
            pedidoWoo.date_created
          ),

        dateModified:
          new Date(
            pedidoWoo.date_modified
          ),

        total:
          Number(
            pedidoWoo.total ?? 0
          ),
      },

      create: {
        storeId:
          tienda.id,

        wooOrderId:
          Number(
            pedidoWoo.id
          ),

        status:
          pedidoWoo.status,

        currency:
          pedidoWoo.currency,

        dateCreated:
          new Date(
            pedidoWoo.date_created
          ),

        dateModified:
          new Date(
            pedidoWoo.date_modified
          ),

        total:
          Number(
            pedidoWoo.total ?? 0
          ),
      },
    });

  /**
   * Para evitar items viejos o duplicados,
   * reconstruimos los items del pedido.
   */
  await prisma.orderItem.deleteMany({
    where: {
      orderId:
        pedidoDB.id,
    },
  });

  const items =
    pedidoWoo.line_items ?? [];

  if (
    items.length > 0
  ) {
    await prisma.orderItem.createMany({
      data:
        items.map(
          (item: any) => ({
            orderId:
              pedidoDB.id,

            wooItemId:
              Number(
                item.id
              ),

            productId:
              item.product_id
                ? Number(
                    item.product_id
                  )
                : null,

            variationId:
              item.variation_id
                ? Number(
                    item.variation_id
                  )
                : null,

            sku:
              item.sku ||
              null,

            productName:
              item.name,

            quantity:
              Number(
                item.quantity ?? 0
              ),

            subtotal:
              Number(
                item.subtotal ?? 0
              ),

            total:
              Number(
                item.total ?? 0
              ),
          })
        ),
    });
  }

  return {
    tienda:
      codigoTienda,

    wooOrderId,

    reparado:
      true,

    status:
      pedidoWoo.status,

    total:
      Number(
        pedidoWoo.total ?? 0
      ),

    items:
      items.length,
  };
}