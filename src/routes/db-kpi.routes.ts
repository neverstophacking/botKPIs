import { Router } from "express";
import { calcularKpisDesdeDB, } from "../services/db-kpi.service.js";
import { calcularConsolidado, calcularVariacion, } from "../services/consolidado.service.js";
import { calcularTopProductosDesdeDB, } from "../services/db-productos.service.js";

const router = Router();

const ZONA_HORARIA =
  "America/Mexico_City";

function fechaMexicanaValida(
  fecha: string
): boolean {
  const formato =
    /^\d{2}-\d{2}-\d{4}$/;

  if (!formato.test(fecha)) {
    return false;
  }

  const [dia, mes, anio] =
    fecha.split("-").map(Number);

  const fechaReal =
    new Date(anio, mes - 1, dia);

  return (
    fechaReal.getFullYear() === anio &&
    fechaReal.getMonth() === mes - 1 &&
    fechaReal.getDate() === dia
  );
}

function obtenerFechaActualMexico(): Date {
  return new Date(
    new Date().toLocaleString(
      "en-US",
      {
        timeZone: ZONA_HORARIA,
      }
    )
  );
}

function formatoMexico(
  fecha: Date
): string {
  const dia =
    String(fecha.getDate())
      .padStart(2, "0");

  const mes =
    String(fecha.getMonth() + 1)
      .padStart(2, "0");

  const anio =
    fecha.getFullYear();

  return `${dia}-${mes}-${anio}`;
}

function crearRangoDia(
  fecha: Date
) {
  const inicio = new Date(
    fecha.getFullYear(),
    fecha.getMonth(),
    fecha.getDate(),
    0,
    0,
    0,
    0
  );

  const fin = new Date(
    fecha.getFullYear(),
    fecha.getMonth(),
    fecha.getDate(),
    23,
    59,
    59,
    999
  );

  return {
    inicio,
    fin,
  };
}

function crearRangoFechaTexto(
  fecha: string
) {
  const [dia, mes, anio] =
    fecha.split("-").map(Number);

  const base = new Date(
    anio,
    mes - 1,
    dia
  );

  return crearRangoDia(base);
}

router.get(
  "/todas/comparacion",
  async (_req, res) => {
    try {
      const hoy =
        obtenerFechaActualMexico();

      const ayer =
        new Date(hoy);

      ayer.setDate(
        ayer.getDate() - 1
      );

      const rangoHoy =
        crearRangoDia(hoy);

      const rangoAyer =
        crearRangoDia(ayer);

      const inicioMedicion =
        Date.now();

      /**
       * Ejecutamos ambas consultas
       * al mismo tiempo.
       */
      const [
        resultadoHoy,
        resultadoAyer,
      ] = await Promise.all([
        calcularConsolidado(
          rangoHoy.inicio,
          rangoHoy.fin
        ),

        calcularConsolidado(
          rangoAyer.inicio,
          rangoAyer.fin
        ),
      ]);

      const hoyKpis =
        resultadoHoy.consolidado;

      const ayerKpis =
        resultadoAyer.consolidado;

      const variaciones = {
        ventas_porcentaje:
          calcularVariacion(
            hoyKpis.ventas,
            ayerKpis.ventas
          ),

        pedidos_porcentaje:
          calcularVariacion(
            hoyKpis.pedidos_validos,
            ayerKpis.pedidos_validos
          ),

        cantidad_porcentaje:
          calcularVariacion(
            hoyKpis.cantidad_vendida,
            ayerKpis.cantidad_vendida
          ),

        ticket_promedio_porcentaje:
          calcularVariacion(
            hoyKpis.ticket_promedio,
            ayerKpis.ticket_promedio
          ),
      };

      return res.json({
        fuente: "postgresql",

        periodo:
          "hoy_vs_ayer",

        fechas: {
          hoy:
            formatoMexico(hoy),

          ayer:
            formatoMexico(ayer),
        },

        zona_horaria:
          ZONA_HORARIA,

        tiempo_consulta_ms:
          Date.now() -
          inicioMedicion,

        hoy:
          hoyKpis,

        ayer:
          ayerKpis,

        variaciones,

        tiendas_hoy:
          resultadoHoy.tiendas,

        tiendas_ayer:
          resultadoAyer.tiendas,
      });

    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        error:
          "No fue posible realizar la comparación.",

        detalle:
          error.message,
      });
    }
  }
);

