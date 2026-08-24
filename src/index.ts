import express from "express";
import dbKpiRoutes from "./routes/db-kpi.routes.js";
import { iniciarSincronizacionAutomatica, obtenerEstadoSincronizacion, } from "./services/scheduler.service.js";
import adminRoutes from "./routes/admin.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import n8nRoutes from "./routes/n8n.routes.js";

const app = express();

const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());


app.use(
  "/api/db/kpis",
  dbKpiRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/ai",
  aiRoutes
);

app.use(
  "/api/n8n",
  n8nRoutes
);

app.get("/", (_req, res) => {
  res.json({
    proyecto:
      "Bafar Commerce Intelligence",

    estado:
      "funcionando",
  });
});

app.get(
  "/api/sync/status",
  (_req, res) => {
    res.json(
      obtenerEstadoSincronizacion()
    );
  }
);



app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor iniciado en puerto ${PORT}`);
});

iniciarSincronizacionAutomatica(5, 60);