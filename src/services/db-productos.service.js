import { prisma } from "../config/prisma.js";
const ESTADOS_VALIDOS = [
    "processing",
    "completed",
];
export async function calcularTopProductosDesdeDB(fechaInicio, fechaFin, limite = 5, codigoTienda) {
    let storeId;
    /**
     * Si recibimos una tienda específica,
     * buscamos su ID en PostgreSQL.
     */
    if (codigoTienda) {
        const tienda = await prisma.store.findUnique({
            where: {
                code: codigoTienda,
            },
        });
        if (!tienda) {
            throw new Error(`La tienda "${codigoTienda}" no existe en PostgreSQL.`);
        }
        storeId = tienda.id;
    }
    const pedidos = await prisma.order.findMany({
        where: {
            /**
             * Si storeId existe, filtramos.
             * Si no existe, Prisma consulta
             * todas las tiendas.
             */
            ...(storeId
                ? {
                    storeId,
                }
                : {}),
            status: {
                in: ESTADOS_VALIDOS,
            },
            dateCreated: {
                gte: fechaInicio,
                lte: fechaFin,
            },
        },
        include: {
            store: true,
            items: true,
        },
    });
    const productos = new Map();
    for (const pedido of pedidos) {
        for (const item of pedido.items) {
            /**
             * Si existe SKU, lo usamos como clave.
             *
             * Si no existe SKU, usamos productId
             * y nombre.
             */
            const clave = item.sku ||
                `${item.productId ?? "sin-id"}-${item.productName}`;
            const cantidad = Number(item.quantity);
            const ventas = Number(item.total);
            const existente = productos.get(clave);
            if (existente) {
                existente.cantidad += cantidad;
                existente.ventas += ventas;
                existente.tiendas.add(pedido.store.code);
            }
            else {
                productos.set(clave, {
                    nombre: item.productName,
                    sku: item.sku,
                    cantidad,
                    ventas,
                    tiendas: new Set([
                        pedido.store.code,
                    ]),
                });
            }
        }
    }
    const lista = Array.from(productos.values());
    const topPorCantidad = [...lista]
        .sort((a, b) => b.cantidad -
        a.cantidad)
        .slice(0, limite)
        .map((producto, index) => ({
        posicion: index + 1,
        nombre: producto.nombre,
        sku: producto.sku,
        cantidad: Number(producto.cantidad.toFixed(3)),
        ventas: Number(producto.ventas.toFixed(2)),
        tiendas: Array.from(producto.tiendas),
    }));
    const topPorVentas = [...lista]
        .sort((a, b) => b.ventas -
        a.ventas)
        .slice(0, limite)
        .map((producto, index) => ({
        posicion: index + 1,
        nombre: producto.nombre,
        sku: producto.sku,
        cantidad: Number(producto.cantidad.toFixed(3)),
        ventas: Number(producto.ventas.toFixed(2)),
        tiendas: Array.from(producto.tiendas),
    }));
    return {
        top_por_cantidad: topPorCantidad,
        top_por_ventas: topPorVentas,
    };
}
//# sourceMappingURL=db-productos.service.js.map