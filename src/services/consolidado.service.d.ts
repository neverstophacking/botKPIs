export declare function calcularConsolidado(fechaInicio: Date, fechaFin: Date): Promise<{
    consolidado: {
        pedidos_encontrados: number;
        pedidos_validos: number;
        ventas: number;
        cantidad_vendida: number;
        ticket_promedio: number;
    };
    tiendas: {
        pedidos_encontrados: number;
        pedidos_validos: number;
        ventas: number;
        cantidad_vendida: number;
        ticket_promedio: number;
        tienda: string;
    }[];
}>;
export declare function calcularVariacion(actual: number, anterior: number): number | null;
//# sourceMappingURL=consolidado.service.d.ts.map