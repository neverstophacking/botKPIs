import dotenv from "dotenv";

dotenv.config();

export type CodigoTienda =
  | "carnemart"
  | "yalo"
  | "pastora";

export interface ConfiguracionTienda {
  codigo: CodigoTienda;
  nombre: string;
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

export const tiendas: Record<
  CodigoTienda,
  ConfiguracionTienda
> = {
  carnemart: {
    codigo: "carnemart",
    nombre: "Carnemart",
    url: process.env.CARNEMART_WOO_URL ?? "",
    consumerKey:
      process.env.CARNEMART_WOO_CONSUMER_KEY ?? "",
    consumerSecret:
      process.env.CARNEMART_WOO_CONSUMER_SECRET ?? "",
  },

  yalo: {
    codigo: "yalo",
    nombre: "Yalo",
    url: process.env.YALO_WOO_URL ?? "",
    consumerKey:
      process.env.YALO_WOO_CONSUMER_KEY ?? "",
    consumerSecret:
      process.env.YALO_WOO_CONSUMER_SECRET ?? "",
  },

  pastora: {
    codigo: "pastora",
    nombre: "La Pastora",
    url: process.env.PASTORA_WOO_URL ?? "",
    consumerKey:
      process.env.PASTORA_WOO_CONSUMER_KEY ?? "",
    consumerSecret:
      process.env.PASTORA_WOO_CONSUMER_SECRET ?? "",
  },
};

export function obtenerTienda(
  codigo: string
): ConfiguracionTienda | null {
  const codigoNormalizado =
    codigo.toLowerCase() as CodigoTienda;

  return tiendas[codigoNormalizado] ?? null;
}

export function tiendaConfigurada(
  tienda: ConfiguracionTienda
): boolean {
  return Boolean(
    tienda.url &&
    tienda.consumerKey &&
    tienda.consumerSecret
  );
}