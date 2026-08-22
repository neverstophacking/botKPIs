type DatosConciliacion = {
    tienda: string;
    periodo: {
        desde: string;
        hasta: string;
    };
    correcto: boolean;
    comparacion: Record<string, {
        woo: number;
        db: number;
        coincide: boolean;
    }>;
};
export declare function guardarConciliacion(resultado: DatosConciliacion): Promise<{
    id: number;
    storeCode: string;
    dateFrom: Date;
    dateTo: Date;
    ok: boolean;
    details: import("@prisma/client/runtime/client").JsonValue;
    createdAt: Date;
}>;
export {};
//# sourceMappingURL=reconciliation-log.service.d.ts.map