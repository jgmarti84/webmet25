# Frontend API Integration - Summary

## Overview

This PR integrates the `new-frontend` React application with the existing radar database API, eliminating the need for file uploads and enabling direct visualization of pre-processed COG (Cloud Optimized GeoTIFF) files stored in the database.

## Problem Statement

The original frontend required users to:
1. Upload BUFR/HDF5 radar files
2. Wait for backend processing to generate COG files
3. Manage temporary sessions and file cleanup

The new system needed to:
1. Work with pre-existing COG files in the database
2. Provide instant visualization without uploads
3. Support temporal animation of radar data
4. Maintain the design and styling of the new-frontend

## Solution

### Architecture Changes

**Before:**
```
User → Upload Files → Backend Processing → COG Generation → Visualization
```

**After:**
```
User → Select Radar/Product → Query Database → Tile Serving → Visualization
```

### New Components Created

1. **API Client** (`src/api/radarApi.js`)
   - Wrapper around axios for backend API calls
   - Methods for radars, products, COGs, and colormaps
   - Tile URL generation functions

2. **Main Application** (`src/RadarApp.jsx`)
   - Simplified app focused on database visualization
   - Auto-loads radars and products on startup
   - Manages animation state and playback
   - Handles radar/product selection

3. **Map Component** (`src/components/map/SimpleMapView.jsx`)
   - Lightweight map using react-leaflet
   - Base map layer (OpenStreetMap)
   - Radar tile overlay from API
   - Dynamic opacity control

4. **UI Controls**
   - `AnimationControls.jsx` - Play/pause, speed, timeline slider
   - `ProductSelector.jsx` - Radar and product dropdowns
   - `LegendComponent.jsx` - Color scale display
   - `OpacityControl.jsx` - Overlay opacity adjustment

### Routing Changes

Updated `src/main.jsx` to support multiple frontends:
- `/` - New database-driven visualization (RadarApp)
- `/old` - Original file upload interface (App)
- `/cache` - Cache statistics view

## Features Implemented

### Core Functionality
✅ List available radars from database
✅ List available products with metadata
✅ Query COG files by radar, product, and time range
✅ Fetch colormap configuration from API
✅ Render radar tiles on interactive map
✅ Center map on selected radar location

### Animation System
✅ Timeline of available observations (last 6 hours)
✅ Play/pause animation
✅ Speed control (0.5x, 1x, 2x)
✅ Frame navigation (previous/next)
✅ Timeline slider for direct frame selection
✅ Timestamp display

### Visual Controls
✅ Legend showing color scale with values
✅ Opacity slider for radar overlay
✅ Radar and product selection dropdowns
✅ Loading indicators
✅ Error notifications

## API Endpoints Used

### Radars
- `GET /api/v1/radars` - List all radars
- `GET /api/v1/radars/{code}` - Get specific radar

### Products
- `GET /api/v1/products` - List all products
- `GET /api/v1/products/{key}` - Get specific product
- `GET /api/v1/products/{key}/colormap` - Get color mapping

### COGs
- `GET /api/v1/cogs` - List COG files with filters
  - Query params: `radar_code`, `product_key`, `start_time`, `end_time`, `page`, `page_size`
- `GET /api/v1/cogs/latest` - Get most recent COG
- `GET /api/v1/cogs/{id}` - Get specific COG metadata

### Tiles
- `GET /api/v1/tiles/{cog_id}/{z}/{x}/{y}.png` - Get map tile as PNG

## Files Changed

### New Files
```
new-frontend/
├── src/
│   ├── RadarApp.jsx                          # Main app component
│   ├── api/
│   │   └── radarApi.js                       # API client
│   ├── components/
│   │   ├── map/
│   │   │   └── SimpleMapView.jsx            # Map component
│   │   └── ui/
│   │       ├── AnimationControls.jsx        # Animation UI
│   │       ├── LegendComponent.jsx          # Color legend
│   │       ├── OpacityControl.jsx           # Opacity slider
│   │       └── ProductSelector.jsx          # Radar/product dropdowns
├── README_INTEGRATION.md                     # Integration docs
├── TESTING.md                                # Testing guide
└── .env                                      # Environment config
```

