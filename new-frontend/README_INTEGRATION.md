# Radar Visualization Frontend - Database Integration

This document describes the new integration between the frontend and the existing radar database API.

## Overview

The frontend has been updated to work directly with the radar COG (Cloud Optimized GeoTIFF) files stored in the database, instead of requiring file uploads. The application now:

1. Fetches radar and product metadata from the API
2. Queries available COG files from the database
3. Renders radar data using dynamic tile endpoints
4. Provides animation controls for temporal data
5. Displays color legends based on product configuration

## Architecture

### API Client (`src/api/radarApi.js`)

New API client that interfaces with the backend endpoints:

- `GET /api/v1/radars` - List available radars
- `GET /api/v1/products` - List available products
- `GET /api/v1/products/{key}/colormap` - Get color mapping for a product
- `GET /api/v1/cogs` - Query COG files with filters
- `GET /api/v1/tiles/{cog_id}/{z}/{x}/{y}.png` - Get map tiles

### Main Application (`src/RadarApp.jsx`)

Simplified application that:

1. Loads radars and products on startup
2. Auto-selects the first radar and product
3. Fetches COG files for the last 6 hours
4. Manages animation state and playback
5. Provides UI controls for:
   - Radar/product selection
   - Animation playback (play/pause, speed control)
   - Opacity adjustment
   - Legend display

### UI Components

#### `SimpleMapView.jsx`
- Renders the map using react-leaflet
- Displays base map layer (OpenStreetMap)
- Overlays radar tiles from the API
- Supports opacity control

#### `ProductSelector.jsx`
- Dropdown menus for radar and product selection
- Fixed position at top center of screen

#### `AnimationControls.jsx`
- Play/pause button
- Speed control (0.5x, 1x, 2x)
- Frame slider
- Previous/next frame buttons
- Timestamp display

#### `LegendComponent.jsx`
- Displays color scale for the selected product
- Shows value ranges and labels
- Fetches colormap from API

#### `OpacityControl.jsx`
- Slider to adjust radar overlay opacity
- Range: 0-100%

## Running the Application

### Development Mode

```bash
cd new-frontend
npm install
npm run dev
```

The application will start at `http://localhost:3000`

### Production Build

```bash
cd new-frontend
npm run build
```

The built files will be in the `dist/` directory.

### Environment Variables

Create a `.env` file in the `new-frontend` directory:

```env
VITE_API_URL=http://localhost:8000
```

This should point to your backend API server.

## Routes

- `/` - Main radar visualization (RadarApp)
- `/old` - Original file upload interface (App)
- `/cache` - Cache statistics

## API Requirements

The backend must be running with the following endpoints available:

1. **Radars endpoint** - Must return radar configuration including:
   - `code` - Radar identifier
   - `title` - Display name
   - `center_lat`, `center_long` - Geographic center
   
2. **Products endpoint** - Must return product definitions with:
   - `product_key` - Product identifier (e.g., "DBZH")
   - `product_title` - Display name
   - `references` - Color mapping data

3. **COGs endpoint** - Must return COG metadata with:
   - `id` - COG identifier for tile requests
   - `observation_time` - Timestamp of the observation
   - `radar_code` - Associated radar
   - `product_key` - Associated product

4. **Tiles endpoint** - Must serve PNG tiles at:
   - `/api/v1/tiles/{cog_id}/{z}/{x}/{y}.png`

## Key Differences from Original Frontend

### Before (File Upload Mode)
- Users uploaded BUFR/HDF5 files
- Backend processed files and generated COGs
- Temporary storage and session management
- Complex multi-step workflow

### After (Database Mode)
- Pre-processed COGs stored in database
- Direct tile serving from COG files
- No file uploads required
- Immediate visualization

## Future Enhancements

Potential improvements:

1. **Time range selector** - Allow users to select custom time ranges
2. **Multiple radar overlay** - Display data from multiple radars simultaneously
3. **Export functionality** - Download current frame as image
4. **Measurement tools** - Distance and area measurements
5. **Comparison mode** - Side-by-side comparison of different products
6. **Mobile optimization** - Better responsive design for mobile devices

## Troubleshooting

### No data displayed
- Check that the API is running and accessible
- Verify that COG files exist in the database for the selected radar/product
- Check browser console for API errors

### Tiles not loading
- Verify the tile endpoint is accessible
- Check that COG files exist on disk at the expected path
- Ensure CORS is properly configured on the backend

### Animation not working
- Check that multiple COG files exist for the time range
- Verify timestamps are properly formatted (ISO 8601)
- Ensure the animation interval doesn't cause memory issues

## Development Notes

### Component Structure
```
RadarApp (main app)
├── ProductSelector (radar/product selection)
├── SimpleMapView (map with tiles)
├── AnimationControls (playback controls)
├── LegendComponent (color scale)
├── OpacityControl (opacity slider)
├── Alerts (error messages)
└── Loader (loading indicator)
```

### State Management
The application uses React hooks for state management:
- `useState` for local component state
- `useEffect` for side effects (API calls, animations)
- `useRef` for animation intervals

No external state management library (Redux, etc.) is used to keep it simple.

### API Error Handling
All API calls are wrapped in try-catch blocks with user-friendly error messages displayed via snackbar notifications.
