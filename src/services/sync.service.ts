import { prisma } from "../config/prisma.js";
import { obtenerPedidosPorRango } from "./woocommerce.service.js";

type MetaItem = {
  key?: string;
  value?: unknown;
};

function obtenerMeta(
  metaData: MetaItem[] | undefined,
  key: string
): string | null {
  if (!Array.isArray(metaData)) {
    return null;
  }

  const item = metaData.find(
    (meta) => meta?.key === key
  );

  if (
    item?.value === undefined ||
    item?.value === null ||
    item?.value === ""
  ) {
    return null;
  }

  return String(item.value);
}

async function obtenerOCrearCentro(
  storeId: number,
  pedido: any
): Promise<number | null> {
  const metaData = Array.isArray(
    pedido.meta_data
  )
    ? pedido.meta_data
    : [];

  const codigo =
    obtenerMeta(metaData, "centro");

  const locationKey =
    obtenerMeta(metaData, "location");

  const locationId =
    obtenerMeta(metaData, "location_id");

  const nombre =
    obtenerMeta(
      metaData,
      "location_name"
    );

  // Si el pedido no contiene información
  // suficiente del centro, no detenemos
  // la sincronización.
  if (!codigo) {
    return null;
  }

  const center =
    await prisma.center.upsert({
      where: {
        storeId_code: {
          storeId,
          code: codigo,
        },
      },

      update: {
        name:
          nombre ||
          codigo,

        locationKey:
          locationKey,

        locationId:
          locationId,

        active: true,
      },

      create: {
        storeId,

        code: codigo,

        name:
          nombre ||
          codigo,

        locationKey:
          locationKey,

        locationId:
          locationId,

        active: true,
      },
    });

  return center.id;
}

export async function sincronizarPedidos(
  codigoTienda: string,
  fechaInicio: string,
  fechaFin: string
) {
  console.log("");
  console.log(
    "=============================="
  );
  console.log(
    "SINCRONIZANDO PEDIDOS"
  );
  console.log(
    "=============================="
  );
  console.log(
    `Tienda: ${codigoTienda}`
  );
  console.log(
    `Desde: ${fechaInicio}`
  );
  console.log(
    `Hasta: ${fechaFin}`
  );

  const pedidos =
    await obtenerPedidosPorRango(
      codigoTienda,
      fechaInicio,
      fechaFin
    );

  const store =
    await prisma.store.upsert({
      where: {
        code: codigoTienda,
      },

      update: {},

      create: {
        code: codigoTienda,

        name:
          codigoTienda ===
          "carnemart"
            ? "Carnemart"
            : codigoTienda ===
                "yalo"
              ? "Yalo"
              : codigoTienda ===
                  "pastora"
                ? "La Pastora"
                : codigoTienda,
      },
    });

  let pedidosGuardados = 0;
  let pedidosConCentro = 0;
  let pedidosSinCentro = 0;

  for (const pedido of pedidos) {
    const centerId =
      await obtenerOCrearCentro(
        store.id,
        pedido
      );

    if (centerId) {
      pedidosConCentro++;
    } else {
      pedidosSinCentro++;
    }

    const order =
      await prisma.order.upsert({
        where: {
          storeId_wooOrderId: {
            storeId: store.id,
            wooOrderId:
              Number(pedido.id),
          },
        },

        update: {
          centerId,

          status:
            pedido.status,

          currency:
            pedido.currency ??
            null,

          dateCreated:
            new Date(
              pedido.date_created
            ),

          dateModified:
            pedido.date_modified
              ? new Date(
                  pedido.date_modified
                )
              : null,

          total:
            pedido.total,
        },

        create: {
          storeId:
            store.id,

          centerId,

          wooOrderId:
            Number(pedido.id),

          status:
            pedido.status,

          currency:
            pedido.currency ??
            null,

          dateCreated:
            new Date(
              pedido.date_created
            ),

          dateModified:
            pedido.date_modified
              ? new Date(
                  pedido.date_modified
                )
              : null,

          total:
            pedido.total,
        },
      });

    await prisma.orderItem.deleteMany({
      where: {
        orderId: order.id,
      },
    });

    for (
      const item of
      pedido.line_items ?? []
    ) {
      await prisma.orderItem.create({
        data: {
          orderId:
            order.id,

          wooItemId:
            Number(item.id),

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
            item.quantity,

          subtotal:
            item.subtotal,

          total:
            item.total,
        },
      });
    }

    pedidosGuardados++;

    console.log(
      `Pedido ${pedido.id} sincronizado (${pedidosGuardados}/${pedidos.length})` +
        (
          centerId
            ? " [centro asignado]"
            : " [sin centro]"
        )
    );
  }

  console.log(
    "=============================="
  );

  console.log(
    `Pedidos sincronizados: ${pedidosGuardados}`
  );

  console.log(
    `Pedidos con centro: ${pedidosConCentro}`
  );

  console.log(
    `Pedidos sin centro: ${pedidosSinCentro}`
  );

  console.log(
    "=============================="
  );

  return {
    tienda:
      codigoTienda,

    pedidos_encontrados:
      pedidos.length,

    pedidos_sincronizados:
      pedidosGuardados,

    pedidos_con_centro:
      pedidosConCentro,

    pedidos_sin_centro:
      pedidosSinCentro,
  };
}