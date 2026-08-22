import { Router } from "express";
import { obtenerPedidosPorFecha, obtenerPedidosPorRango, } from "../services/woocommerce.service.js";
import { obtenerTienda, } from "../config/stores.js";
const router = Router();
const ZONA_HORARIA = "America/Mexico_City";
/**
 * ==============================
 * FUNCIONES DE FECHA
 * ==============================
 */
function fechaMexicanaValida(fecha) {
    const formato = /^\d{2}-\d{2}-\d{4}$/;
    if (!formato.test(fecha)) {
        return false;
    }
    const [dia, mes, anio] = fecha.split("-").map(Number);
    const fechaReal = new Date(anio, mes - 1, dia);
    return (fechaReal.getFullYear() === anio &&
        fechaReal.getMonth() === mes - 1 &&
        fechaReal.getDate() === dia);
}
function convertirFechaAWooCommerce(fecha) {
    const [dia, mes, anio] = fecha.split("-");
    return `${anio}-${mes}-${dia}`;
}
function convertirDateAFormatoWooCommerce(fecha) {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1)
        .padStart(2, "0");
    const dia = String(fecha.getDate())
        .padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
}
function convertirDateAFormatoMexico(fecha) {
    const dia = String(fecha.getDate())
        .padStart(2, "0");
    const mes = String(fecha.getMonth() + 1)
        .padStart(2, "0");
    const anio = fecha.getFullYear();
    return `${dia}-${mes}-${anio}`;
}
function obtenerFechaActualMexicoComoDate() {
    return new Date(new Date().toLocaleString("en-US", {
        timeZone: ZONA_HORARIA,
    }));
}
function obtenerFechaHoyMexico() {
    return convertirDateAFormatoMexico(obtenerFechaActualMexicoComoDate());
}
function obtenerFechaAyerMexico() {
    const fecha = obtenerFechaActualMexicoComoDate();
    fecha.setDate(fecha.getDate() - 1);
    return convertirDateAFormatoMexico(fecha);
}
/**
 * ==============================
 * VALIDAR TIENDA
 * ==============================
 */
function validarTienda(codigo) {
    return obtenerTienda(codigo);
}
/**
 * =================================
 * HOY
 * =================================
 *
 * /api/kpis/carnemart/hoy
 * /api/kpis/yalo/hoy
 * /api/kpis/pastora/hoy
 */
router.get("/:tienda/hoy", async (req, res) => {
    try {
        const codigoTienda = req.params.tienda;
        const tienda = validarTienda(codigoTienda);
        if (!tienda) {
            return res.status(404).json({
                error: "Tienda no encontrada.",
                tiendas_disponibles: [
                    "carnemart",
                    "yalo",
                    "pastora",
                ],
            });
        }
        const fechaMexico = obtenerFechaHoyMexico();
        const fechaWooCommerce = convertirFechaAWooCommerce(fechaMexico);
        const pedidos = await obtenerPedidosPorFecha(codigoTienda, fechaWooCommerce);
        const kpis = calcularKpis(pedidos);
        return res.json({
            tienda: tienda.codigo,
            nombre_tienda: tienda.nombre,
            periodo: "hoy",
            fecha: fechaMexico,
            zona_horaria: ZONA_HORARIA,
            ...kpis,
        });
    }
    catch (error) {
        console.error(error.response?.data ||
            error.message);
        return res.status(500).json({
            error: "No fue posible consultar la tienda.",
            detalle: error.response?.data ||
                error.message,
        });
    }
});
/**
 * =================================
 * AYER
 * =================================
 */
router.get("/:tienda/ayer", async (req, res) => {
    try {
        const codigoTienda = req.params.tienda;
        const tienda = validarTienda(codigoTienda);
        if (!tienda) {
            return res.status(404).json({
                error: "Tienda no encontrada.",
            });
        }
        const fechaMexico = obtenerFechaAyerMexico();
        const fechaWooCommerce = convertirFechaAWooCommerce(fechaMexico);
        const pedidos = await obtenerPedidosPorFecha(codigoTienda, fechaWooCommerce);
        const kpis = calcularKpis(pedidos);
        return res.json({
            tienda: tienda.codigo,
            nombre_tienda: tienda.nombre,
            periodo: "ayer",
            fecha: fechaMexico,
            zona_horaria: ZONA_HORARIA,
            ...kpis,
        });
    }
    catch (error) {
        return res.status(500).json({
            error: "No fue posible consultar la tienda.",
            detalle: error.response?.data ||
                error.message,
        });
    }
});
/**
 * =================================
 * SEMANA
 * =================================
 */
