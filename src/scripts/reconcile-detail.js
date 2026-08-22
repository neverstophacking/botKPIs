import { conciliarPedidosDetallado, } from "../services/reconciliation-detail.service.js";
import { prisma, } from "../config/prisma.js";
const TIENDAS = [
    "carnemart",
    "yalo",
    "pastora",
];
function formatoFecha(fecha) {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
}
function rangoDB(inicio, fin) {
    return {
        inicio: new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate(), 0, 0, 0, 0),
        fin: new Date(fin.getFullYear(), fin.getMonth(), fin.getDate(), 23, 59, 59, 999),
    };
}
async function main() {
    const args = process.argv.slice(2);
    let fechaInicio = new Date();
    let fechaFin = new Date();
    /**
     * Ejemplo:
     *
     * npm run reconcile:detail --
     * 2026-08-20 2026-08-21
     */
    if (args[0] &&
        args[1]) {
        fechaInicio =
            new Date(`${args[0]}T00:00:00`);
        fechaFin =
            new Date(`${args[1]}T00:00:00`);
    }
    const desde = formatoFecha(fechaInicio);
    const hasta = formatoFecha(fechaFin);
    const rango = rangoDB(fechaInicio, fechaFin);
    console.log("");
    console.log("================================");
    console.log(" CONCILIACION DETALLADA");
    console.log("================================");
    console.log(`Periodo: ${desde} a ${hasta}`);
    for (const tienda of TIENDAS) {
        console.log("");
        console.log("--------------------------------");
        console.log(tienda.toUpperCase());
        console.log("--------------------------------");
        try {
            const resultado = await conciliarPedidosDetallado(tienda, desde, hasta, rango.inicio, rango.fin);
            console.log(`Woo: ${resultado.resumen.pedidos_woo}`);
            console.log(`DB: ${resultado.resumen.pedidos_db}`);
            console.log(`Solo Woo: ${resultado.resumen.solo_en_woo}`);
            console.log(`Solo DB: ${resultado.resumen.solo_en_db}`);
            console.log(`Diferencias: ${resultado.resumen.pedidos_con_diferencias}`);
            if (resultado.correcto) {
                console.log("");
                console.log("RESULTADO: OK");
                continue;
            }
            /**
             * PEDIDOS SOLO EN WOO
             */
            if (resultado.solo_en_woo.length >
                0) {
                console.log("");
                console.log("PEDIDOS SOLO EN WOOCOMMERCE:");
                for (const id of resultado.solo_en_woo) {
                    console.log(`- ${id}`);
                }
            }
            /**
             * PEDIDOS SOLO EN DB
             */
            if (resultado.solo_en_db.length >
                0) {
                console.log("");
                console.log("PEDIDOS SOLO EN POSTGRESQL:");
                for (const id of resultado.solo_en_db) {
                    console.log(`- ${id}`);
                }
            }
            /**
             * PEDIDOS CON DIFERENCIAS
             */
            if (resultado.diferencias.length >
                0) {
                console.log("");
                console.log("PEDIDOS CON DIFERENCIAS:");
                for (const diferencia of resultado.diferencias) {
                    console.log("");
                    console.log(`Pedido ${diferencia.wooOrderId}`);
                    if (diferencia.status) {
                        console.log(`  Status Woo: ${diferencia.status.woo}`);
                        console.log(`  Status DB:  ${diferencia.status.db}`);
                    }
                    if (diferencia.total) {
                        console.log(`  Total Woo: ${diferencia.total.woo}`);
                        console.log(`  Total DB:  ${diferencia.total.db}`);
                    }
                    if (diferencia.cantidad) {
                        console.log(`  Cantidad Woo: ${diferencia.cantidad.woo}`);
                        console.log(`  Cantidad DB:  ${diferencia.cantidad.db}`);
                    }
                }
            }
        }
        catch (error) {
            console.error(`ERROR en ${tienda}:`);
            console.error(error.message);
        }
    }
}
main()
    .catch(console.error)
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=reconcile-detail.js.map