router.get(
  "/todas/productos/hoy",
  async (_req, res) => {
    try {
      const hoy =
        obtenerFechaActualMexico();

      const {
        inicio,
        fin,
      } =
        crearRangoDia(hoy);

      const inicioMedicion =
        Date.now();

      const productos =
        await calcularTopProductosDesdeDB(
          inicio,
          fin,
          5
        );

      return res.json({
        fuente:
          "postgresql",

        periodo:
          "productos_hoy",

        fecha:
          formatoMexico(hoy),

        zona_horaria:
          ZONA_HORARIA,

        tiempo_consulta_ms:
          Date.now() -
          inicioMedicion,

        ...productos,
      });

    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        error:
          "No fue posible calcular los productos de hoy.",

        detalle:
          error.message,
      });
    }
  }
);

router.get(
  "/todas/productos/semana",
  async (_req, res) => {
    try {
      const hoy =
        obtenerFechaActualMexico();

      const diaSemana =
        hoy.getDay();

      const diasDesdeLunes =
        diaSemana === 0
          ? 6
          : diaSemana - 1;

      const inicioSemana =
        new Date(hoy);

      inicioSemana.setDate(
        hoy.getDate() -
        diasDesdeLunes
      );

      const inicio =
        new Date(
          inicioSemana.getFullYear(),
          inicioSemana.getMonth(),
          inicioSemana.getDate(),
          0,
          0,
          0,
          0
        );

      const fin =
        new Date(
          hoy.getFullYear(),
          hoy.getMonth(),
          hoy.getDate(),
          23,
          59,
          59,
          999
        );

      const inicioMedicion =
        Date.now();

      const productos =
        await calcularTopProductosDesdeDB(
          inicio,
          fin,
          5
        );

      return res.json({
        fuente:
          "postgresql",

        periodo:
          "productos_semana",

        desde:
          formatoMexico(
            inicioSemana
          ),

        hasta:
          formatoMexico(hoy),

        zona_horaria:
          ZONA_HORARIA,

        tiempo_consulta_ms:
          Date.now() -
          inicioMedicion,

        ...productos,
      });

    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        error:
          "No fue posible calcular los productos de la semana.",

        detalle:
          error.message,
      });
    }
  }
);

router.get(
  "/todas/productos/mes",
  async (_req, res) => {
    try {
      const hoy =
        obtenerFechaActualMexico();

      const inicioMes =
        new Date(
          hoy.getFullYear(),
          hoy.getMonth(),
          1,
          0,
          0,
          0,
          0
        );

      const fin =
        new Date(
          hoy.getFullYear(),
          hoy.getMonth(),
          hoy.getDate(),
          23,
          59,
          59,
          999
        );

      const inicioMedicion =
        Date.now();

      const productos =
        await calcularTopProductosDesdeDB(
          inicioMes,
          fin,
          5
        );

      return res.json({
        fuente:
          "postgresql",

        periodo:
          "productos_mes",

        desde:
          formatoMexico(
            inicioMes
          ),

        hasta:
          formatoMexico(hoy),

        zona_horaria:
          ZONA_HORARIA,

        tiempo_consulta_ms:
          Date.now() -
          inicioMedicion,

        ...productos,
      });

    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        error:
          "No fue posible calcular los productos del mes.",

        detalle:
          error.message,
      });
    }
  }
);

/**
 * FECHA ESPECIFICA
 *
 * /api/db/kpis/carnemart?fecha=18-08-2026
 */
router.get(
  "/:tienda",
  async (req, res) => {
    try {
      const codigoTienda =
        req.params.tienda;

      const fecha =
        req.query.fecha as string;

      if (!fecha) {
        return res.status(400).json({
          error:
            "Debes proporcionar una fecha.",

          formato:
            "DD-MM-YYYY",

          ejemplo:
            `/api/db/kpis/${codigoTienda}?fecha=18-08-2026`,
        });
      }

      if (
        !fechaMexicanaValida(fecha)
      ) {
        return res.status(400).json({
          error:
            "Fecha no válida.",

          formato:
            "DD-MM-YYYY",
        });
      }

      const {
        inicio,
        fin,
      } =
        crearRangoFechaTexto(fecha);

      const inicioMedicion =
        Date.now();

      const kpis =
        await calcularKpisDesdeDB(
          codigoTienda,
          inicio,
          fin
        );

      const tiempoMs =
        Date.now() -
        inicioMedicion;

      return res.json({
        fuente:
          "postgresql",

        tienda:
          codigoTienda,

        periodo:
          "fecha_especifica",

        fecha,

        tiempo_consulta_ms:
          tiempoMs,

        ...kpis,
      });

    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        error:
          "No fue posible calcular los KPIs.",

        detalle:
          error.message,
      });
    }
  }
);

