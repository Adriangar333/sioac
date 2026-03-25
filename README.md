# SIOAC - Sistema Inteligente de Optimización, Análisis y Clasificación de Resultados

Plataforma web para investigación de reputación online con análisis NLP, reconocimiento facial, búsqueda multi-motor y clasificación inteligente de resultados.

## Stack Tecnológico

- **Frontend:** React 18 + Vite + Tailwind CSS v3 + shadcn/ui + TypeScript
- **Backend:** Express 5 + Drizzle ORM + PostgreSQL
- **Gráficos:** Recharts
- **Autenticación:** JWT con tokens Bearer

## Módulos

1. **Dashboard** — KPIs en tiempo real, gráficos de sentimiento, clasificación y fuentes
2. **Gestión de Clientes** — CRUD completo con variaciones de nombre, palabras clave, industria
3. **Motor de Búsqueda** — Generador inteligente de queries con variaciones fonéticas español
4. **Análisis NLP** — Sentimiento (5 niveles), desambiguación de identidad, confianza
5. **Análisis de Imágenes** — Extracción y reconocimiento facial
6. **Reglas de Clasificación** — Motor de reglas configurable con prioridades
7. **Exportaciones** — Excel (XLSX), CSV, PDF con filtros personalizados

## Deploy en Render

### Opción 1: One-Click Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Adriangar333/sioac)

### Opción 2: Manual

1. **Crear PostgreSQL Database** en Render (Plan Free)
2. **Crear Web Service** conectado a este repo
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
3. **Variables de entorno:**

```env
NODE_ENV=production
DATABASE_URL=<Internal Database URL de Render>
JWT_SECRET=<tu_secreto>
SERPER_API_KEY=<opcional>
SERPAPI_KEY=<opcional>
GOOGLE_CLOUD_NL_API_KEY=<opcional>
CLAUDE_API_KEY=<opcional>
JINA_API_KEY=<opcional>
```

## Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu DATABASE_URL de PostgreSQL local

# Crear tablas en la base de datos
npm run db:push

# Iniciar servidor de desarrollo
npm run dev
```

## Credenciales Demo

- **Email:** admin@sioac.com
- **Contraseña:** admin123

## Estructura del Proyecto

```
sioac/
├── client/src/          # Frontend React
│   ├── pages/           # 12 páginas de la aplicación
│   ├── components/      # Componentes UI (shadcn)
│   ├── lib/             # Auth, queryClient, utils
│   └── hooks/           # Custom hooks
├── server/              # Backend Express
│   ├── routes.ts        # API endpoints
│   ├── storage.ts       # Drizzle ORM + PostgreSQL
│   └── index.ts         # Server entry point
├── shared/
│   └── schema.ts        # Drizzle schema (9 tablas)
├── render.yaml          # Blueprint para Render
└── .env.example         # Variables de entorno
```

## Licencia

MIT — ISES Consultoría / Four G Solutions
