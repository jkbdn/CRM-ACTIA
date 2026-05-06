# CRM sencillo para estudio de arquitectura

MVP local para gestionar contactos, oportunidades comerciales, pipeline, tareas de seguimiento y estado de propuestas de un estudio de arquitectura.

## Requisitos previos

- Node.js 22.13 o superior y menor que 25, recomendado Node.js 24
- npm

No requiere servicios externos ni cuentas de pago.

## Estructura

```text
.
├── client/                 # Frontend React + Vite
│   └── src/
│       ├── components/     # Layout, campos de formulario, mensajes
│       ├── views/          # Dashboard, contactos, oportunidades, pipeline, tareas
│       ├── api.js          # Cliente HTTP
│       └── styles.css      # Estilos responsive
├── server/                 # Backend Node.js + Express
│   ├── scripts/            # Inicialización y reinicio de SQLite
│   └── src/
│       ├── database.js     # Esquema, conexión y seed
│       ├── index.js        # API REST, filtros, dashboard y CSV
│       ├── csv.js          # Parser/exportador CSV básico
│       └── seedData.js     # Datos ficticios de ejemplo
├── package.json            # Scripts de desarrollo con workspaces
└── README.md
```

## Arquitectura

El frontend React consume una API REST local en `/api`. El backend Express valida datos básicos, consulta SQLite con `node:sqlite` y expone CRUD para contactos, oportunidades y tareas. SQLite se guarda en `server/data/crm.sqlite` y se crea automáticamente con datos de ejemplo si no existe.

## Instalación

```bash
npm install
npm run db:init
```

## Ejecución en local

```bash
npm run dev
```

- Frontend: http://127.0.0.1:5173
- Backend: http://127.0.0.1:3001

Para probar el modo producción local:

```bash
npm run build
npm start
```

En ese modo, Express sirve también el frontend compilado.

## Reiniciar la base de datos

Este comando borra las tablas y vuelve a cargar los datos de ejemplo:

```bash
npm run db:reset
```

## Importar y exportar CSV

Desde la interfaz:

- Contactos: botones `CSV` e `Importar` en la vista Contactos.
- Oportunidades: botones `CSV` e `Importar` en la vista Oportunidades.
- Tareas: botón `CSV` en la vista Tareas.

También se puede exportar desde la API:

- `GET /api/export/contacts`
- `GET /api/export/opportunities`
- `GET /api/export/tasks`

Para importar, lo más sencillo es exportar primero un CSV y usarlo como plantilla. Los imports disponibles son:

- `POST /api/import/contacts` con `Content-Type: text/csv`
- `POST /api/import/opportunities` con `Content-Type: text/csv`

## Ejecución en la nube

La opción más sencilla para este MVP es desplegar un único servicio Node.js que sirva la API y el frontend compilado. El repositorio ya incluye `render.yaml` para Render.

Pasos recomendados en Render:

1. Sube el proyecto a un repositorio GitHub/GitLab/Bitbucket.
2. En Render, crea un nuevo Blueprint o Web Service desde ese repositorio.
3. Usa el `render.yaml` incluido, o configura manualmente:
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
   - Environment variable: `CRM_DB_PATH=/var/data/crm.sqlite`
   - Persistent disk: mount path `/var/data`, tamaño inicial `1 GB`
4. Cuando termine el deploy, Render dará una URL pública.

SQLite necesita almacenamiento persistente en nube. Si despliegas sin disco persistente, los datos creados desde la app pueden perderse en reinicios o redeploys.

Limitación importante: SQLite con disco persistente es adecuado para este MVP interno con una sola instancia. Para varios usuarios concurrentes, escalado horizontal o producción seria, conviene migrar la base de datos a PostgreSQL.

## Datos de ejemplo

El seed inicial incluye:

- 8 contactos
- 10 oportunidades repartidas por varias etapas
- 12 tareas con distintos responsables, prioridades y estados

## Funcionalidades del MVP

- Dashboard con métricas comerciales, tareas próximas y propuestas próximas.
- CRUD de contactos.
- CRUD de oportunidades.
- Pipeline tipo Kanban con selector de etapa por tarjeta.
- CRUD de tareas y marcado rápido como completada.
- Búsqueda y filtros básicos.
- Exportación CSV de contactos, oportunidades y tareas.
- Importación CSV de contactos y oportunidades.

## Mejoras recomendadas para versión 2

- Login y usuarios
- Roles y permisos
- Integración con Gmail o Outlook
- Integración con Google Calendar
- Recordatorios automáticos
- Adjuntar documentos a oportunidades
- Generación automática de propuestas
- Integración con plantillas Word
- Dashboard financiero avanzado
- Despliegue en servidor
- Backup automático
- Historial de actividad
- Comentarios internos por oportunidad
- API para conectar con otras herramientas
