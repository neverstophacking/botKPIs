/**
 * ==========================================
 * ESTADO
 * ==========================================
 *
 * Esta función es utilizada por:
 *
 * GET /api/sync/status
 */
export declare function obtenerEstadoSincronizacion(): {
    sincronizacion: {
        en_curso: boolean;
        ultima_ejecucion: string | null;
        ultimo_resultado: unknown;
    };
    conciliacion: {
        en_curso: boolean;
        ultima_ejecucion: string | null;
        ultimo_resultado: unknown;
    };
};
/**
 * ==========================================
 * INICIALIZAR SCHEDULER
 * ==========================================
 */
export declare function iniciarSincronizacionAutomatica(intervaloSyncMinutos?: number, intervaloConciliacionMinutos?: number): void;
//# sourceMappingURL=scheduler.service.d.ts.map