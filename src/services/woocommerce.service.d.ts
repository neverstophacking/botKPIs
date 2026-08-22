/**
 * Consulta todos los pedidos de un solo día.
 */
export declare function obtenerPedidosPorFecha(codigoTienda: string, fecha: string): Promise<any[]>;
export declare function obtenerPedidosPorRango(codigoTienda: string, fechaInicio: string, fechaFin: string): Promise<any[]>;
export declare function obtenerPedidoPorId(codigoTienda: string, wooOrderId: number): Promise<any>;
//# sourceMappingURL=woocommerce.service.d.ts.map