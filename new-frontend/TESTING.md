# Testing the New Frontend Integration

This document describes how to test the new frontend integration with the database API.

## Prerequisites

1. **Backend API must be running**
   - The API service should be accessible at `http://localhost:8000`
   - Database should contain radar and product data
   - COG files should be indexed in the database

2. **Node.js installed**
   - Version 18 or higher recommended

## Testing Steps

### 1. Start the Backend Services

```bash
# From the project root
docker-compose up -d radar_db db-init
docker-compose up -d api indexer
```

Wait for services to be healthy:
```bash
docker-compose ps
```

### 2. Verify API is Working

```bash
# Check API health
curl http://localhost:8000/health

# List radars
curl http://localhost:8000/api/v1/radars

# List products
curl http://localhost:8000/api/v1/products
```

### 3. Start the Frontend Development Server

```bash
cd new-frontend
npm install
npm run dev
```

The application should start at `http://localhost:3000`

### 4. Manual Testing Checklist

#### Initial Load
- [ ] Application loads without errors
- [ ] Radar selector is populated with radars from API
- [ ] Product selector is populated with products from API
- [ ] Map displays with base layer (OpenStreetMap)

#### Radar Data Display
- [ ] Select a radar from dropdown
- [ ] Select a product (e.g., DBZH)
- [ ] Wait for data to load
- [ ] Radar overlay appears on map
- [ ] Legend shows color scale with correct values
- [ ] Map centers on selected radar location

#### Animation Controls
- [ ] If multiple frames available, animation controls appear
- [ ] Play button starts animation
- [ ] Pause button stops animation
- [ ] Speed control toggles between 0.5x, 1x, 2x
- [ ] Previous/Next buttons navigate frames
- [ ] Slider allows direct frame selection
- [ ] Current timestamp displays correctly

#### Opacity Control
- [ ] Opacity slider is visible
- [ ] Moving slider changes radar overlay opacity
- [ ] Opacity changes are smooth and responsive

#### Error Handling
- [ ] Selecting radar/product with no data shows warning
- [ ] Network errors display error messages
- [ ] Loading indicator shows during API calls

### 5. Browser Console Testing

Open browser developer tools (F12) and check:

```javascript
// Test API client directly
import { listRadars, listProducts, listCogs } from './api/radarApi';

// Should return radar list
const radars = await listRadars();
console.log('Radars:', radars);

// Should return product list
const products = await listProducts();
console.log('Products:', products);

// Should return COGs for a radar/product
const cogs = await listCogs({
  radarCode: 'RMA3',
  productKey: 'DBZH',
});
console.log('COGs:', cogs);
```

### 6. Network Tab Testing

In browser dev tools Network tab:

1. **On initial load**, verify requests to:
   - `GET /api/v1/radars`
   - `GET /api/v1/products`

2. **When selecting radar/product**, verify:
   - `GET /api/v1/cogs?radar_code=...&product_key=...`
   - `GET /api/v1/products/{key}/colormap`

3. **When map is visible**, verify tile requests:
   - `GET /api/v1/tiles/{cog_id}/{z}/{x}/{y}.png`
   - Should return status 200 with PNG image
   - Check response headers include CORS headers

### 7. Known Issues to Test

1. **No Data Available**
   - If no COGs exist in database for selected radar/product
   - Should show warning message, not error

2. **CORS Issues**
   - Tile requests might fail if CORS not configured
   - Check API CORS_ORIGINS environment variable

3. **Tile Loading Performance**
   - With many frames, tile loading might be slow
   - Animation should preload next frame

### 8. Comparison with Original Frontend

Navigate to `http://localhost:3000/old` to see original frontend:

**Differences:**
- Old: File upload → processing → visualization
- New: Direct database query → visualization
- Old: Temporary COG generation
- New: Persistent COG storage
- Old: Complex multi-radar workflows
- New: Single radar at a time (simpler)

### 9. Production Build Testing

Test the production build:

```bash
cd new-frontend
npm run build
npm run preview
```

Or using Docker:

```bash
docker-compose build new-frontend
docker-compose up new-frontend
```

Access at `http://localhost:80`

## Expected Results

### Success Criteria
✅ Application loads and displays map
✅ Radars and products populate from API
✅ Selecting radar/product shows radar data
✅ Animation works with multiple frames
✅ Legend displays correct colors
✅ Opacity control works smoothly
✅ No console errors (except for missing data)

### Common Issues

**Issue**: No radars/products in dropdown
- **Cause**: Database not seeded or API not running
- **Solution**: Run `docker-compose up db-init` to seed database

**Issue**: Map shows but no radar overlay
- **Cause**: No COG files in database for selected radar/product
- **Solution**: Run indexer to scan and index COG files

**Issue**: Tiles fail to load (404 errors)
- **Cause**: COG files missing from disk or wrong path
- **Solution**: Check COG_BASE_PATH in API environment

**Issue**: CORS errors in console
- **Cause**: API not configured for frontend origin
- **Solution**: Set CORS_ORIGINS="*" in API environment

## Screenshots

Take screenshots of:
1. Initial application load
2. Radar data displayed on map
3. Animation controls in use
4. Legend component showing colors
5. Developer console showing successful API calls

## Performance Testing

Monitor:
- Initial load time (< 3 seconds ideal)
- Time to first radar display (< 2 seconds after selection)
- Animation frame rate (should be smooth at 1x speed)
- Memory usage (should not grow indefinitely during animation)

## Cleanup

After testing:
```bash
# Stop services
docker-compose down

# Clean up (optional)
rm -rf new-frontend/node_modules
rm -rf new-frontend/dist
```
