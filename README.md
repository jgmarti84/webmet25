## Webmet25 - Sistema de Visualización y Procesamiento de Datos Radar

Este repositorio contiene la implementación completa de un sistema de visualización web y procesamiento de datos radar utilizando contenedores Docker. El proyecto está compuesto por múltiples servicios que trabajan en conjunto.

### 🎯 Nueva Interfaz de Visualización

**✨ Frontend integrado con base de datos** - El sistema ahora incluye una interfaz moderna basada en React que visualiza directamente los datos radar almacenados en la base de datos, sin necesidad de subir archivos.

📖 Ver [FINAL_SUMMARY.md](FINAL_SUMMARY.md) para detalles completos de la nueva implementación.

### Servicios Incluidos

* **API (FastAPI)**: API REST que sirve datos radar, productos y tiles desde la base de datos.

* **Frontend (React)**: Aplicación web moderna con mapas interactivos, animación temporal y controles de visualización.
  - Visualización instantánea desde base de datos
  - Controles de animación temporal
  - Selector de radares y productos
  - Leyenda de colores dinámica
  - Control de opacidad

* **genpro25**: Servicio de procesamiento de datos radar que utiliza el módulo radarlib para ejecutar un gestor de daemons que procesa archivos BUFR, genera productos NetCDF y crea imágenes de radar (COG files).

* **Indexer**: Servicio que escanea y registra archivos COG en la base de datos para acceso rápido.

* **PostgreSQL + PostGIS**: Base de datos relacional con extensión espacial que almacena:
  - Configuración de radares
  - Definición de productos
  - Metadatos de archivos COG
  - Referencias de color para visualización

### Arquitectura

* **Docker Compose**: Orquestación de servicios con volúmenes compartidos
* **API RESTful**: Endpoints para radares, productos, COGs y tiles
* **Tile Service**: Generación dinámica de tiles PNG desde archivos COG
* **Indexación Automática**: Escaneo continuo de nuevos productos
* **Visualización Web**: Mapas interactivos con react-leaflet
* **Almacenamiento COG**: Cloud Optimized GeoTIFF para acceso eficiente

### Características Principales

* ✨ **Visualización instantánea** - Sin necesidad de subir archivos
* 🗺️ **Mapas interactivos** - Pan, zoom y controles intuitivos
* ⏯️ **Animación temporal** - Reproducción de series temporales
* 🎨 **Leyendas dinámicas** - Escalas de color desde la base de datos
* 📊 **Múltiples productos** - DBZH, VRAD, ZDR y más
* 🔄 **Actualizaciones automáticas** - Indexación continua de datos
* 📦 **Arquitectura modular** - Servicios independientes y escalables

### Inicio Rápido

#### Servicios Backend
```bash
# Iniciar base de datos y API
docker-compose up -d radar_db db-init api indexer

# Verificar que los servicios estén corriendo
docker-compose ps
```

#### Frontend (Desarrollo)
```bash
cd new-frontend
npm install
npm run dev
# Abrir http://localhost:3000
```

#### Frontend (Producción)
```bash
docker-compose up -d frontend
# Abrir http://localhost:80
```

### Documentación

#### Integración Frontend
- 📖 [FINAL_SUMMARY.md](FINAL_SUMMARY.md) - Resumen ejecutivo del proyecto
- 🏗️ [ARCHITECTURE.md](ARCHITECTURE.md) - Arquitectura del sistema
- 📝 [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Detalles técnicos
- 📘 [new-frontend/README_INTEGRATION.md](new-frontend/README_INTEGRATION.md) - Guía de integración
- 🧪 [new-frontend/TESTING.md](new-frontend/TESTING.md) - Procedimientos de prueba
- 🎨 [new-frontend/UI_LAYOUT.md](new-frontend/UI_LAYOUT.md) - Especificaciones de diseño

#### API
Ver `/api/app/main.py` para documentación completa de endpoints.

Endpoints principales:
- `GET /api/v1/radars` - Lista de radares
- `GET /api/v1/products` - Lista de productos
- `GET /api/v1/cogs` - Archivos COG con filtros
- `GET /api/v1/tiles/{id}/{z}/{x}/{y}.png` - Tiles de mapa

### Requisitos

* Docker y Docker Compose
* Node.js 18+ (para desarrollo del frontend)
* Conexión a servidor FTP (para descarga de datos BUFR)
* Configuración de radar específica (archivos de configuración incluidos)

### Rutas de la Aplicación

- `/` - Nueva interfaz con visualización desde base de datos
- `/old` - Interfaz original con carga de archivos
- `/cache` - Estadísticas de caché

### Estructura del Proyecto

```
webmet25/
├── api/              # API FastAPI
├── database/         # Modelos y migraciones
├── frontend/         # Frontend original (estático)
├── new-frontend/     # Nuevo frontend React ✨
├── genpro25/         # Procesamiento de datos
├── indexer/          # Indexación de COG files
└── docs/             # Documentación adicional
```

Este repositorio proporciona una solución completa y moderna para el procesamiento y visualización de datos meteorológicos radar en un entorno contenerizado y escalable.
