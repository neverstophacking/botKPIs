import { prisma } from "../config/prisma.js";

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

export async function obtenerUsuarioPorTelefono(
  telefono: string
) {
  return prisma.whatsAppUser.findUnique({
    where: {
      phone: telefono,
    },
  });
}

export async function validarUsuarioWhatsApp(
  telefono: string
): Promise<ResultadoAutorizacion> {
  const usuario =
    await obtenerUsuarioPorTelefono(
      telefono
    );

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