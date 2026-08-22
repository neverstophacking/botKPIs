import { Router } from "express";
import { calcularConsolidado, calcularVariacion, } from "../services/consolidado.service.js";
const router = Router();
const ZONA_HORARIA = "America/Mexico_City";
function obtenerFechaActualMexico() {
    return new Date(new Date().toLocaleString("en-US", {
        timeZone: ZONA_HORARIA,
    }));
}
function crearRangoDia(fecha) {
    const inicio = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 0, 0, 0, 0);
    const fin = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 23, 59, 59, 999);
    return {
        inicio,
        fin,
    };
}
router.get("/resumen/hoy", async (_req, res) => {
    try {
        const hoy = obtenerFechaActualMexico();
        const { inicio, fin, } = crearRangoDia(hoy);
        const resultado = await calcularConsolidado(inicio, fin);
        const mensaje = generarResumenHoy(resultado);
        return res.json({
            tipo: "resumen_hoy",
            mensaje,
            datos: resultado,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "No fue posible generar el resumen.",
            detalle: error.message,
        });
    }
});
router.get("/comparacion", async (_req, res) => {
    try {
        const hoy = obtenerFechaActualMexico();
        const ayer = new Date(hoy);
        ayer.setDate(ayer.getDate() - 1);
        const rangoHoy = crearRangoDia(hoy);
        const rangoAyer = crearRangoDia(ayer);
        const [resultadoHoy, resultadoAyer,] = await Promise.all([
            calcularConsolidado(rangoHoy.inicio, rangoHoy.fin),
            calcularConsolidado(rangoAyer.inicio, rangoAyer.fin),
        ]);
        const hoyKpis = resultadoHoy.consolidado;
        const ayerKpis = resultadoAyer.consolidado;
        const variaciones = {
            ventas_porcentaje: calcularVariacion(hoyKpis.ventas, ayerKpis.ventas),
            pedidos_porcentaje: calcularVariacion(hoyKpis.pedidos_validos, ayerKpis.pedidos_validos),
            ticket_promedio_porcentaje: calcularVariacion(hoyKpis.ticket_promedio, ayerKpis.ticket_promedio),
        };
        const mensaje = generarComparativo(hoyKpis, ayerKpis, variaciones);
        return res.json({
            tipo: "comparacion_hoy_ayer",
            mensaje,
            datos: {
                hoy: hoyKpis,
                ayer: ayerKpis,
                variaciones,
            },
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "No fue posible generar la comparación.",
            detalle: error.message,
        });
    }
});
export default router;
//# sourceMappingURL=business.routes.js.map