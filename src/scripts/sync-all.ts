import { sincronizarPedidos } from "../services/sync.service.js";
import { prisma } from "../config/prisma.js";

function formatoFecha(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

async function main() {
  const hoy = new Date();

  const desde = new Date();
  desde.setDate(desde.getDate() - 2);

  const fechaInicio = formatoFecha(desde);
  const fechaFin = formatoFecha(hoy);

  const tiendas = [
    "carnemart",
    "yalo",
    "pastora",
  ];

  console.log("");
  console.log("==============================");
  console.log(" SINCRONIZACION GENERAL BAFAR");
  console.log("==============================");
  console.log("");
  console.log(`Desde: ${fechaInicio}`);
  console.log(`Hasta: ${fechaFin}`);
  console.log("");

  for (const tienda of tiendas) {
    console.log("");
    console.log("------------------------------");
    console.log(`SINCRONIZANDO: ${tienda}`);
    console.log("------------------------------");

    try {
      const resultado =
        await sincronizarPedidos(
          tienda,
          fechaInicio,
          fechaFin
        );

      console.log(
        `${tienda}: ${resultado.pedidos_sincronizados} pedidos sincronizados`
      );
    } catch (error: any) {
      console.error(
        `ERROR sincronizando ${tienda}:`
      );

      console.error(
        error.response?.data ||
        error.message ||
        error
      );
    }
  }

  console.log("");
  console.log("==============================");
  console.log(" SINCRONIZACION TERMINADA");
  console.log("==============================");
  console.log("");
}

main()
  .catch((error) => {
    console.error(
      "ERROR GENERAL DE SINCRONIZACION"
    );

    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });