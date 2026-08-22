# Bafar WooCommerce Backend

Backend de integración para las tiendas WooCommerce de Bafar.

El sistema centraliza información de las tiendas en PostgreSQL y proporciona servicios para:

- Sincronización WooCommerce → PostgreSQL.
- Consulta de KPIs.
- Consulta consolidada de las tiendas.
- Consulta de productos.
- Integración con OpenAI.
- Integración con n8n.
- Atención mediante WhatsApp.
- Enrutamiento entre consultas comerciales y generación de tickets en Odoo.
- Control de usuarios autorizados.
- Conciliación WooCommerce vs PostgreSQL.
- Reparación automática de diferencias seguras.
- Alertas operativas.
- Sincronización automática programada.

---

# 1. Arquitectura

La arquitectura general es:

```text
                    ┌──────────────────┐
                    │     WhatsApp     │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │       n8n        │
                    │   Orquestador    │
                    └────────┬─────────┘
                             │
                             ▼
              POST /api/n8n/chat
                             │
                             ▼
              ┌────────────────────────┐
              │   Backend TypeScript   │
              │      Node / Express    │
              └───────────┬────────────┘
                          │
              ┌───────────┼────────────┐
              │           │            │
              ▼           ▼            ▼
         PostgreSQL    OpenAI      WooCommerce
                                      │
                         ┌────────────┼────────────┐
                         ▼            ▼            ▼
                     Carnemart       Yalo      La Pastora
```

El flujo para tickets de soporte se enruta desde n8n hacia el workflow correspondiente de Odoo.

---

# 2. Tecnologías

El proyecto utiliza principalmente:

- Node.js
- TypeScript
- Express
- Prisma ORM
- PostgreSQL
- WooCommerce REST API
- OpenAI API
- n8n
- WhatsApp Business / Cloud API
- Odoo
- PM2 en producción
- Nginx como reverse proxy
- HTTPS

---

# 3. Requisitos

Para desarrollo:

- Node.js
- npm
- PostgreSQL
- Git
- acceso a las tres tiendas WooCommerce
- credenciales de OpenAI
- instancia de n8n

Para producción se recomienda:

- Ubuntu Server / VPS Linux
- Node.js LTS
- PostgreSQL
- Git
- PM2
- Nginx
- dominio o subdominio
- certificado SSL

---

# 4. Estructura del proyecto

```text
bafar-woocommerce/
│
├── src/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── scripts/
│   ├── services/
│   └── index.ts
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── n8n/
│   └── workflows exportados
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── prisma.config.ts
├── tsconfig.json
└── README.md
```

---

# 5. Clonar el proyecto

En el servidor o equipo donde se instalará:

```bash
git clone URL_DEL_REPOSITORIO
```

Entrar al proyecto:

```bash
cd bafar-woocommerce
```

---

# 6. Instalar dependencias

Ejecutar:

```bash
npm ci
```

Para desarrollo también puede utilizarse:

```bash
npm install
```

En despliegues reproducibles se recomienda `npm ci`.

---

# 7. Variables de entorno

El archivo `.env` NO debe almacenarse en Git.

Crear:

```text
.env
```

partiendo de:

```text
.env.example
```

Ejemplo:

```env
NODE_ENV=production

PORT=3000

DATABASE_URL=postgresql://USUARIO:PASSWORD@HOST:5432/bafar?schema=public

OPENAI_API_KEY=
OPENAI_MODEL=

BAFAR_N8N_API_KEY=

CARNEMART_URL=
CARNEMART_CONSUMER_KEY=
CARNEMART_CONSUMER_SECRET=

YALO_URL=
YALO_CONSUMER_KEY=
YALO_CONSUMER_SECRET=

PASTORA_URL=
PASTORA_CONSUMER_KEY=
PASTORA_CONSUMER_SECRET=
```

Los nombres exactos deben mantenerse sincronizados con los utilizados en `src/config` y los servicios correspondientes.

