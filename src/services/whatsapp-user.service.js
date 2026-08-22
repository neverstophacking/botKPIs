import { prisma } from "../config/prisma.js";
export async function obtenerUsuarioPorTelefono(telefono) {
    return prisma.whatsAppUser.findUnique({
        where: {
            phone: telefono,
        },
    });
}
export async function validarUsuarioWhatsApp(telefono) {
    const usuario = await obtenerUsuarioPorTelefono(telefono);
    if (!usuario) {
        return {
            autorizado: false,
            motivo: "usuario_no_registrado",
            usuario: null,
        };
    }
    if (!usuario.active) {
        return {
            autorizado: false,
            motivo: "usuario_inactivo",
            usuario,
        };
    }
    return {
        autorizado: true,
        motivo: null,
        usuario,
    };
}
//# sourceMappingURL=whatsapp-user.service.js.map