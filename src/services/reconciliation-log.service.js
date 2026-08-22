import { prisma } from "../config/prisma.js";
function fechaDesdeTexto(fecha) {
    return new Date(`${fecha}T00:00:00`);
}
function fechaHastaTexto(fecha) {
    return new Date(`${fecha}T23:59:59.999`);
}
export async function guardarConciliacion(resultado) {
    return prisma.reconciliationRun.create({
        data: {
            storeCode: resultado.tienda,
            dateFrom: fechaDesdeTexto(resultado.periodo.desde),
            dateTo: fechaHastaTexto(resultado.periodo.hasta),
            ok: resultado.correcto,
            details: resultado.comparacion,
        },
    });
}
//# sourceMappingURL=reconciliation-log.service.js.map