## Seguridad

Nunca subir al repositorio:

```text
.env
.env.production
tokens
passwords
API keys
Consumer Secrets
DATABASE_URL real
credenciales de WhatsApp
credenciales de Odoo
backups de PostgreSQL
```

Si una credencial llega accidentalmente a Git, debe considerarse comprometida y debe rotarse.

---

# 8. Configurar PostgreSQL

Crear la base de datos destinada al proyecto.

Ejemplo:

```sql
CREATE DATABASE bafar;
```

Crear un usuario específico para la aplicación en producción y otorgarle únicamente los permisos necesarios.

Configurar después `DATABASE_URL` en `.env`.

Ejemplo:

```env
DATABASE_URL=postgresql://bafar_app:PASSWORD@127.0.0.1:5432/bafar?schema=public
```

No utilizar contraseñas simples.

---

# 9. Prisma

Comprobar que Prisma reconoce el esquema:

```bash
npx prisma validate
```

Generar Prisma Client:

```bash
npx prisma generate
```

## Desarrollo

Para crear nuevas migraciones:

```bash
npx prisma migrate dev --name nombre_migracion
```

## Producción

NO utilizar:

```bash
npx prisma migrate dev
```

en producción.

Utilizar:

```bash
npx prisma migrate deploy
```

Esto aplica únicamente las migraciones ya almacenadas en:

```text
prisma/migrations/
```

---

# 10. Compilar el proyecto

Ejecutar:

```bash
npm run build
```

La compilación debe terminar con:

```text
0 errores
```

El resultado normalmente se genera en:

```text
dist/
```

No es necesario almacenar `dist/` en Git si el servidor realiza el build durante el despliegue.

---

# 11. Ejecutar en desarrollo

```bash
npm run dev
```

El backend normalmente quedará disponible en:

```text
http://localhost:3000
```

---

# 12. Ejecutar compilación de producción

Primero:

```bash
npm run build
```

Después:

```bash
npm start
```

El script de producción debe ejecutar el JavaScript compilado, por ejemplo:

```json
{
  "start": "node dist/index.js"
}
```

---

# 13. Sincronización WooCommerce

El backend sincroniza información de:

```text
Carnemart
Yalo
La Pastora
```

hacia PostgreSQL.

La base PostgreSQL es utilizada posteriormente para las consultas operativas y KPIs del bot.

Esto evita consultar las tres APIs de WooCommerce cada vez que un usuario hace una pregunta.

---

# 14. Sincronización automática

El scheduler ejecuta aproximadamente:

```text
WooCommerce → PostgreSQL
cada 5 minutos
```

El intervalo puede modificarse desde la configuración correspondiente del scheduler.

El proceso consulta pedidos recientes para detectar:

- pedidos nuevos;
- cambios de estado;
- cambios de totales;
- cambios relevantes del pedido.

Existe protección para evitar ejecutar dos sincronizaciones simultáneamente dentro del mismo proceso Node.

---

# 15. Conciliación automática

Además de sincronizar, el sistema compara:

```text
WooCommerce
      ↕
PostgreSQL
```

La conciliación se ejecuta con menor frecuencia que la sincronización.

Configuración prevista:

```text
Sincronización: cada 5 minutos
Conciliación:   cada 60 minutos
```

La conciliación detecta diferencias entre ambos sistemas.

---

# 16. Autorreparación

Cuando se detecta una diferencia segura, el backend puede volver a consultar el pedido en WooCommerce y actualizar PostgreSQL.

Se pueden reparar automáticamente casos como:

```text
Pedido existe en Woo pero no en PostgreSQL
Status diferente
Total diferente
Items diferentes
Cantidades diferentes
```

El sistema NO debe borrar automáticamente un pedido que exista únicamente en PostgreSQL.

Caso:

```text
PostgreSQL tiene pedido
WooCommerce no lo devuelve
```

Resultado:

```text
REQUIERE REVISION
```

Esto evita pérdida accidental de información.

