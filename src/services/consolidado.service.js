import { calcularKpisDesdeDB, } from "./db-kpi.service.js";
const TIENDAS = [
    "carnemart",
    "yalo",
    "pastora",
];
export async function calcularConsolidado(fechaInicio, fechaFin) {
    const resultados = await Promise.all(TIENDAS.map(async (codigoTienda) => {
        const kpis = await calcularKpisDesdeDB(codigoTienda, fechaInicio, fechaFin);
        return {
            tienda: codigoTienda,
            ...kpis,
        };
    }));
    const pedidosEncontrados = resultados.reduce((total, item) => total + item.pedidos_encontrados, 0);
    const pedidosValidos = resultados.reduce((total, item) => total + item.pedidos_validos, 0);
    const ventas = resultados.reduce((total, item) => total + item.ventas, 0);
    const cantidadVendida = resultados.reduce((total, item) => total + item.cantidad_vendida, 0);
    const ticketPromedio = pedidosValidos > 0
        ? ventas / pedidosValidos
        : 0;
    return {
        consolidado: {
            pedidos_encontrados: pedidosEncontrados,
            pedidos_validos: pedidosValidos,
            ventas: Number(ventas.toFixed(2)),
            cantidad_vendida: Number(cantidadVendida.toFixed(3)),
            ticket_promedio: Number(ticketPromedio.toFixed(2)),
        },
        tiendas: resultados,
    };
}
export function calcularVariacion(actual, anterior) {
    if (anterior === 0) {
        // No podemos calcular un porcentaje
        // matemáticamente válido contra cero.
        return null;
    }
    const variacion = ((actual - anterior) / anterior) * 100;
    return Number(variacion.toFixed(2));
}
//# sourceMappingURL=consolidado.service.js.map