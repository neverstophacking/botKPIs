type Tienda = "todas" | "carnemart" | "yalo" | "pastora";
type Periodo = "hoy" | "ayer" | "semana" | "mes";
export declare function toolGetKpis(tienda: Tienda, periodo: Periodo): Promise<{
    pedidos_encontrados: number;
    pedidos_validos: number;
    ventas: number;
    cantidad_vendida: number;
    ticket_promedio: number;
} | {
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
export declare function toolGetComparison(tienda: Tienda): Promise<{
    hoy: {
        pedidos_encontrados: number;
        pedidos_validos: number;
        ventas: number;
        cantidad_vendida: number;
        ticket_promedio: number;
    };
    ayer: {
        pedidos_encontrados: number;
        pedidos_validos: number;
        ventas: number;
        cantidad_vendida: number;
        ticket_promedio: number;
    };
    variaciones: {
        ventas: number | null;
        pedidos: number | null;
        ticket: number | null;
    };
}>;
export declare function toolGetTopProducts(tienda: Tienda, periodo: Periodo): Promise<{
    top_por_cantidad: {
        posicion: number;
        nombre: string;
        sku: string | null;
        cantidad: number;
        ventas: number;
        tiendas: string[];
    }[];
    top_por_ventas: {
        posicion: number;
        nombre: string;
        sku: string | null;
        cantidad: number;
        ventas: number;
        tiendas: string[];
    }[];
}>;
export {};
//# sourceMappingURL=ai-tools.service.d.ts.map