---

# 17. Scripts administrativos

Los principales scripts disponibles son:

## Sincronizar todas las tiendas

```bash
npm run sync:all
```

## Conciliación general

```bash
npm run reconcile:all
```

## Conciliación detallada

```bash
npm run reconcile:detail
```

## Conciliación con reparación

```bash
npm run reconcile:repair
```

## Reparar un pedido específico

Ejemplo:

```bash
npm run repair:order -- carnemart 18472
```

Estos scripts deben utilizarse para diagnóstico y administración.

---

# 18. Usuarios de WhatsApp

Los usuarios autorizados para consultar información comercial se almacenan en PostgreSQL.

La tabla correspondiente permite definir información como:

```text
phone
name
role
storeCode
active
```

Ejemplo conceptual:

```text
Administrador
role = admin
storeCode = NULL

Usuario de tienda
role = user
storeCode = carnemart
```

Un administrador puede consultar información consolidada.

Un usuario restringido debe consultar únicamente las tiendas que tenga autorizadas.

---

# 19. Flujo del bot

Ejemplo:

```text
Usuario:
Hola

Bot:
Hola <nombre>, ¿en qué puedo ayudarte?
```

Después el sistema interpreta la intención.

## Consulta comercial

```text
¿Cómo vamos hoy?
```

Flujo:

```text
WhatsApp
   ↓
n8n
   ↓
Backend
   ↓
Validar usuario
   ↓
OpenAI
   ↓
Tool correspondiente
   ↓
PostgreSQL
   ↓
Respuesta
```

## Ticket

```text
Quiero generar un ticket
```

Flujo:

```text
WhatsApp
   ↓
n8n
   ↓
detección de intención
   ↓
workflow de tickets
   ↓
Odoo
```

---

# 20. OpenAI

OpenAI se utiliza para interpretar lenguaje natural y generar respuestas.

La IA NO debe inventar cifras comerciales.

Los datos deben obtenerse mediante las herramientas del backend.

Arquitectura:

```text
Pregunta
   ↓
OpenAI
   ↓
Function / Tool Call
   ↓
Backend
   ↓
PostgreSQL
   ↓
Resultado real
   ↓
OpenAI
   ↓
Respuesta natural
```

La API key debe mantenerse exclusivamente en variables de entorno.

---

# 21. Integración n8n

El endpoint principal utilizado por n8n es:

```text
POST /api/n8n/chat
```

En desarrollo:

```text
http://localhost:3000/api/n8n/chat
```

Cuando se utiliza ngrok únicamente para pruebas:

```text
https://URL-NGROK/api/n8n/chat
```

En producción:

```text
https://api.DOMINIO.com/api/n8n/chat
```

---

# 22. Autenticación n8n → Backend

Las peticiones desde n8n deben utilizar la clave:

```env
BAFAR_N8N_API_KEY=
```

La misma clave debe configurarse de forma segura en n8n.

No debe escribirse directamente dentro de los workflows exportados al repositorio.

El middleware del backend valida que las peticiones autorizadas provengan del sistema que conoce esta clave.

---

# 23. Workflows n8n

Si se guardan exports de n8n en el repositorio, utilizar una carpeta:

```text
n8n/
```

Ejemplo:

```text
n8n/
├── bafar-orquestador.json
└── odoo-tickets.json
```

Antes de hacer commit, verificar que los archivos NO contengan:

- tokens;
- passwords;
- API keys;
- Authorization headers hardcodeados;
- credenciales de Odoo;
- credenciales de Meta;
- credenciales del backend.

Las credenciales deben administrarse desde n8n.

---

# 24. Alertas operativas

El backend puede registrar problemas persistentes en PostgreSQL.

Ejemplos:

```text
sync_failed
reconciliation_failed
reconciliation_error
```

Las alertas permiten identificar problemas que necesitan intervención humana.

Endpoint administrativo:

```text
GET /api/admin/alerts
```

