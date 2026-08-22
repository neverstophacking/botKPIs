import dotenv from "dotenv";
dotenv.config();
export const tiendas = {
    carnemart: {
        codigo: "carnemart",
        nombre: "Carnemart",
        url: process.env.CARNEMART_WOO_URL ?? "",
        consumerKey: process.env.CARNEMART_WOO_CONSUMER_KEY ?? "",
        consumerSecret: process.env.CARNEMART_WOO_CONSUMER_SECRET ?? "",
    },
    yalo: {
        codigo: "yalo",
        nombre: "Yalo",
        url: process.env.YALO_WOO_URL ?? "",
        consumerKey: process.env.YALO_WOO_CONSUMER_KEY ?? "",
        consumerSecret: process.env.YALO_WOO_CONSUMER_SECRET ?? "",
    },
    pastora: {
        codigo: "pastora",
        nombre: "La Pastora",
        url: process.env.PASTORA_WOO_URL ?? "",
        consumerKey: process.env.PASTORA_WOO_CONSUMER_KEY ?? "",
        consumerSecret: process.env.PASTORA_WOO_CONSUMER_SECRET ?? "",
    },
};
export function obtenerTienda(codigo) {
    const codigoNormalizado = codigo.toLowerCase();
    return tiendas[codigoNormalizado] ?? null;
}
export function tiendaConfigurada(tienda) {
    return Boolean(tienda.url &&
        tienda.consumerKey &&
        tienda.consumerSecret);
}
//# sourceMappingURL=stores.js.map