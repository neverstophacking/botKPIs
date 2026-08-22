export declare function conciliarTienda(codigoTienda: string, fechaInicioTexto: string, fechaFinTexto: string, fechaInicioDB: Date, fechaFinDB: Date): Promise<{
    tienda: string;
    periodo: {
        desde: string;
        hasta: string;
    };
    correcto: boolean;
    comparacion: {
        pedidos_encontrados: {
            woo: number;
            db: number;
            coincide: boolean;
        };
        pedidos_validos: {
            woo: number;
            db: number;
            coincide: boolean;
        };
        ventas: {
            woo: number;
            db: number;
            coincide: boolean;
        };
        cantidad_vendida: {
            woo: number;
            db: number;
            coincide: boolean;
        };
        ticket_promedio: {
            woo: number;
            db: number;
            coincide: boolean;
        };
    };
}>;
//# sourceMappingURL=reconciliation.service.d.ts.map