import type {
  Request,
  Response,
  NextFunction,
} from "express";

const API_KEY =
  process.env.BAFAR_N8N_API_KEY ?? "";

export function validarN8nApiKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const apiKey =
    req.header("x-bafar-api-key");

  if (!API_KEY) {
    console.error(
      "BAFAR_N8N_API_KEY no está configurada."
    );

    return res.status(500).json({
      ok: false,
      error:
        "Configuración de seguridad incompleta.",
    });
  }

  if (
    !apiKey ||
    apiKey !== API_KEY
  ) {
    return res.status(401).json({
      ok: false,
      error:
        "No autorizado.",
    });
  }

  next();
}