router.get(
  "/todas/hoy",
  async (_req, res) => {
    try {
      const hoy =
        obtenerFechaActualMexico();

      const {
        inicio,
        fin,
      } = crearRangoDia(hoy);

      const inicioMedicion =
        Date.now();

      const resultado =
        await calcularConsolidado(
          inicio,
          fin
        );

      return res.json({
        fuente: "postgresql",

        periodo: "hoy",

        fecha:
          formatoMexico(hoy),

        zona_horaria:
          ZONA_HORARIA,

        tiempo_consulta_ms:
          Date.now() -
          inicioMedicion,

        ...resultado,
      });

    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        error:
          "No fue posible calcular el consolidado de hoy.",

        detalle:
          error.message,
      });
    }
  }
);

/**
 * HOY
 *
 * /api/db/kpis/carnemart/hoy
 */
router.get(
  "/:tienda/hoy",
  async (req, res) => {
    try {
      const codigoTienda =
        req.params.tienda;

      const hoy =
        obtenerFechaActualMexico();

      const {
        inicio,
        fin,
      } =
        crearRangoDia(hoy);

      const inicioMedicion =
        Date.now();

      const kpis =
        await calcularKpisDesdeDB(
          codigoTienda,
          inicio,
          fin
        );

      const tiempoMs =
        Date.now() -
        inicioMedicion;

      return res.json({
        fuente:
          "postgresql",

        tienda:
          codigoTienda,

        periodo:
          "hoy",

        fecha:
          formatoMexico(hoy),

        zona_horaria:
          ZONA_HORARIA,

        tiempo_consulta_ms:
          tiempoMs,

        ...kpis,
      });

    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        error:
          "No fue posible consultar hoy.",

        detalle:
          error.message,
      });
    }
  }
);

router.get(
  "/todas/ayer",
  async (_req, res) => {
    try {
      const ayer =
        obtenerFechaActualMexico();

      ayer.setDate(
        ayer.getDate() - 1
      );

      const {
        inicio,
        fin,
      } = crearRangoDia(ayer);

      const inicioMedicion =
        Date.now();

      const resultado =
        await calcularConsolidado(
          inicio,
          fin
        );

      return res.json({
        fuente: "postgresql",
        periodo: "ayer",

        fecha:
          formatoMexico(ayer),

        zona_horaria:
          ZONA_HORARIA,

        tiempo_consulta_ms:
          Date.now() -
          inicioMedicion,

        ...resultado,
      });

    } catch (error: any) {
      return res.status(500).json({
        error:
          "No fue posible calcular el consolidado de ayer.",

        detalle:
          error.message,
      });
    }
  }
);

/**
 * AYER
 *
 * /api/db/kpis/carnemart/ayer
 */
router.get(
  "/:tienda/ayer",
  async (req, res) => {
    try {
      const codigoTienda =
        req.params.tienda;

      const ayer =
        obtenerFechaActualMexico();

      ayer.setDate(
        ayer.getDate() - 1
      );

      const {
        inicio,
        fin,
      } =
        crearRangoDia(ayer);

      const inicioMedicion =
        Date.now();

      const kpis =
        await calcularKpisDesdeDB(
          codigoTienda,
          inicio,
          fin
        );

      const tiempoMs =
        Date.now() -
        inicioMedicion;

      return res.json({
        fuente:
          "postgresql",

        tienda:
          codigoTienda,

        periodo:
          "ayer",

        fecha:
          formatoMexico(ayer),

        zona_horaria:
          ZONA_HORARIA,

        tiempo_consulta_ms:
          tiempoMs,

        ...kpis,
      });

    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        error:
          "No fue posible consultar ayer.",

        detalle:
          error.message,
      });
    }
  }
);

router.get(
  "/todas/semana",
  async (_req, res) => {
    try {
      const hoy =
        obtenerFechaActualMexico();

      const diaSemana =
        hoy.getDay();

      const diasDesdeLunes =
        diaSemana === 0
          ? 6
          : diaSemana - 1;

      const inicioSemana =
        new Date(hoy);

      inicioSemana.setDate(
        hoy.getDate() -
        diasDesdeLunes
      );

      const inicio =
        new Date(
          inicioSemana.getFullYear(),
          inicioSemana.getMonth(),
          inicioSemana.getDate(),
          0, 0, 0, 0
        );

      const fin =
        new Date(
          hoy.getFullYear(),
          hoy.getMonth(),
          hoy.getDate(),
          23, 59, 59, 999
        );

      const inicioMedicion =
        Date.now();

      const resultado =
        await calcularConsolidado(
          inicio,
          fin
        );

      return res.json({
        fuente: "postgresql",

        periodo:
          "semana_actual",

        desde:
          formatoMexico(
            inicioSemana
          ),

        hasta:
          formatoMexico(hoy),

        zona_horaria:
          ZONA_HORARIA,

        tiempo_consulta_ms:
          Date.now() -
          inicioMedicion,

        ...resultado,
      });

    } catch (error: any) {
      return res.status(500).json({
        error:
          "No fue posible calcular el consolidado semanal.",

        detalle:
          error.message,
      });
    }
  }
);

