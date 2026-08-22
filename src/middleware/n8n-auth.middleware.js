const API_KEY = process.env.BAFAR_N8N_API_KEY ?? "";
export function validarN8nApiKey(req, res, next) {
    const apiKey = req.header("x-bafar-api-key");
    if (!API_KEY) {
        console.error("BAFAR_N8N_API_KEY no está configurada.");
        return res.status(500).json({
            ok: false,
            error: "Configuración de seguridad incompleta.",
        });
    }
    if (!apiKey ||
        apiKey !== API_KEY) {
        return res.status(401).json({
            ok: false,
            error: "No autorizado.",
        });
    }
    next();
}
//# sourceMappingURL=n8n-auth.middleware.js.map