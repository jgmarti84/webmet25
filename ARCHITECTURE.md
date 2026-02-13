# Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          RADAR VISUALIZATION SYSTEM                        │
└──────────────────────────────────────────────────────────────────────────┘

                                    USER
                                     │
                                     ↓
┌────────────────────────────────────────────────────────────────────────────┐
│                         NEW FRONTEND (React SPA)                            │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                         RadarApp.jsx                                │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │    │
│  │  │   Product    │  │  Animation   │  │   Legend     │             │    │
│  │  │   Selector   │  │   Controls   │  │  Component   │             │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘             │    │
│  │  ┌──────────────────────────────────────────────────────┐         │    │
│  │  │          SimpleMapView (react-leaflet)               │         │    │
│  │  │    - Base Map Layer (OpenStreetMap)                  │         │    │
│  │  │    - Radar Tile Layer (from API)                     │         │    │
│  │  └──────────────────────────────────────────────────────┘         │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                  ↕                                          │
│                         API Client (radarApi.js)                            │
└────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ↓ HTTP/REST
┌────────────────────────────────────────────────────────────────────────────┐
│                        BACKEND API (FastAPI)                                │
│                          Port: 8000                                         │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  Endpoints:                                                         │    │
│  │  • GET  /api/v1/radars                List radars                  │    │
│  │  • GET  /api/v1/products              List products                │    │
│  │  • GET  /api/v1/products/{key}/colormap  Get color mapping         │    │
│  │  • GET  /api/v1/cogs                  Query COG files              │    │
│  │  • GET  /api/v1/tiles/{id}/{z}/{x}/{y}.png  Serve map tiles       │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                  ↕                                          │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │              Tile Service (TileService)                             │    │
│  │  • Reads COG files from disk                                        │    │
│  │  • Applies colormap from product references                         │    │
│  │  • Generates PNG tiles                                              │    │
│  │  • Handles zoom levels and coordinates                              │    │
│  └────────────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────────────┘
                    │                              │
                    ↓ SQL                         ↓ File Read
┌──────────────────────────────┐   ┌───────────────────────────────┐
│   DATABASE (PostgreSQL)       │   │   FILE SYSTEM                 │
│                               │   │                               │
│  Tables:                      │   │  /product_output/             │
│  • radars                     │   │    └── YYYY/MM/DD/            │
│  • radar_products             │   │        └── *.tif (COG files)  │
│  • references (colormaps)     │   │                               │
│  • radar_cogs (metadata)      │   │                               │
│                               │   │                               │
│  Stores:                      │   │  Contains:                    │
│  • Radar configurations       │   │  • Cloud Optimized GeoTIFFs  │
│  • Product definitions        │   │  • Georeferenced radar data   │
│  • Color scale mappings       │   │  • Organized by date          │
│  • COG file metadata          │   │                               │
│  • Observation timestamps     │   │                               │
└──────────────────────────────┘   └───────────────────────────────┘
                    ↑                              ↑
                    │                              │
                    └─────────────┬────────────────┘
                                  │
                    ┌─────────────────────────────┐
                    │   INDEXER SERVICE            │
                    │  • Watches /product_output   │
                    │  • Scans for new COG files   │
                    │  • Extracts metadata         │
                    │  • Updates database          │
                    └─────────────────────────────┘


DATA FLOW:
==========

1. INITIALIZATION
   ┌─────────┐
   │ User    │─── Opens browser
   └────┬────┘
        ↓
   ┌─────────────────┐
   │ Frontend loads  │─── GET /api/v1/radars
   └────┬────────────┘   GET /api/v1/products
        ↓
   ┌─────────────────┐
   │ Dropdowns       │─── Display available options
   │ populated       │
   └─────────────────┘

2. DATA QUERY
   ┌─────────┐
   │ User    │─── Selects Radar + Product
   └────┬────┘
        ↓
   ┌─────────────────┐
   │ Frontend        │─── GET /api/v1/cogs?radar_code=X&product_key=Y
   │ queries COGs    │   GET /api/v1/products/Y/colormap
   └────┬────────────┘
        ↓
   ┌─────────────────┐
   │ Backend         │─── SELECT * FROM radar_cogs WHERE ...
   │ queries DB      │
   └────┬────────────┘
        ↓
   ┌─────────────────┐
   │ Returns list    │─── [{id, observation_time, ...}, ...]
   │ of COG metadata │
   └─────────────────┘

3. VISUALIZATION
   ┌─────────────────┐
   │ Frontend        │─── Renders map at latest timestamp
   │ displays map    │
   └────┬────────────┘
        ↓
   ┌─────────────────┐
   │ Leaflet map     │─── Requests tiles for visible area
   │ requests tiles  │   GET /api/v1/tiles/{cog_id}/{z}/{x}/{y}.png
   └────┬────────────┘
        ↓
   ┌─────────────────┐
   │ Tile Service    │─── 1. Reads COG file from disk
   │ generates tiles │   2. Extracts data for tile coordinates
   └────┬────────────┘   3. Applies colormap
        ↓               4. Generates PNG
   ┌─────────────────┐
   │ Returns PNG     │─── Binary image data
   │ tile            │
   └─────────────────┘

4. ANIMATION
   ┌─────────────────┐
   │ User clicks     │─── Play button
   │ play            │
   └────┬────────────┘
        ↓
   ┌─────────────────┐
   │ Frontend        │─── Cycles through timestamps
   │ animation loop  │   Updates current frame index
   └────┬────────────┘   Every 1000ms (adjustable)
        ↓
   ┌─────────────────┐
   │ Map updates     │─── Requests tiles for new timestamp
   │ to new frame    │   GET /api/v1/tiles/{new_cog_id}/...
   └─────────────────┘


COMPONENT HIERARCHY:
====================

RadarApp
├── HeaderCard
├── ProductSelector
│   ├── Radar Dropdown
│   └── Product Dropdown
├── SimpleMapView
│   ├── MapContainer (react-leaflet)
│   │   ├── Base TileLayer (OpenStreetMap)
│   │   └── Radar TileLayer (API tiles)
│   └── MapCenterUpdater
├── AnimationControls (conditional)
│   ├── Previous Button
│   ├── Play/Pause Button
│   ├── Next Button
│   ├── Speed Toggle
│   └── Timeline Slider
├── LegendComponent (conditional)
│   ├── Title
│   └── Color Scale Items
├── OpacityControl
│   └── Slider
├── Alerts
└── Loader


KEY TECHNOLOGIES:
=================

Frontend:
• React 19 - UI framework
• react-leaflet 5 - Map rendering
• Material-UI 7 - UI components
• axios - HTTP client
• notistack - Notifications

Backend:
• FastAPI - REST API framework
• SQLAlchemy - ORM
• GeoAlchemy2 - Spatial database support
• rasterio - COG file reading
• PIL/Pillow - Image processing

Database:
• PostgreSQL 15 with PostGIS
• Spatial indexing for geographic queries
• JSONB for flexible metadata storage

Infrastructure:
• Docker & Docker Compose
• Nginx for static file serving
• Node.js for frontend build
```
