import { Router } from "express";
import { procesarConIA, } from "../services/ai.service.js";
import { validarUsuarioWhatsApp, } from "../services/whatsapp-user.service.js";
import { validarN8nApiKey, } from "../middleware/n8n-auth.middleware.js";
const router = Router();
/**
 * Normaliza texto para comparaciones simples.
 */
function normalizarTexto(texto) {
    return texto
        .trim()
        .toLowerCase();
}
/**
 * Detecta saludos simples.
 */
function esSaludo(texto) {
    const saludos = [
        "hola",
        "buenos dias",
        "buenos días",
        "buenas tardes",
        "buenas noches",
        "hey",
        "que tal",
        "qué tal",
    ];
    return saludos.includes(normalizarTexto(texto));
}
/**
 * Detecta consultas generales donde todavía
 * no sabemos qué tienda quiere consultar.
 */
function requiereSeleccionTienda(texto) {
    const mensaje = normalizarTexto(texto);
    const consultas = [
        "bafar",
        "como vamos",
        "cómo vamos",
        "como vamos hoy",
        "cómo vamos hoy",
        "ventas",
        "ventas hoy",
        "ventas de hoy",
        "resumen",
        "resumen de hoy",
        "como van las ventas",
        "cómo van las ventas",
    ];
    return consultas.includes(mensaje);
}
/**
 * Convierte selecciones numéricas en
 * instrucciones naturales para OpenAI.
 */
function convertirSeleccionMenu(mensaje) {
    const texto = normalizarTexto(mensaje);
    if (texto === "1") {
        return "Dame el resumen de hoy de todas las tiendas";
    }
    if (texto === "2") {
        return "Dame el resumen de hoy de Carnemart";
    }
    if (texto === "3") {
        return "Dame el resumen de hoy de Yalo";
    }
    if (texto === "4") {
        return "Dame el resumen de hoy de La Pastora";
    }
    return mensaje;
}
/**
 * ==========================================
 * CHAT PARA N8N
 * ==========================================
 *
 * POST /api/n8n/chat
 *
 * Body:
 *
 * {
 *   "telefono": "521XXXXXXXXXX",
 *   "mensaje": "¿Cómo vamos hoy?"
 * }
 */
router.post("/chat", validarN8nApiKey, async (req, res) => {
    try {
        const { telefono, mensaje, } = req.body;
        /**
         * ------------------------------
         * VALIDAR TELEFONO
         * ------------------------------
         */
        if (!telefono ||
            typeof telefono !== "string") {
            return res.json({
                ok: false,
                tipo: "telefono_invalido",
                respuesta: "No fue posible identificar el número de teléfono.",
            });
        }
        /**
         * ------------------------------
         * VALIDAR MENSAJE
         * ------------------------------
         */
        if (!mensaje ||
            typeof mensaje !== "string") {
            return res.json({
                ok: false,
                tipo: "mensaje_invalido",
                respuesta: "No recibí un mensaje válido.",
            });
        }
        /**
         * ------------------------------
         * AUTORIZACION
         * ------------------------------
         */
        const acceso = await validarUsuarioWhatsApp(telefono);
        if (!acceso.autorizado) {
            return res.json({
                ok: false,
                tipo: "acceso_denegado",
                respuesta: [
                    "BAFAR - Commerce Intelligence",
                    "",
                    "Tu número no está autorizado para consultar esta información.",
                ].join("\n"),
            });
        }
        const usuario = acceso.usuario;
        const textoNormalizado = normalizarTexto(mensaje);
        /**
         * ------------------------------
         * SALUDO
         * ------------------------------
         */
        if (esSaludo(mensaje)) {
            return res.json({
                ok: true,
                tipo: "saludo",
                usuario: {
                    nombre: usuario.name,
                    rol: usuario.role,
                    tienda: usuario.storeCode,
                },
                respuesta: [
                    `Hola ${usuario.name}, ¿en qué puedo ayudarte?`,
                    "",
                    "Puedes preguntarme por ventas, pedidos, productos o comparativos de Grupo Bafar.",
                    "",
                    "Por ejemplo:",
                    "",
                    "• ¿Cómo vamos hoy?",
                    "• ¿Cómo va Carnemart?",
                    "• ¿Cómo va Yalo esta semana?",
                    "• Productos más vendidos de La Pastora",
                    "• Comparar todas las tiendas contra ayer",
                ].join("\n"),
            });
        }
        /**
         * ------------------------------
         * MENU BAFAR
         * ------------------------------
         */
        if (requiereSeleccionTienda(mensaje)) {
            return res.json({
                ok: true,
                tipo: "seleccionar_tienda",
                usuario: {
                    nombre: usuario.name,
                    rol: usuario.role,
                    tienda: usuario.storeCode,
                },
                respuesta: [
                    `Claro ${usuario.name}.`,
                    "",
                    "¿Qué tienda quieres consultar?",
                    "",
                    "1. Todas las tiendas",
                    "2. Carnemart",
                    "3. Yalo",
                    "4. La Pastora",
                    "",
                    "También puedes escribir directamente el nombre de la tienda.",
                ].join("\n"),
            });
        }
        /**
         * ------------------------------
         * CONVERTIR OPCIONES DEL MENU
         * ------------------------------
         */
        const mensajeProcesado = convertirSeleccionMenu(mensaje);
        /**
         * ------------------------------
         * PROCESAR CON OPENAI
         * ------------------------------
         */
        const respuesta = await procesarConIA(mensajeProcesado, {
            name: usuario.name,
            role: usuario.role,
            storeCode: usuario.storeCode,
        });
        /**
         * ------------------------------
         * RESPUESTA FINAL
         * ------------------------------
         */
        return res.json({
            ok: true,
            tipo: "respuesta_bafar",
            usuario: {
                nombre: usuario.name,
                rol: usuario.role,
                tienda: usuario.storeCode,
            },
            mensaje_original: mensaje,
            mensaje_procesado: mensajeProcesado,
            respuesta,
        });
    }
    catch (error) {
        console.error("");
        console.error("ERROR N8N CHAT");
        console.error("");
        console.error(error.response?.data ||
            error.message ||
            error);
        return res.json({
            ok: false,
            tipo: "error",
            respuesta: "En este momento no fue posible consultar la información de Bafar. Intenta nuevamente.",
            detalle: process.env.NODE_ENV ===
                "development"
                ? error.message
                : undefined,
        });
    }
});
export default router;
//# sourceMappingURL=n8n.routes.js.map