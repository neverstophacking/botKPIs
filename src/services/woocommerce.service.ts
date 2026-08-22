import axios from "axios";

import {
  obtenerTienda,
  tiendaConfigurada,
} from "../config/stores.js";

/**
 * Consulta todos los pedidos de un solo día.
 */
export async function obtenerPedidosPorFecha(
  codigoTienda: string,
  fecha: string
) {
  return obtenerPedidosPorRango(
    codigoTienda,
    fecha,
    fecha
  );
}

/**
 * Consulta TODOS los pedidos de una tienda
 * dentro de un rango de fechas.
 *
 * Incluye paginación automática.
 */
const inicioConsulta = Date.now();
export async function obtenerPedidosPorRango(
  codigoTienda: string,
  fechaInicio: string,
  fechaFin: string
) {
  const tienda = obtenerTienda(codigoTienda);

  if (!tienda) {
    throw new Error(
      `La tienda "${codigoTienda}" no existe.`
    );
  }

  if (!tiendaConfigurada(tienda)) {
    throw new Error(
      `La tienda "${tienda.nombre}" no tiene configuradas sus credenciales.`
    );
  }

  const after =
    `${fechaInicio}T00:00:00`;

  const before =
    `${fechaFin}T23:59:59`;

  const pedidos: any[] = [];

  let pagina = 1;
  let totalPaginas = 1;

  console.log("");
  console.log("==============================");
  console.log(`TIENDA: ${tienda.nombre}`);
  console.log("==============================");
  console.log(`Desde: ${fechaInicio}`);
  console.log(`Hasta: ${fechaFin}`);

  do {
    console.log(
      `Consultando página ${pagina}...`
    );

    const response = await axios.get(
      `${tienda.url}/wp-json/wc/v3/orders`,
      {
        params: {
          after,
          before,
          per_page: 100,
          page: pagina,
        },

        auth: {
          username: tienda.consumerKey,
          password: tienda.consumerSecret,
        },

        timeout: 30000,
      }
    );

    const pedidosPagina = response.data;

    pedidos.push(...pedidosPagina);

    const totalPedidos = Number(
      response.headers["x-wp-total"] ??
        pedidosPagina.length
    );

    totalPaginas = Number(
      response.headers["x-wp-totalpages"] ?? 1
    );

    console.log(
      `Pedidos página: ${pedidosPagina.length}`
    );

    console.log(
      `Total WooCommerce: ${totalPedidos}`
    );

    console.log(
      `Total páginas: ${totalPaginas}`
    );

    pagina++;

  } while (pagina <= totalPaginas);

  console.log(
    `Pedidos descargados: ${pedidos.length}`
  );

  console.log("==============================");
  console.log("");

  const finConsulta = Date.now();

const segundos =
  (finConsulta - inicioConsulta) / 1000;

console.log(
  `Tiempo total: ${segundos.toFixed(2)} segundos`
);

  return pedidos;
}

export async function obtenerPedidoPorId(
  codigoTienda: string,
  wooOrderId: number
) {
  const tienda =
    obtenerTienda(
      codigoTienda
    );

  if (!tienda) {
    throw new Error(
      `La tienda "${codigoTienda}" no existe.`
    );
  }

  if (
    !tiendaConfigurada(
      tienda
    )
  ) {
    throw new Error(
      `La tienda "${codigoTienda}" no está correctamente configurada.`
    );
  }

  const url =
    `${tienda.url.replace(/\/$/, "")}` +
    `/wp-json/wc/v3/orders/${wooOrderId}`;

  const respuesta =
    await axios.get(
      url,
      {
        auth: {
          username:
            tienda.consumerKey,

          password:
            tienda.consumerSecret,
        },

        timeout:
          30000,
      }
    );

  return respuesta.data;
}