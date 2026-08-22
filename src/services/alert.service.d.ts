type CrearAlertaInput = {
    type: string;
    severity: "warning" | "error" | "critical";
    storeCode?: string;
    message: string;
    details?: unknown;
};
/**
 * Evita generar una alerta idéntica
 * cada hora mientras el problema
 * todavía sigue abierto.
 */
export declare function crearAlertaSiNoExiste(datos: CrearAlertaInput): Promise<{
    id: number;
    type: string;
    severity: string;
    storeCode: string | null;
    message: string;
    details: import("@prisma/client/runtime/client").JsonValue | null;
    resolved: boolean;
    createdAt: Date;
    resolvedAt: Date | null;
}>;
export declare function resolverAlerta(id: number): Promise<{
    id: number;
    type: string;
    severity: string;
    storeCode: string | null;
    message: string;
    details: import("@prisma/client/runtime/client").JsonValue | null;
    resolved: boolean;
    createdAt: Date;
    resolvedAt: Date | null;
}>;
export {};
//# sourceMappingURL=alert.service.d.ts.map