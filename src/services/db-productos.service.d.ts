export declare function calcularTopProductosDesdeDB(fechaInicio: Date, fechaFin: Date, limite?: number, codigoTienda?: string): Promise<{
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
//# sourceMappingURL=db-productos.service.d.ts.map