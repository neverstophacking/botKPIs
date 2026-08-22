function escribirLog(level, message, context) {
    const registro = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...(context
            ? {
                context,
            }
            : {}),
    };
    const salida = JSON.stringify(registro);
    if (level === "error") {
        console.error(salida);
        return;
    }
    if (level === "warn") {
        console.warn(salida);
        return;
    }
    console.log(salida);
}
export function logInfo(message, context) {
    escribirLog("info", message, context);
}
export function logWarn(message, context) {
    escribirLog("warn", message, context);
}
export function logError(message, context) {
    escribirLog("error", message, context);
}
//# sourceMappingURL=log.service.js.map