/**
 * SEMANA ACTUAL
 *
 * /api/db/kpis/carnemart/semana
 */
router.get(
  "/:tienda/semana",
  async (req, res) => {
    try {
      const codigoTienda =
        req.params.tienda;

      const hoy =
        obtenerFechaActualMexico();

      const diaSemana =
        hoy.getDay();

      const diasDesdeLunes =
        diaSemana === 0
          ? 6
          : diaSemana - 1;

      const inicioSemana =
        new Date(hoy);

      inicioSemana.setDate(
        hoy.getDate() -
        diasDesdeLunes
      );

      const inicio =
        new Date(
          inicioSemana.getFullYear(),
          inicioSemana.getMonth(),
          inicioSemana.getDate(),
          0,
          0,
          0,
          0
        );

      const fin =
        new Date(
          hoy.getFullYear(),
          hoy.getMonth(),
          hoy.getDate(),
          23,
          59,
          59,
          999
        );

      const inicioMedicion =
        Date.now();

      const kpis =
        await calcularKpisDesdeDB(
          codigoTienda,
          inicio,
          fin
        );

      const tiempoMs =
        Date.now() -
        inicioMedicion;

      return res.json({
        fuente:
          "postgresql",

        tienda:
          codigoTienda,

        periodo:
          "semana_actual",

        desde:
          formatoMexico(
            inicioSemana
          ),

        hasta:
          formatoMexico(hoy),

        zona_horaria:
          ZONA_HORARIA,

        tiempo_consulta_ms:
          tiempoMs,

        ...kpis,
      });

    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        error:
          "No fue posible consultar la semana.",

        detalle:
          error.message,
      });
    }
  }
);

router.get(
  "/todas/mes",
  async (_req, res) => {
    try {
      const hoy =
        obtenerFechaActualMexico();

      const inicioMes =
        new Date(
          hoy.getFullYear(),
          hoy.getMonth(),
          1,
          0, 0, 0, 0
        );

      const fin =
        new Date(
          hoy.getFullYear(),
          hoy.getMonth(),
          hoy.getDate(),
          23, 59, 59, 999
        );

      const inicioMedicion =
        Date.now();

      const resultado =
        await calcularConsolidado(
          inicioMes,
          fin
        );

      return res.json({
        fuente: "postgresql",

        periodo:
          "mes_actual",

        desde:
          formatoMexico(
            inicioMes
          ),

        hasta:
          formatoMexico(hoy),

        zona_horaria:
          ZONA_HORARIA,

        tiempo_consulta_ms:
          Date.now() -
          inicioMedicion,

        ...resultado,
      });

    } catch (error: any) {
      return res.status(500).json({
        error:
          "No fue posible calcular el consolidado mensual.",

        detalle:
          error.message,
      });
    }
  }
);

/**
 * MES ACTUAL
 *
 * /api/db/kpis/carnemart/mes
 */
router.get(
  "/:tienda/mes",
  async (req, res) => {
    try {
      const codigoTienda =
        req.params.tienda;

      const hoy =
        obtenerFechaActualMexico();

      const inicioMes =
        new Date(
          hoy.getFullYear(),
          hoy.getMonth(),
          1,
          0,
          0,
          0,
          0
        );

      const fin =
        new Date(
          hoy.getFullYear(),
          hoy.getMonth(),
          hoy.getDate(),
          23,
          59,
          59,
          999
        );

      const inicioMedicion =
        Date.now();

      const kpis =
        await calcularKpisDesdeDB(
          codigoTienda,
          inicioMes,
          fin
        );

      const tiempoMs =
        Date.now() -
        inicioMedicion;

      return res.json({
        fuente:
          "postgresql",

        tienda:
          codigoTienda,

        periodo:
          "mes_actual",

        desde:
          formatoMexico(
            inicioMes
          ),

        hasta:
          formatoMexico(hoy),

        zona_horaria:
          ZONA_HORARIA,

        tiempo_consulta_ms:
          tiempoMs,

        ...kpis,
      });

    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        error:
          "No fue posible consultar el mes.",

        detalle:
          error.message,
      });
    }
  }
);

export default router;