### Modified Files
```
.gitignore                                    # Added node_modules, dist
new-frontend/src/main.jsx                     # Updated routing
```

## Technical Details

### State Management
- React hooks (useState, useEffect, useRef)
- No external state library needed
- Local state for UI components
- Derived state for current frame

### Data Flow
```
1. App mounts → Load radars and products
2. User selects radar → Update selected radar
3. User selects product → Query COGs for last 6 hours
4. COGs loaded → Display latest frame
5. User plays animation → Cycle through frames
6. Each frame → Request tiles from API
```

### Performance Considerations
- COG queries limited to 6 hours (configurable)
- Tiles cached by browser
- Animation interval adjustable by speed
- Lazy loading of map tiles
- Cleanup on component unmount

## Configuration

### Environment Variables
```env
VITE_API_URL=http://localhost:8000
```

### Docker Compose
The frontend can be built and deployed using Docker:
```yaml
new-frontend:
  build:
    context: ./new-frontend
  ports:
    - "3000:80"
  depends_on:
    - api
```

## Testing

### Manual Testing
See `TESTING.md` for complete testing checklist.

Quick test:
```bash
# Start services
docker-compose up -d radar_db api

# Start frontend
cd new-frontend
npm install
npm run dev

# Open http://localhost:3000
```

### Expected Behavior
1. Dropdown menus populate with radars and products
2. Selecting radar/product loads data
3. Map displays radar overlay
4. Animation controls appear if multiple frames
5. Legend shows color scale
6. Opacity slider adjusts transparency

## Known Limitations

1. **Single Radar Display**
   - Currently shows one radar at a time
   - Multi-radar overlay not implemented (possible future enhancement)

2. **Fixed Time Range**
   - Hardcoded to last 6 hours
   - Custom time range picker not implemented

3. **Limited Product Support**
   - Only products in database are available
   - No custom product creation

4. **No Advanced Tools**
   - No measurement tools (distance, area)
   - No export functionality
   - No comparison mode

## Benefits

### For Users
- **Faster visualization** - No file upload or processing
- **Historical data** - Access to archived observations
- **Smooth animation** - Pre-processed frames
- **Reliable** - Database-backed, no session management

### For Developers
- **Simpler architecture** - Less backend complexity
- **Better separation** - Frontend/backend decoupling
- **Easier maintenance** - Standard REST API
- **Scalable** - Database handles large datasets

## Future Enhancements

### Short Term
- [ ] Add time range selector
- [ ] Implement error recovery and retry logic
- [ ] Add loading progress indicators
- [ ] Optimize tile loading and caching

### Medium Term
- [ ] Multi-radar overlay support
- [ ] Custom colormap selection
- [ ] Export current frame as image
- [ ] Measurement tools (distance, area)

### Long Term
- [ ] Real-time data updates via WebSockets
- [ ] Advanced filtering (elevation, height)
- [ ] Comparison mode (side-by-side)
- [ ] Mobile-optimized interface

## Migration Guide

### For Existing Users

**Old workflow:**
1. Go to application
2. Upload radar files
3. Select product and parameters
4. Wait for processing
5. View results

**New workflow:**
1. Go to application (automatically loads)
2. Select radar from dropdown
3. Select product from dropdown
4. View results immediately

### For Developers

To use the new frontend in your deployment:

1. **Update docker-compose.yml:**
   ```yaml
   frontend:
     build:
       context: ./new-frontend
     environment:
       VITE_API_URL: http://api:8000
   ```

2. **Ensure API is accessible:**
   - CORS configured correctly
   - All required endpoints available
   - Database seeded with radar/product data

3. **Run indexer:**
   - Continuously scans for new COG files
   - Updates database with metadata
   - Required for new data to appear

## Conclusion

This integration successfully connects the new-frontend with the database API, providing a streamlined user experience for radar visualization. The implementation maintains the design aesthetic of the original frontend while simplifying the data flow and eliminating the need for file uploads.

The modular architecture allows for future enhancements while keeping the current implementation simple and maintainable.

## References

- API Documentation: `api/app/main.py`
- Database Models: `database/radar_db/models.py`
- Original Frontend: `frontend/`
- Integration Docs: `new-frontend/README_INTEGRATION.md`
- Testing Guide: `new-frontend/TESTING.md`
