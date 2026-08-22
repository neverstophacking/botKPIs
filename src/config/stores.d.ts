export type CodigoTienda = "carnemart" | "yalo" | "pastora";
export interface ConfiguracionTienda {
    codigo: CodigoTienda;
    nombre: string;
    url: string;
    consumerKey: string;
    consumerSecret: string;
}
export declare const tiendas: Record<CodigoTienda, ConfiguracionTienda>;
export declare function obtenerTienda(codigo: string): ConfiguracionTienda | null;
export declare function tiendaConfigurada(tienda: ConfiguracionTienda): boolean;
//# sourceMappingURL=stores.d.ts.map