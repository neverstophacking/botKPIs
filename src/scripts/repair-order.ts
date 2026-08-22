import {
  repararPedido,
} from "../services/order-repair.service.js";

import {
  prisma,
} from "../config/prisma.js";

async function main() {
  const args =
    process.argv.slice(2);

  const tienda =
    args[0];

  const wooOrderId =
    Number(
      args[1]
    );

  if (
    !tienda ||
    !wooOrderId
  ) {
    console.error("");
    console.error(
      "Debes indicar tienda y wooOrderId."
    );

    console.error("");
    console.error(
      "Ejemplo:"
    );

    console.error(
      "npm run repair:order -- carnemart 18472"
    );

    process.exitCode =
      1;

    return;
  }

  console.log("");
  console.log(
    "================================"
  );

  console.log(
    " REPARACION SELECTIVA"
  );

  console.log(
    "================================"
  );

  console.log(
    `Tienda: ${tienda}`
  );

  console.log(
    `Pedido: ${wooOrderId}`
  );

  const resultado =
    await repararPedido(
      tienda,
      wooOrderId
    );

  console.log("");
  console.log(
    "Pedido reparado correctamente."
  );

  console.log(
    JSON.stringify(
      resultado,
      null,
      2
    )
  );
}

main()
  .catch(
    (error) => {
      console.error("");
      console.error(
        "ERROR REPARANDO PEDIDO"
      );

      console.error(
        error.response?.data ||
        error.message ||
        error
      );

      process.exitCode =
        1;
    }
  )
  .finally(
    async () => {
      await prisma.$disconnect();
    }
  );