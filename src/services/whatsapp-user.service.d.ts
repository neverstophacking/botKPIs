export type ResultadoAutorizacion = {
    autorizado: boolean;
    motivo: string | null;
    usuario: null | {
        id: number;
        phone: string;
        name: string;
        role: string;
        storeCode: string | null;
        active: boolean;
    };
};
export declare function obtenerUsuarioPorTelefono(telefono: string): Promise<{
    id: number;
    phone: string;
    name: string;
    role: string;
    storeCode: string | null;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
} | null>;
export declare function validarUsuarioWhatsApp(telefono: string): Promise<ResultadoAutorizacion>;
//# sourceMappingURL=whatsapp-user.service.d.ts.map