Para resolver una alerta:

```text
PATCH /api/admin/alerts/:id/resolve
```

Estas rutas administrativas deben protegerse adecuadamente antes de exponerse públicamente.

---

# 25. Estado del scheduler

Consultar:

```text
GET /api/sync/status
```

El resultado permite comprobar:

```text
última sincronización
sincronización en curso
resultado de sincronización

última conciliación
conciliación en curso
resultado de conciliación
```

---

# 26. Pruebas antes de producción

Antes de cada despliegue ejecutar:

```bash
npm ci
```

```bash
npx prisma generate
```

```bash
npm run build
```

Después verificar:

```bash
npm run sync:all
```

```bash
npm run reconcile:all
```

```bash
npm run reconcile:detail
```

Todos los procesos deben terminar correctamente antes de desplegar.

---

# 27. Pruebas funcionales

Probar desde WhatsApp:

```text
Hola
```

Debe devolver un saludo.

Probar:

```text
¿Cómo vamos hoy?
```

Debe consultar KPIs.

Probar:

```text
¿Cómo va Carnemart hoy?
```

Debe devolver información de Carnemart.

Probar:

```text
¿Cómo va Yalo esta semana?
```

Debe devolver información de Yalo.

Probar:

```text
¿Cómo va La Pastora?
```

Debe devolver información de La Pastora.

Probar:

```text
Quiero generar un ticket
```

Debe enrutar al workflow correspondiente de Odoo.

También probar un número no autorizado intentando consultar KPIs.

---

# 28. Despliegue recomendado

Una arquitectura sencilla para producción es:

```text
Internet
    │
    ▼
DNS
    │
    ▼
Nginx :443
    │
    ▼
Backend Node :3000
    │
    ├── PostgreSQL
    ├── WooCommerce
    └── OpenAI
```

El puerto `3000` no necesita quedar expuesto públicamente si Nginx está en el mismo servidor.

---

# 29. Preparar Ubuntu

Actualizar paquetes:

```bash
sudo apt update
sudo apt upgrade -y
```

Instalar herramientas:

```bash
sudo apt install -y git nginx
```

Instalar una versión LTS compatible de Node.js siguiendo el procedimiento oficial correspondiente al servidor.

Verificar:

```bash
node --version
npm --version
```

---

# 30. Descargar el backend en producción

Ejemplo:

```bash
cd /var/www
```

Clonar el repositorio privado utilizando un método de autenticación seguro:

```bash
git clone URL_REPOSITORIO
```

Entrar:

```bash
cd bafar-woocommerce
```

Instalar:

```bash
npm ci
```

---

# 31. Configurar `.env` de producción

Crear:

```bash
nano .env
```

Agregar las variables reales.

Aplicar permisos restrictivos:

```bash
chmod 600 .env
```

Nunca hacer:

```bash
git add .env
```

---

# 32. Preparar base de datos

Con `DATABASE_URL` configurado:

```bash
npx prisma generate
```

Aplicar migraciones:

```bash
npx prisma migrate deploy
```

No ejecutar `migrate dev` en producción.

---

# 33. Compilar en producción

```bash
npm run build
```

Después realizar una prueba manual:

```bash
npm start
```

Verificar localmente desde el servidor:

```bash
curl http://127.0.0.1:3000/
```

o utilizar un endpoint de estado disponible.

Detener después la prueba manual y configurar PM2.

---

# 34. PM2

Instalar:

```bash
sudo npm install -g pm2
```

Iniciar:

```bash
pm2 start dist/index.js --name bafar-backend
```

Consultar:

```bash
pm2 status
```

Logs:

```bash
pm2 logs bafar-backend
```

Reiniciar:

```bash
pm2 restart bafar-backend
```

Detener:

```bash
pm2 stop bafar-backend
```

Guardar configuración:

```bash
pm2 save
```

Configurar inicio automático:

```bash
pm2 startup
```

PM2 mostrará un comando adicional.

