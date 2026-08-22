import { Router } from "express";

import {
  procesarConIA,
} from "../services/ai.service.js";

import {
  validarUsuarioWhatsApp,
} from "../services/whatsapp-user.service.js";

const router = Router();

router.post(
  "/chat",
  async (req, res) => {
    try {
      const {
        telefono,
        mensaje,
      } = req.body;

      if (
        !telefono ||
        typeof telefono !== "string"
      ) {
        return res.status(400).json({
          error:
            "Debes enviar el teléfono del usuario.",
          ejemplo: {
            telefono:
              "521XXXXXXXXXX",
            mensaje:
              "¿Cómo vamos hoy?",
          },
        });
      }

      if (
        !mensaje ||
        typeof mensaje !== "string"
      ) {
        return res.status(400).json({
          error:
            "Debes enviar un mensaje.",
        });
      }

      /**
       * --------------------------------
       * VALIDAR USUARIO
       * --------------------------------
       */

      const acceso =
        await validarUsuarioWhatsApp(
          telefono
        );

      if (!acceso.autorizado) {
        return res.status(403).json({
          error:
            "Usuario no autorizado.",

          motivo:
            acceso.motivo,
        });
      }

      const usuario =
        acceso.usuario!;

      /**
       * --------------------------------
       * PROCESAR CON OPENAI
       * --------------------------------
       *
       * Los permisos vienen de PostgreSQL,
       * nunca del Body recibido.
       */

      const respuesta =
        await procesarConIA(
          mensaje,
          {
            name:
              usuario.name,

            role:
              usuario.role,

            storeCode:
              usuario.storeCode,
          }
        );

      return res.json({
        usuario: {
          name:
            usuario.name,

          role:
            usuario.role,

          storeCode:
            usuario.storeCode,
        },

        respuesta,
      });

    } catch (error: any) {
      console.error(
        "ERROR EN AI CHAT:"
      );

      console.error(
        error.response?.data ||
        error.message ||
        error
      );

      return res.status(500).json({
        error:
          "No fue posible procesar la consulta con IA.",

        detalle:
          error.message,
      });
    }
  }
);

export default router;