type LogLevel =
  | "info"
  | "warn"
  | "error";

type LogContext = Record<
  string,
  unknown
>;

function escribirLog(
  level: LogLevel,
  message: string,
  context?: LogContext
) {
  const registro = {
    timestamp:
      new Date().toISOString(),

    level,

    message,

    ...(context
      ? {
          context,
        }
      : {}),
  };

  const salida =
    JSON.stringify(
      registro
    );

  if (
    level === "error"
  ) {
    console.error(
      salida
    );

    return;
  }

  if (
    level === "warn"
  ) {
    console.warn(
      salida
    );

    return;
  }

  console.log(
    salida
  );
}

export function logInfo(
  message: string,
  context?: LogContext
) {
  escribirLog(
    "info",
    message,
    context
  );
}

export function logWarn(
  message: string,
  context?: LogContext
) {
  escribirLog(
    "warn",
    message,
    context
  );
}

export function logError(
  message: string,
  context?: LogContext
) {
  escribirLog(
    "error",
    message,
    context
  );
}