Ejecutar ese comando y después:

```bash
pm2 save
```

---

# 35. Configurar Nginx

Crear configuración:

```bash
sudo nano /etc/nginx/sites-available/bafar-api
```

Ejemplo:

```nginx
server {
    listen 80;

    server_name api.DOMINIO.com;

    location / {
        proxy_pass http://127.0.0.1:3000;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Habilitar:

```bash
sudo ln -s /etc/nginx/sites-available/bafar-api /etc/nginx/sites-enabled/bafar-api
```

Comprobar:

```bash
sudo nginx -t
```

Recargar:

```bash
sudo systemctl reload nginx
```

---

# 36. DNS

Crear un registro DNS para el backend.

Ejemplo:

```text
Tipo: A
Nombre: api
Valor: IP_PUBLICA_DEL_SERVIDOR
```

Resultado:

```text
api.DOMINIO.com
```

Debe resolver hacia la IP del VPS.

---

# 37. HTTPS

No utilizar el backend productivo sin HTTPS.

Una vez que el DNS esté apuntando correctamente al servidor, configurar un certificado SSL mediante el mecanismo seleccionado para el VPS/Nginx.

Después el backend debe quedar disponible mediante:

```text
https://api.DOMINIO.com
```

No utilizar en producción:

```text
http://IP:3000
```

desde n8n o WhatsApp.

---

# 38. Firewall

El servidor debería exponer únicamente lo necesario.

Normalmente:

```text
22  SSH
80  HTTP
443 HTTPS
```

El puerto:

```text
3000
```

debe mantenerse interno si Nginx está funcionando como reverse proxy.

Si PostgreSQL está en el mismo servidor, no exponer:

```text
5432
```

públicamente salvo que exista una necesidad específica y controles de red apropiados.

---

# 39. Cambiar n8n a producción

Durante desarrollo se puede tener:

```text
https://xxxxx.ngrok-free.dev/api/n8n/chat
```

En producción cambiar por:

```text
https://api.DOMINIO.com/api/n8n/chat
```

Después de cambiarlo, ejecutar una prueba completa desde WhatsApp.

---

# 40. Eliminar dependencia de ngrok

Ngrok es utilizado únicamente para desarrollo/pruebas.

En producción:

```text
WhatsApp
   ↓
n8n
   ↓
HTTPS dominio permanente
   ↓