router.get("/:tienda/semana", async (req, res) => {
    try {
        const codigoTienda = req.params.tienda;
        const tienda = validarTienda(codigoTienda);
        if (!tienda) {
            return res.status(404).json({
                error: "Tienda no encontrada.",
            });
        }
        const hoy = obtenerFechaActualMexicoComoDate();
        const diaSemana = hoy.getDay();
        const diasDesdeLunes = diaSemana === 0
            ? 6
            : diaSemana - 1;
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() -
            diasDesdeLunes);
        const inicio = convertirDateAFormatoWooCommerce(inicioSemana);
        const fin = convertirDateAFormatoWooCommerce(hoy);
        const pedidos = await obtenerPedidosPorRango(codigoTienda, inicio, fin);
        const kpis = calcularKpis(pedidos);
        return res.json({
            tienda: tienda.codigo,
            nombre_tienda: tienda.nombre,
            periodo: "semana_actual",
            desde: convertirDateAFormatoMexico(inicioSemana),
            hasta: convertirDateAFormatoMexico(hoy),
            zona_horaria: ZONA_HORARIA,
            ...kpis,
        });
    }
    catch (error) {
        return res.status(500).json({
            error: "No fue posible consultar la semana.",
            detalle: error.response?.data ||
                error.message,
        });
    }
});
/**
 * =================================
 * MES
 * =================================
 */
router.get("/:tienda/mes", async (req, res) => {
    try {
        const codigoTienda = req.params.tienda;
        const tienda = validarTienda(codigoTienda);
        if (!tienda) {
            return res.status(404).json({
                error: "Tienda no encontrada.",
            });
        }
        const hoy = obtenerFechaActualMexicoComoDate();
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const inicio = convertirDateAFormatoWooCommerce(inicioMes);
        const fin = convertirDateAFormatoWooCommerce(hoy);
        const pedidos = await obtenerPedidosPorRango(codigoTienda, inicio, fin);
        const kpis = calcularKpis(pedidos);
        return res.json({
            tienda: tienda.codigo,
            nombre_tienda: tienda.nombre,
            periodo: "mes_actual",
            desde: convertirDateAFormatoMexico(inicioMes),
            hasta: convertirDateAFormatoMexico(hoy),
            zona_horaria: ZONA_HORARIA,
            ...kpis,
        });
    }
    catch (error) {
        return res.status(500).json({
            error: "No fue posible consultar el mes.",
            detalle: error.response?.data ||
                error.message,
        });
    }
});
/**
 * =================================
 * PRODUCTOS DE HOY
 * =================================
 */
router.get("/:tienda/productos/hoy", async (req, res) => {
    try {
        const codigoTienda = req.params.tienda;
        const tienda = validarTienda(codigoTienda);
        if (!tienda) {
            return res.status(404).json({
                error: "Tienda no encontrada.",
            });
        }
        const fechaMexico = obtenerFechaHoyMexico();
        const fechaWooCommerce = convertirFechaAWooCommerce(fechaMexico);
        const pedidos = await obtenerPedidosPorFecha(codigoTienda, fechaWooCommerce);
        const productos = calcularTopProductos(pedidos);
        return res.json({
            tienda: tienda.codigo,
            nombre_tienda: tienda.nombre,
            periodo: "productos_hoy",
            fecha: fechaMexico,
            ...productos,
        });
    }
    catch (error) {
        return res.status(500).json({
            error: "No fue posible consultar productos.",
            detalle: error.response?.data ||
                error.message,
        });
    }
});
/**
 * =================================
 * FECHA ESPECIFICA
 * =================================
 *
 * /api/kpis/carnemart?fecha=18-08-2026
 */
router.get("/:tienda", async (req, res) => {
    try {
        const codigoTienda = req.params.tienda;
        const tienda = validarTienda(codigoTienda);
        if (!tienda) {
            return res.status(404).json({
                error: "Tienda no encontrada.",
            });
        }
        const fecha = req.query.fecha;
        if (!fecha) {
            return res.status(400).json({
                error: "Debes enviar una fecha.",
                formato: "DD-MM-YYYY",
                ejemplo: `/api/kpis/${codigoTienda}?fecha=18-08-2026`,
            });
        }
        if (!fechaMexicanaValida(fecha)) {
            return res.status(400).json({
                error: "Fecha no válida.",
                formato: "DD-MM-YYYY",
            });
        }
        const fechaWooCommerce = convertirFechaAWooCommerce(fecha);
        const pedidos = await obtenerPedidosPorFecha(codigoTienda, fechaWooCommerce);
        const kpis = calcularKpis(pedidos);
        return res.json({
            tienda: tienda.codigo,
            nombre_tienda: tienda.nombre,
            periodo: "fecha_especifica",
            fecha,
            ...kpis,
        });
    }
    catch (error) {
        return res.status(500).json({
            error: "No fue posible consultar la tienda.",
            detalle: error.response?.data ||
                error.message,
        });
    }
});
export default router;
//# sourceMappingURL=kpi.routes.js.map