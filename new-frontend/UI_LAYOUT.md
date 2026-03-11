# UI Layout Overview

## Desktop Layout (1920x1080)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🎯 Radar Visualization                                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                     ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ┌──────────────────────────┐                        │
│                          │  Radar: RMA3 - Mar del   ▼│                       │
│                          │  Product: DBZH - Reflect ▼│                       │
│                          └──────────────────────────┘                        │
│  ┌────────────────┐                                      ┌────────────────┐ │
│  │   💧 Opacity   │                                      │   DBZH (dBZ)   │ │
│  │   ━━━━━●───    │                                      │   ▬ 60 Heavy   │ │
│  │      70%       │         🗺️ Interactive Map          │   ▬ 50 Strong  │ │
│  │                │         With Radar Overlay           │   ▬ 40 Moderate│ │
│  │                │                                      │   ▬ 30 Light   │ │
│  │                │                                      │   ▬ 20 V.Light │ │
│  │                │                                      │   ▬ 10 Weak    │ │
│  └────────────────┘                                      └────────────────┘ │
│                                                                              │
│                                                                              │
│                                                                              │
│                         ┌────────────────────────────┐                      │
│                         │  ⏮  ▶️  ⏭  ⚡ 1x  ━━●━━━━  │                     │
│                         │   2026-02-13 14:30 UTC     │                      │
│                         │   Frame 45 / 100           │                      │
│                         └────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Positions

### Header (Top, 60px height)
- Logo on left
- Title next to logo
- Full width, white background
- Drop shadow for depth

### Product Selector (Top center, floating)
- Position: Absolute, top 80px, centered
- Two dropdowns side by side
- Semi-transparent white background
- Drop shadow
- Z-index: 1000

### Opacity Control (Top left, floating)
- Position: Absolute, top 180px, left 20px
- Vertical slider with percentage
- Semi-transparent white background
- Drop shadow
- Z-index: 1000

### Legend (Top right, floating)
- Position: Absolute, top 180px, right 20px
- Color scale with labels
- Semi-transparent white background
- Drop shadow
- Z-index: 1000

### Map (Full screen)
- Position: Absolute, top 60px, bottom 0
- Fills entire viewport below header
- Base map layer + radar overlay
- Interactive (pan, zoom)

### Animation Controls (Bottom center, floating)
- Position: Absolute, bottom 20px, centered
- Play/pause, speed, timeline slider
- Timestamp and frame counter
- Semi-transparent white background
- Drop shadow
- Z-index: 1000

## Responsive Behavior

### Desktop (>1200px)
- All controls visible
- Opacity control on left
- Legend on right
- Animation controls full width

### Tablet (768px - 1200px)
- Controls adapt size
- Legend may stack items
- Animation controls responsive

### Mobile (<768px)
- Controls collapse/hide
- Touch-optimized buttons
- Single column layout

## Color Scheme

### Primary Colors
- Primary: #667eea (Purple-blue)
- Secondary: #764ba2 (Purple)
- Background: #f5f5f5
- White: #ffffff

### Text Colors
- Primary text: #333333
- Secondary text: #666666
- Disabled: #999999

### UI Elements
- Border: #ddd
- Shadow: rgba(0,0,0,0.1)
- Hover: #e0e0e0

## Typography

### Fonts
- Primary: 'Roboto', 'Segoe UI', Arial, sans-serif
- Monospace: 'Courier New', monospace

### Sizes
- Header: 18px
- Subtitle: 14px
- Body: 14px
- Caption: 12px
- Small: 10px

## Interactions

### Hover States
- Buttons: Darken background
- Dropdowns: Show border
- Sliders: Highlight thumb

### Active States
- Playing: Highlight play button
- Selected: Bold text
- Focused: Blue outline

### Loading States
- Spinner overlay
- Disabled controls
- Progress indicators

## Accessibility

### Screen Readers
- All controls labeled
- Alt text on icons
- ARIA attributes

### Keyboard Navigation
- Tab through controls
- Space/Enter to activate
- Arrow keys for sliders

### Color Contrast
- WCAG AA compliant
- High contrast mode support
- Colorblind-friendly palette

## Animation

### Transitions
- Smooth opacity changes (200ms)
- Frame transitions (instant)
- Control reveals (300ms)

### Easing
- Ease-in-out for most
- Linear for sliders
- Spring for interactions

## Performance

### Optimization
- Lazy load tiles
- Debounce slider updates
- Memoize expensive renders
- Virtual scrolling (future)

### Caching
- Tile cache in browser
- API response cache
- Component memoization

## Error States

### No Data
- Message: "No data available"
- Suggestion: "Try different radar/product"
- Icon: ℹ️

### Loading Error
- Message: "Error loading data"
- Retry button
- Icon: ⚠️

### Network Error
- Message: "Connection error"
- Check connection message
- Icon: 🔴

## Success States

### Data Loaded
- Snackbar: "Loaded X frames"
- Brief display (4 seconds)
- Green checkmark

### Frame Changed
- Smooth transition
- Update timestamp
- No notification

## Empty States

### No Radars
- Message: "No radars configured"
- Contact admin message
- Icon: 📡

### No Products
- Message: "No products available"
- Check configuration message
- Icon: 📊

## Interactive Elements

### Buttons
- Clear hover state
- Click feedback
- Disabled state visible

### Dropdowns
- Search/filter support
- Keyboard navigation
- Clear selection option

### Sliders
- Drag thumb
- Click track to jump
- Arrow key support

### Map
- Pan by drag
- Zoom by scroll/buttons
- Double-click to zoom

## Z-Index Layers

```
1000 - Floating controls (selector, opacity, legend, animation)
 900 - Modal dialogs
 800 - Dropdown menus
 500 - Radar overlay layer
 100 - Map controls (zoom, attribution)
   1 - Base map layer
   0 - Background
```

## Grid System

### Layout Grid
- Container: Max 1920px
- Padding: 20px
- Gap: 20px
- Columns: Flexible

### Component Grid
- Controls: Fixed positions
- Map: Fills available space
- Responsive breakpoints

## Print Layout

### Print Styles
- Hide controls
- Full page map
- High resolution
- Landscape orientation

## Themes (Future)

### Light Theme (Default)
- White backgrounds
- Light shadows
- Bright colors

### Dark Theme (Future)
- Dark backgrounds
- Subtle shadows
- Muted colors

## Branding

### Logo
- Circular icon
- Gradient background
- White letter/symbol
- 40px size

### Colors
- Match radar imagery
- Professional look
- Accessible contrast
