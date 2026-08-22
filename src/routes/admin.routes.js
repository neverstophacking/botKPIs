import { Router } from "express";
import { prisma } from "../config/prisma.js";
const router = Router();
router.get("/whatsapp-users", async (_req, res) => {
    try {
        const usuarios = await prisma.whatsAppUser.findMany({
            orderBy: {
                id: "asc",
            },
            select: {
                id: true,
                phone: true,
                name: true,
                role: true,
                storeCode: true,
                active: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return res.json({
            total: usuarios.length,
            usuarios,
        });
    }
    catch (error) {
        return res.status(500).json({
            error: "No fue posible consultar los usuarios.",
            detalle: error.message,
        });
    }
});
/**
 * ==========================================
 * ALERTAS ABIERTAS
 * ==========================================
 */
router.get("/alerts", async (_req, res) => {
    try {
        const alertas = await prisma.systemAlert.findMany({
            where: {
                resolved: false,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 100,
        });
        return res.json({
            total: alertas.length,
            alertas,
        });
    }
    catch (error) {
        return res.status(500).json({
            error: "No fue posible consultar las alertas.",
            detalle: error.message,
        });
    }
});
/**
 * ==========================================
 * RESOLVER ALERTA
 * ==========================================
 */
router.patch("/alerts/:id/resolve", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) ||
            id <= 0) {
            return res.status(400).json({
                error: "ID de alerta inválido.",
            });
        }
        const alerta = await prisma.systemAlert.update({
            where: {
                id,
            },
            data: {
                resolved: true,
                resolvedAt: new Date(),
            },
        });
        return res.json({
            ok: true,
            alerta,
        });
    }
    catch (error) {
        return res.status(500).json({
            error: "No fue posible resolver la alerta.",
            detalle: error.message,
        });
    }
});
export default router;
//# sourceMappingURL=admin.routes.js.map