Backend
```

Por tanto no es necesario mantener una terminal de ngrok abierta.

---

# 41. PostgreSQL en producción

Existen dos estrategias principales.

## Opción A — PostgreSQL en el mismo VPS

Ventajas:

- menor costo;
- configuración sencilla;
- baja latencia.

Desventajas:

- backend y base comparten servidor;
- una falla del VPS afecta ambos;
- los backups quedan bajo responsabilidad del administrador.

## Opción B — PostgreSQL administrado

Ventajas:

- backups simplificados;
- mejor aislamiento;
- mantenimiento más sencillo.

Desventajas:

- costo adicional.

Para información importante de producción se recomienda disponer de backups independientemente de la opción elegida.

---

# 42. Backups

Como mínimo realizar:

```text
backup diario
```

y conservar varias versiones históricas.

Ejemplo manual:

```bash
pg_dump -Fc bafar > bafar_backup.dump
```

No almacenar backups dentro del repositorio Git.

Idealmente almacenar copias fuera del servidor principal.

---

# 43. Restaurar un backup

Ejemplo para formato custom de `pg_dump`:

```bash
pg_restore -d bafar bafar_backup.dump
```

El procedimiento exacto dependerá de usuarios, permisos, host y estrategia de backup.

La restauración debe probarse periódicamente.

Un backup que nunca se ha probado no debe considerarse suficiente.

---

# 44. Logs

Logs del proceso:

```bash
pm2 logs bafar-backend
```

Estado:

```bash
pm2 status
```

Los logs de aplicación utilizan niveles:

```text
info
warn
error
```

Los logs nunca deben contener:

- API keys;
- passwords;
- Consumer Secrets;
- tokens;
- DATABASE_URL completa.

---

# 45. Actualizar producción

Cuando exista una nueva versión:

```bash
cd /var/www/bafar-woocommerce
```

Descargar cambios:

```bash
git pull
```

Instalar exactamente las dependencias:

```bash
npm ci
```

Generar Prisma:

```bash
npx prisma generate
```

Aplicar migraciones:

```bash
npx prisma migrate deploy
```

Compilar:

```bash
npm run build
```

Reiniciar:

```bash
pm2 restart bafar-backend
```

Comprobar:

```bash
pm2 logs bafar-backend
```

y realizar pruebas de salud.

---

# 46. Procedimiento recomendado de actualización

Antes de actualizar producción:

```text
1. Backup PostgreSQL
2. Confirmar estado actual del backend
3. git pull
4. npm ci
5. npx prisma generate
6. npx prisma migrate deploy
7. npm run build
8. pm2 restart
9. comprobar logs
10. probar endpoints
11. probar WhatsApp
12. verificar conciliación
```

---

# 47. Rollback

Antes de despliegues importantes registrar el commit que está actualmente en producción:

```bash
git rev-parse HEAD
```

Si una versión nueva falla, volver al commit estable correspondiente y reconstruir el proyecto.

Las migraciones de base de datos requieren especial cuidado: no asumir que revertir código revierte automáticamente el esquema de PostgreSQL.

Por ello realizar backup antes de migraciones importantes.

---

# 48. Seguridad del repositorio

Se recomienda utilizar un repositorio privado.

El repositorio puede contener:

```text
src/
prisma/
prisma/migrations/
n8n/ sin secretos
package.json
package-lock.json
tsconfig.json
prisma.config.ts
.env.example
.gitignore
README.md
```

No debe contener:

```text
.env
node_modules/
dist/
logs/
backups/
tokens
passwords
API keys
credenciales
```

---

# 49. `.gitignore`

Como mínimo:

```gitignore
node_modules/

.env
.env.*
!.env.example

dist/
build/

*.log
logs/

.DS_Store
Thumbs.db

.vscode/
.idea/

*.db
*.db-journal

*.sql
*.dump
backups/

