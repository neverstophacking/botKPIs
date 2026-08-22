import {
  sincronizarPedidos,
} from "./sync.service.js";

import {
  conciliarTienda,
} from "./reconciliation.service.js";

import {
  conciliarYRepararTienda,
} from "./reconciliation-repair.service.js";

import {
  guardarConciliacion,
} from "./reconciliation-log.service.js";

import {
  logInfo,
  logWarn,
  logError,
} from "./log.service.js";

import {
  crearAlertaSiNoExiste,
} from "./alert.service.js";

/**
 * Tiendas que forman parte del proyecto.
 */
const TIENDAS = [
  "carnemart",
  "yalo",
  "pastora",
];

/**
 * Evitan ejecuciones simultáneas.
 */
let sincronizacionEnCurso = false;
let conciliacionEnCurso = false;

/**
 * Estado en memoria para /api/sync/status
 */
let ultimaSincronizacion:
  string | null = null;

let ultimaConciliacion:
  string | null = null;

let ultimoResultadoSync:
  unknown = null;

let ultimoResultadoConciliacion:
  unknown = null;

/**
 * Convierte Date a YYYY-MM-DD.
 *
 * WooCommerce utiliza este formato
 * para nuestras consultas de rango.
 */
function formatoFecha(
  fecha: Date
): string {
  const anio =
    fecha.getFullYear();

  const mes =
    String(
      fecha.getMonth() + 1
    ).padStart(2, "0");

  const dia =
    String(
      fecha.getDate()
    ).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

/**
 * Crea un rango completo para PostgreSQL.
 */
function crearRangoDB(
  inicio: Date,
  fin: Date
) {
  return {
    inicio:
      new Date(
        inicio.getFullYear(),
        inicio.getMonth(),
        inicio.getDate(),
        0,
        0,
        0,
        0
      ),

    fin:
      new Date(
        fin.getFullYear(),
        fin.getMonth(),
        fin.getDate(),
        23,
        59,
        59,
        999
      ),
  };
}

/**
 * ==========================================
 * ESTADO
 * ==========================================
 *
 * Esta función es utilizada por:
 *
 * GET /api/sync/status
 */
export function obtenerEstadoSincronizacion() {
  return {
    sincronizacion: {
      en_curso:
        sincronizacionEnCurso,

      ultima_ejecucion:
        ultimaSincronizacion,

      ultimo_resultado:
        ultimoResultadoSync,
    },

    conciliacion: {
      en_curso:
        conciliacionEnCurso,

      ultima_ejecucion:
        ultimaConciliacion,

      ultimo_resultado:
        ultimoResultadoConciliacion,
    },
  };
}

/**
 * ==========================================
 * SINCRONIZACION WOO → POSTGRESQL
 * ==========================================
 */
async function ejecutarSincronizacion() {
  /**
   * Evita ejecutar dos sincronizaciones
   * al mismo tiempo.
   */
  if (
    sincronizacionEnCurso
  ) {
    logWarn(
      "Sincronización omitida porque ya existe una ejecución en curso."
    );

    return;
  }

  sincronizacionEnCurso =
    true;

  const inicioProceso =
    Date.now();

  const resultados: Array<{
    tienda: string;
    ok: boolean;
    resultado?: unknown;
    error?: string;
  }> = [];

  try {
    const hoy =
      new Date();

    const desde =
      new Date();

    /**
     * Revisamos los últimos dos días.
     *
     * Esto permite detectar pedidos nuevos
     * y modificaciones recientes como:
     *
     * processing → completed
     * processing → cancelled
     * cambios de cantidades
     * cambios de totales
     */
    desde.setDate(
      desde.getDate() - 2
    );

    const fechaInicio =
      formatoFecha(desde);

    const fechaFin =
      formatoFecha(hoy);

    logInfo(
      "Iniciando sincronización automática.",
      {
        fechaInicio,
        fechaFin,
      }
    );

    for (
      const tienda of TIENDAS
    ) {
      try {
        logInfo(
          "Sincronizando tienda.",
          {
            tienda,
          }
        );

        const resultado =
          await sincronizarPedidos(
            tienda,
            fechaInicio,
            fechaFin
          );

        resultados.push({
          tienda,
          ok: true,
          resultado,
        });

        logInfo(
          "Sincronización de tienda terminada correctamente.",
          {
            tienda,
          }
        );

      } catch (
        error: any
      ) {
        const mensajeError =
          error?.response?.data
            ? JSON.stringify(
                error.response.data
              )
            : error?.message ||
              String(error);

        resultados.push({
          tienda,
          ok: false,
          error:
            mensajeError,
        });

        logError(
          "Error sincronizando tienda.",
          {
            tienda,
            error:
              mensajeError,
          }
        );

        /**
         * Guardamos alerta operativa,
         * evitando duplicados abiertos.
         */
        await crearAlertaSiNoExiste({
          type:
            "sync_failed",

          severity:
            "error",

          storeCode:
            tienda,

          message:
            `Falló la sincronización de ${tienda}.`,

          details: {
            error:
              mensajeError,
          },
        });
      }
    }

    ultimaSincronizacion =
      new Date().toISOString();

    ultimoResultadoSync =
      resultados;

    const duracionSegundos =
      (
        Date.now() -
        inicioProceso
      ) / 1000;

    logInfo(
      "Sincronización automática terminada.",
      {
        duracionSegundos:
          Number(
            duracionSegundos.toFixed(
              2
            )
          ),

        tiendas:
          resultados.length,

        correctas:
          resultados.filter(
            (item) =>
              item.ok
          ).length,

        errores:
          resultados.filter(
            (item) =>
              !item.ok
          ).length,
      }
    );

  } catch (
    error: any
  ) {
    const mensajeError =
      error?.message ||
      String(error);

    ultimoResultadoSync = {
      error:
        mensajeError,
    };

    logError(
      "Error general durante la sincronización automática.",
      {
        error:
          mensajeError,
      }
    );

  } finally {
    sincronizacionEnCurso =
      false;
  }
}

/**
 * ==========================================
 * CONCILIACION WOO ↔ POSTGRESQL
 * ==========================================
 */
async function ejecutarConciliacion() {
  if (
    conciliacionEnCurso
  ) {
    logWarn(
      "Conciliación omitida porque ya existe una ejecución en curso."
    );

    return;
  }

  conciliacionEnCurso =
    true;

  const inicioProceso =
    Date.now();

  const resultados: Array<{
    tienda: string;
    estado:
      | "ok"
      | "reparado"
      | "requiere_revision"
      | "error";
    pedidos_reparados?: number;
    solo_en_db?: number[];
    error?: string;
  }> = [];

  try {
    const hoy =
      new Date();

    const desde =
      new Date();

    desde.setDate(
      desde.getDate() - 2
    );

    const fechaInicio =
      formatoFecha(desde);

    const fechaFin =
      formatoFecha(hoy);

    const rango =
      crearRangoDB(
        desde,
        hoy
      );

    logInfo(
      "Iniciando conciliación automática.",
      {
        fechaInicio,
        fechaFin,
      }
    );

    for (
      const tienda of TIENDAS
    ) {
      try {
        logInfo(
          "Conciliando tienda.",
          {
            tienda,
          }
        );

        /**
         * Primera conciliación general.
         */
        const conciliacion =
          await conciliarTienda(
            tienda,
            fechaInicio,
            fechaFin,
            rango.inicio,
            rango.fin
          );

        /**
         * Siempre guardamos el resultado.
         */
        await guardarConciliacion(
          conciliacion
        );

        /**
         * Si Woo y PostgreSQL ya coinciden,
         * no necesitamos hacer nada más.
         */
        if (
          conciliacion.correcto
        ) {
          resultados.push({
            tienda,
            estado:
              "ok",
          });

          logInfo(
            "Conciliación correcta.",
            {
              tienda,
            }
          );

          continue;
        }

        /**
         * Encontramos diferencias.
         */
        logWarn(
          "Diferencias detectadas en conciliación.",
          {
            tienda,
            comparacion:
              conciliacion.comparacion,
          }
        );

        /**
         * Ejecutamos conciliación detallada
         * + autorreparación segura.
         */
        const reparacion =
          await conciliarYRepararTienda(
            tienda,
            fechaInicio,
            fechaFin,
            rango.inicio,
            rango.fin
          );

        const pedidosReparados =
          reparacion.reparaciones.filter(
            (item) =>
              item.ok
          ).length;

        /**
         * ==================================
         * REPARACION EXITOSA
         * ==================================
         */
        if (
          reparacion.despues.correcto
        ) {
          resultados.push({
            tienda,
            estado:
              "reparado",

            pedidos_reparados:
              pedidosReparados,
          });

          logInfo(
            "Diferencias reparadas automáticamente.",
            {
              tienda,

              pedidosReparados,
            }
          );

          continue;
        }

        /**
         * ==================================
         * REQUIERE INTERVENCION HUMANA
         * ==================================
         */

        resultados.push({
          tienda,

          estado:
            "requiere_revision",

          pedidos_reparados:
            pedidosReparados,

          solo_en_db:
            reparacion
              .despues
              .solo_en_db,
        });

        logError(
          "La conciliación continúa mostrando diferencias después de la autorreparación.",
          {
            tienda,

            pedidosReparados,

            soloEnDB:
              reparacion
                .despues
                .solo_en_db,

            diferencias:
              reparacion
                .despues
                .diferencias,
          }
        );

        /**
         * Guardamos una alerta persistente.
         */
        await crearAlertaSiNoExiste({
          type:
            "reconciliation_failed",

          severity:
            "error",

          storeCode:
            tienda,

          message:
            `La tienda ${tienda} continúa con diferencias después de la autorreparación.`,

          details: {
            pedidosReparados,

            soloEnDB:
              reparacion
                .despues
                .solo_en_db,

            diferencias:
              reparacion
                .despues
                .diferencias,
          },
        });

      } catch (
        error: any
      ) {
        const mensajeError =
          error?.response?.data
            ? JSON.stringify(
                error.response.data
              )
            : error?.message ||
              String(error);

        resultados.push({
          tienda,

          estado:
            "error",

          error:
            mensajeError,
        });

        logError(
          "Error conciliando tienda.",
          {
            tienda,

            error:
              mensajeError,
          }
        );

        await crearAlertaSiNoExiste({
          type:
            "reconciliation_error",

          severity:
            "error",

          storeCode:
            tienda,

          message:
            `Ocurrió un error conciliando ${tienda}.`,

          details: {
            error:
              mensajeError,
          },
        });
      }
    }

    ultimaConciliacion =
      new Date().toISOString();

    ultimoResultadoConciliacion =
      resultados;

    const duracionSegundos =
      (
        Date.now() -
        inicioProceso
      ) / 1000;

    logInfo(
      "Conciliación automática terminada.",
      {
        duracionSegundos:
          Number(
            duracionSegundos.toFixed(
              2
            )
          ),

        resultados,
      }
    );

  } catch (
    error: any
  ) {
    const mensajeError =
      error?.message ||
      String(error);

    ultimoResultadoConciliacion = {
      error:
        mensajeError,
    };

    logError(
      "Error general durante la conciliación automática.",
      {
        error:
          mensajeError,
      }
    );

  } finally {
    conciliacionEnCurso =
      false;
  }
}

/**
 * ==========================================
 * INICIALIZAR SCHEDULER
 * ==========================================
 */
export function iniciarSincronizacionAutomatica(
  intervaloSyncMinutos = 5,
  intervaloConciliacionMinutos = 60
) {
  const intervaloSyncMs =
    intervaloSyncMinutos *
    60 *
    1000;

  const intervaloConciliacionMs =
    intervaloConciliacionMinutos *
    60 *
    1000;

  logInfo(
    "Scheduler Bafar iniciado.",
    {
      sincronizacionMinutos:
        intervaloSyncMinutos,

      conciliacionMinutos:
        intervaloConciliacionMinutos,
    }
  );

  /**
   * Primera sincronización inmediatamente
   * después de arrancar Node.
   */
  ejecutarSincronizacion()
    .catch(
      (error) => {
        logError(
          "Error ejecutando sincronización inicial.",
          {
            error:
              error?.message ||
              String(error),
          }
        );
      }
    );

  /**
   * Esperamos 30 segundos antes
   * de la primera conciliación.
   *
   * Esto evita competir con el sync inicial.
   */
  setTimeout(
    () => {
      ejecutarConciliacion()
        .catch(
          (error) => {
            logError(
              "Error ejecutando conciliación inicial.",
              {
                error:
                  error?.message ||
                  String(error),
              }
            );
          }
        );
    },
    30 * 1000
  );

  /**
   * Sincronización periódica.
   */
  setInterval(
    () => {
      ejecutarSincronizacion()
        .catch(
          (error) => {
            logError(
              "Error en ejecución periódica de sincronización.",
              {
                error:
                  error?.message ||
                  String(error),
              }
            );
          }
        );
    },
    intervaloSyncMs
  );

  /**
   * Conciliación periódica.
   */
  setInterval(
    () => {
      ejecutarConciliacion()
        .catch(
          (error) => {
            logError(
              "Error en ejecución periódica de conciliación.",
              {
                error:
                  error?.message ||
                  String(error),
              }
            );
          }
        );
    },
    intervaloConciliacionMs
  );
}