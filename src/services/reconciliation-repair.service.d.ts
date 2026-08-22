export declare function conciliarYRepararTienda(codigoTienda: string, fechaInicioTexto: string, fechaFinTexto: string, fechaInicioDB: Date, fechaFinDB: Date): Promise<{
    tienda: string;
    antes: {
        tienda: string;
        periodo: {
            desde: string;
            hasta: string;
        };
        correcto: boolean;
        resumen: {
            pedidos_woo: number;
            pedidos_db: number;
            solo_en_woo: number;
            solo_en_db: number;
            pedidos_con_diferencias: number;
        };
        solo_en_woo: number[];
        solo_en_db: number[];
        diferencias: {
            wooOrderId: number;
            status?: {
                woo: string;
                db: string;
            };
            total?: {
                woo: number;
                db: number;
            };
            cantidad?: {
                woo: number;
                db: number;
            };
        }[];
    };
    reparaciones: {
        wooOrderId: number;
        ok: boolean;
        error?: string;
    }[];
    despues: {
        tienda: string;
        periodo: {
            desde: string;
            hasta: string;
        };
        correcto: boolean;
        resumen: {
            pedidos_woo: number;
            pedidos_db: number;
            solo_en_woo: number;
            solo_en_db: number;
            pedidos_con_diferencias: number;
        };
        solo_en_woo: number[];
        solo_en_db: number[];
        diferencias: {
            wooOrderId: number;
            status?: {
                woo: string;
                db: string;
            };
            total?: {
                woo: number;
                db: number;
            };
            cantidad?: {
                woo: number;
                db: number;
            };
        }[];
    };
    reparado: boolean;
    requiere_revision_manual: boolean;
}>;
//# sourceMappingURL=reconciliation-repair.service.d.ts.map