tmp/
temp/
```

---

# 50. Checklist de despliegue inicial

Antes de declarar producción:

- [ ] Repositorio privado creado.
- [ ] `.env` fuera de Git.
- [ ] `.env.example` actualizado.
- [ ] Credenciales de producción creadas.
- [ ] VPS preparado.
- [ ] Node.js instalado.
- [ ] PostgreSQL configurado.
- [ ] `DATABASE_URL` configurada.
- [ ] `npm ci` correcto.
- [ ] `npx prisma generate` correcto.
- [ ] `npx prisma migrate deploy` correcto.
- [ ] `npm run build` con 0 errores.
- [ ] Backend funcionando con PM2.
- [ ] PM2 configurado para reinicio automático.
- [ ] Nginx configurado.
- [ ] Dominio configurado.
- [ ] HTTPS activo.
- [ ] Puerto 3000 no expuesto innecesariamente.
- [ ] PostgreSQL protegido.
- [ ] n8n apunta al dominio productivo.
- [ ] `BAFAR_N8N_API_KEY` coincide en backend y n8n.
- [ ] OpenAI responde.
- [ ] WooCommerce Carnemart responde.
- [ ] WooCommerce Yalo responde.
- [ ] WooCommerce La Pastora responde.
- [ ] Sincronización correcta.
- [ ] Conciliación correcta.
- [ ] Backups configurados.
- [ ] Restauración de backup documentada.

---

# 51. Checklist funcional

Probar:

- [ ] `Hola`
- [ ] Saludo con nombre del usuario.
- [ ] `¿Cómo vamos hoy?`
- [ ] KPIs consolidados.
- [ ] KPIs Carnemart.
- [ ] KPIs Yalo.
- [ ] KPIs La Pastora.
- [ ] Productos.
- [ ] Usuario autorizado.
- [ ] Usuario no autorizado.
- [ ] Solicitud de ticket.
- [ ] Workflow Odoo.
- [ ] Manejo de mensaje no reconocido.
- [ ] Error controlado cuando OpenAI no responde.
- [ ] Error controlado cuando PostgreSQL no responde.
- [ ] Error controlado cuando WooCommerce no responde.

---

# 52. Checklist diario de operación

Comprobar:

```text
Backend activo
PM2 activo
PostgreSQL activo
n8n activo
Sincronización reciente
Conciliación reciente
Sin alertas críticas abiertas
```

Consultar:

```text
/api/sync/status
```

y:

```text
/api/admin/alerts
```

---

# 53. Flujo de recuperación

Si el bot deja de responder:

```text
1. Verificar n8n
2. Verificar dominio/API
3. pm2 status
4. pm2 logs bafar-backend
5. comprobar PostgreSQL
6. comprobar OpenAI
7. comprobar WooCommerce
8. revisar /api/admin/alerts
```

Si el backend está detenido:

```bash
pm2 restart bafar-backend
```

Si existen diferencias de datos:

```bash
npm run reconcile:all
```

Después:

```bash
npm run reconcile:detail
```

Si corresponde:

```bash
npm run reconcile:repair
```

---

# 54. Consideraciones del scheduler en producción

Actualmente el scheduler vive dentro del proceso Node.

Esto significa que debe existir solamente una instancia encargada de ejecutar los trabajos programados.

Si en el futuro el backend se escala horizontalmente:

```text
Backend 1
Backend 2
Backend 3
```

no se debe permitir que los tres ejecuten simultáneamente el mismo scheduler.

Antes de escalar a múltiples instancias será necesario separar los jobs o implementar un mecanismo de locking distribuido.

Con una única instancia de backend, la arquitectura actual es adecuada.

---

# 55. Observabilidad

Para una primera versión productiva se dispone de:

```text
PM2 logs
SystemAlert
reconciliation logs
sync status
```

En una etapa posterior pueden agregarse:

- monitoreo externo de uptime;
- alertas por correo/Slack/WhatsApp;
- métricas de latencia;
- métricas de OpenAI;
- métricas de errores;
- dashboards;
- centralización de logs.

---

# 56. Recomendaciones de producción

No modificar directamente archivos TypeScript en el servidor salvo emergencia.

El flujo recomendado es:

```text
Desarrollo local
      ↓
Git
      ↓
Repositorio privado
      ↓
Servidor producción
      ↓
Build
      ↓
PM2
```

Toda modificación debería quedar registrada en Git.

---

# 57. Estado esperado del sistema

Cuando todo funciona correctamente:

```text
WhatsApp                 OK
n8n                      OK
Backend                  OK
OpenAI                   OK
PostgreSQL               OK
Woo Carnemart            OK
Woo Yalo                 OK
Woo La Pastora           OK
Sincronización           OK
Conciliación             OK
Alertas críticas         0
```

---

# 58. Resumen de producción

La arquitectura productiva final es:

```text
                         INTERNET
                            │
                            ▼
                       WhatsApp
                            │
                            ▼
                           n8n
                            │
                            │ HTTPS
                            ▼
                  api.DOMINIO.com
                            │
                            ▼
                         Nginx
                            │
                            ▼
                      Node + PM2
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
         PostgreSQL       OpenAI      WooCommerce
                                          │
                                ┌─────────┼─────────┐
                                ▼         ▼         ▼
                           Carnemart     Yalo    La Pastora

n8n
 │
 └──────────────────────────────→ Odoo
                                  Tickets
```

El objetivo es que ninguna pieza de producción dependa de:

```text
PC personal
Laragon
VS Code abierto
terminal local
ngrok
```

El sistema debe poder permanecer operativo 24/7 en infraestructura de producción.