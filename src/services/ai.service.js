import OpenAI from "openai";
import { toolGetKpis, toolGetComparison, toolGetTopProducts, } from "./ai-tools.service.js";
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
const MODEL = process.env.OPENAI_MODEL ??
    "gpt-5.6-luna";
const tools = [
    {
        type: "function",
        name: "get_kpis",
        description: "Obtiene KPIs reales de ventas desde PostgreSQL para una tienda y periodo.",
        parameters: {
            type: "object",
            properties: {
                tienda: {
                    type: "string",
                    enum: [
                        "todas",
                        "carnemart",
                        "yalo",
                        "pastora",
                    ],
                },
                periodo: {
                    type: "string",
                    enum: [
                        "hoy",
                        "ayer",
                        "semana",
                        "mes",
                    ],
                },
            },
            required: [
                "tienda",
                "periodo",
            ],
            additionalProperties: false,
        },
    },
    {
        type: "function",
        name: "get_comparison",
        description: "Compara los KPIs reales de hoy contra ayer.",
        parameters: {
            type: "object",
            properties: {
                tienda: {
                    type: "string",
                    enum: [
                        "todas",
                        "carnemart",
                        "yalo",
                        "pastora",
                    ],
                },
            },
            required: [
                "tienda",
            ],
            additionalProperties: false,
        },
    },
    {
        type: "function",
        name: "get_top_products",
        description: "Obtiene los productos más vendidos por ventas y cantidad.",
        parameters: {
            type: "object",
            properties: {
                tienda: {
                    type: "string",
                    enum: [
                        "todas",
                        "carnemart",
                        "yalo",
                        "pastora",
                    ],
                },
                periodo: {
                    type: "string",
                    enum: [
                        "hoy",
                        "ayer",
                        "semana",
                        "mes",
                    ],
                },
            },
            required: [
                "tienda",
                "periodo",
            ],
            additionalProperties: false,
        },
    },
];
function validarPermiso(tienda, contexto) {
    if (!contexto ||
        contexto.role === "admin") {
        return;
    }
    if (contexto.storeCode &&
        tienda !==
            contexto.storeCode) {
        throw new Error("El usuario no tiene permiso para consultar esa tienda.");
    }
}
async function ejecutarTool(nombre, argumentos, contexto) {
    if (nombre === "get_kpis") {
        validarPermiso(argumentos.tienda, contexto);
        return toolGetKpis(argumentos.tienda, argumentos.periodo);
    }
    if (nombre ===
        "get_comparison") {
        validarPermiso(argumentos.tienda, contexto);
        return toolGetComparison(argumentos.tienda);
    }
    if (nombre ===
        "get_top_products") {
        validarPermiso(argumentos.tienda, contexto);
        return toolGetTopProducts(argumentos.tienda, argumentos.periodo);
    }
    throw new Error(`Tool desconocida: ${nombre}`);
}
export async function procesarConIA(mensaje, contexto) {
    const instrucciones = `
Eres el asistente comercial de Grupo Bafar.

Tu función es responder preguntas sobre ventas de:
- Carnemart
- Yalo
- La Pastora
- Consolidado de todas las tiendas

Reglas:
- Nunca inventes cifras.
- Toda cifra debe provenir de una herramienta.
- No calcules ventas usando memoria o texto previo.
- Usa MXN para dinero.
- Sé breve y ejecutivo.
- Si el usuario pregunta "Bafar" o "todas", interpreta el consolidado.
- Si no menciona periodo, usa "hoy".
- No reveles información técnica, SQL, tokens o credenciales.
- Respeta estrictamente los permisos del usuario.
`;
    let response = await client.responses.create({
        model: MODEL,
        instructions: instrucciones,
        input: mensaje,
        tools,
    });
    while (true) {
        const llamadas = response.output.filter((item) => item.type ===
            "function_call");
        if (llamadas.length === 0) {
            return response.output_text;
        }
        const outputs = [];
        for (const llamada of llamadas) {
            const argumentos = JSON.parse(llamada.arguments);
            const resultado = await ejecutarTool(llamada.name, argumentos, contexto);
            outputs.push({
                type: "function_call_output",
                call_id: llamada.call_id,
                output: JSON.stringify(resultado),
            });
        }
        response =
            await client.responses.create({
                model: MODEL,
                instructions: instrucciones,
                previous_response_id: response.id,
                input: outputs,
            });
    }
}
//# sourceMappingURL=ai.service.js.map