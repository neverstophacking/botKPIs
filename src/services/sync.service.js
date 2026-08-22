import { prisma } from "../config/prisma.js";
import { obtenerPedidosPorRango } from "./woocommerce.service.js";
export async function sincronizarPedidos(codigoTienda, fechaInicio, fechaFin) {
    console.log("");
    console.log("==============================");
    console.log("SINCRONIZANDO PEDIDOS");
    console.log("==============================");
    console.log(`Tienda: ${codigoTienda}`);
    console.log(`Desde: ${fechaInicio}`);
    console.log(`Hasta: ${fechaFin}`);
    const pedidos = await obtenerPedidosPorRango(codigoTienda, fechaInicio, fechaFin);
    const store = await prisma.store.upsert({
        where: {
            code: codigoTienda,
        },
        update: {},
        create: {
            code: codigoTienda,
            name: codigoTienda === "carnemart"
                ? "Carnemart"
                : codigoTienda,
        },
    });
    let pedidosGuardados = 0;
    for (const pedido of pedidos) {
        const order = await prisma.order.upsert({
            where: {
                storeId_wooOrderId: {
                    storeId: store.id,
                    wooOrderId: Number(pedido.id),
                },
            },
            update: {
                status: pedido.status,
                currency: pedido.currency ?? null,
                dateCreated: new Date(pedido.date_created),
                dateModified: pedido.date_modified
                    ? new Date(pedido.date_modified)
                    : null,
                total: pedido.total,
            },
            create: {
                storeId: store.id,
                wooOrderId: Number(pedido.id),
                status: pedido.status,
                currency: pedido.currency ?? null,
                dateCreated: new Date(pedido.date_created),
                dateModified: pedido.date_modified
                    ? new Date(pedido.date_modified)
                    : null,
                total: pedido.total,
            },
        });
        await prisma.orderItem.deleteMany({
            where: {
                orderId: order.id,
            },
        });
        for (const item of pedido.line_items) {
            await prisma.orderItem.create({
                data: {
                    orderId: order.id,
                    wooItemId: Number(item.id),
                    productId: item.product_id
                        ? Number(item.product_id)
                        : null,
                    variationId: item.variation_id
                        ? Number(item.variation_id)
                        : null,
                    sku: item.sku || null,
                    productName: item.name,
                    quantity: item.quantity,
                    subtotal: item.subtotal,
                    total: item.total,
                },
            });
        }
        pedidosGuardados++;
        console.log(`Pedido ${pedido.id} sincronizado (${pedidosGuardados}/${pedidos.length})`);
    }
    console.log("==============================");
    console.log(`Pedidos sincronizados: ${pedidosGuardados}`);
    console.log("==============================");
    return {
        tienda: codigoTienda,
        pedidos_encontrados: pedidos.length,
        pedidos_sincronizados: pedidosGuardados,
    };
}
//# sourceMappingURL=sync.service.js.map