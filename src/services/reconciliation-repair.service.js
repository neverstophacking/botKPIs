import { conciliarPedidosDetallado, } from "./reconciliation-detail.service.js";
import { repararPedido, } from "./order-repair.service.js";
export async function conciliarYRepararTienda(codigoTienda, fechaInicioTexto, fechaFinTexto, fechaInicioDB, fechaFinDB) {
    const antes = await conciliarPedidosDetallado(codigoTienda, fechaInicioTexto, fechaFinTexto, fechaInicioDB, fechaFinDB);
    const pedidosAReparar = new Set();
    /**
     * Pedidos que están en Woo
     * pero no en PostgreSQL.
     */
    for (const wooOrderId of antes.solo_en_woo) {
        pedidosAReparar.add(wooOrderId);
    }
    /**
     * Pedidos existentes en ambos lados
     * pero con diferencias.
     */
    for (const diferencia of antes.diferencias) {
        pedidosAReparar.add(diferencia.wooOrderId);
    }
    const reparaciones = [];
    for (const wooOrderId of pedidosAReparar) {
        try {
            await repararPedido(codigoTienda, wooOrderId);
            reparaciones.push({
                wooOrderId,
                ok: true,
            });
        }
        catch (error) {
            reparaciones.push({
                wooOrderId,
                ok: false,
                error: error.message ||
                    String(error),
            });
        }
    }
    /**
     * Volvemos a conciliar después
     * de las reparaciones.
     */
    const despues = await conciliarPedidosDetallado(codigoTienda, fechaInicioTexto, fechaFinTexto, fechaInicioDB, fechaFinDB);
    return {
        tienda: codigoTienda,
        antes,
        reparaciones,
        despues,
        reparado: despues.correcto,
        requiere_revision_manual: despues.solo_en_db.length > 0,
    };
}
//# sourceMappingURL=reconciliation-repair.service.js.map