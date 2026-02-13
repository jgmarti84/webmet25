import { useState, useEffect, useRef } from "react";
import { useSnackbar } from "notistack";
import {
  listRadars,
  listProducts,
  listCogs,
  getProductColormap,
  getTileUrl,
} from "./api/radarApi";
import "./App.css";

// Import UI components
import HeaderCard from "./components/ui/HeaderCard";
import Alerts from "./components/ui/Alerts";
import Loader from "./components/ui/Loader";

// Import map components
import SimpleMapView from "./components/map/SimpleMapView";
import AnimationControls from "./components/ui/AnimationControls";
import LegendComponent from "./components/ui/LegendComponent";
import OpacityControl from "./components/ui/OpacityControl";
import ProductSelector from "./components/ui/ProductSelector";

export default function RadarApp() {
  const [radars, setRadars] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedRadar, setSelectedRadar] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cogList, setCogList] = useState([]); // Array of COG objects with id, observation_time, etc.
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [colormap, setColormap] = useState(null);
  const [opacity, setOpacity] = useState(0.7);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1); // 0.5x, 1x, 2x
  const animationIntervalRef = useRef(null);

  const { enqueueSnackbar } = useSnackbar();

  // Load radars and products on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [radarsData, productsData] = await Promise.all([
          listRadars(),
          listProducts(true),
        ]);
        
        setRadars(radarsData.radars || []);
        setProducts(productsData.products || []);
        
        // Auto-select first radar and product if available
        if (radarsData.radars && radarsData.radars.length > 0) {
          setSelectedRadar(radarsData.radars[0].code);
        }
        if (productsData.products && productsData.products.length > 0) {
          setSelectedProduct(productsData.products[0].product_key);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        setAlert({
          open: true,
          message: "Error loading radar data",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Load COGs and colormap when radar/product changes
  useEffect(() => {
    if (!selectedRadar || !selectedProduct) return;
    
    const loadCogsAndColormap = async () => {
      try {
        setLoading(true);
        
        // Get end time (now) and start time (6 hours ago)
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - 6 * 60 * 60 * 1000);
        
        const [cogsData, colormapData] = await Promise.all([
          listCogs({
            radarCode: selectedRadar,
            productKey: selectedProduct,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            pageSize: 100, // Get up to 100 frames
          }),
          getProductColormap(selectedProduct),
        ]);
        
        // Sort COGs by observation time (oldest first)
        const sortedCogs = (cogsData.cogs || []).sort((a, b) => 
          new Date(a.observation_time) - new Date(b.observation_time)
        );
        
        setCogList(sortedCogs);
        setColormap(colormapData);
        setCurrentTimeIndex(sortedCogs.length - 1); // Start at latest
        
        if (sortedCogs.length > 0) {
          enqueueSnackbar(
            `Loaded ${sortedCogs.length} frames for ${selectedProduct}`,
            { variant: "success" }
          );
        } else {
          enqueueSnackbar(
            `No data available for ${selectedRadar} / ${selectedProduct}`,
            { variant: "warning" }
          );
        }
      } catch (error) {
        console.error("Error loading COGs:", error);
        setAlert({
          open: true,
          message: "Error loading radar data",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadCogsAndColormap();
  }, [selectedRadar, selectedProduct, enqueueSnackbar]);

  // Animation control
  useEffect(() => {
    if (!isPlaying || cogList.length <= 1) {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
      return;
    }
    
    const interval = 1000 / playSpeed; // Adjust speed
    animationIntervalRef.current = setInterval(() => {
      setCurrentTimeIndex((prev) => (prev + 1) % cogList.length);
    }, interval);
    
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, [isPlaying, playSpeed, cogList.length]);

  const handleRadarChange = (radarCode) => {
    setSelectedRadar(radarCode);
    setIsPlaying(false);
  };

  const handleProductChange = (productKey) => {
    setSelectedProduct(productKey);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = (speed) => {
    setPlaySpeed(speed);
  };

  const handleTimeIndexChange = (index) => {
    setCurrentTimeIndex(index);
    setIsPlaying(false);
  };

  const handleOpacityChange = (value) => {
    setOpacity(value);
  };

  // Get current tile URL
  const currentTileUrl = cogList[currentTimeIndex]
    ? getTileUrl(cogList[currentTimeIndex].id)
    : null;

  // Get current timestamps for animation controls
  const timestamps = cogList.map(cog => cog.observation_time);

  return (
    <div
      id="app-container"
      style={{ height: "100vh", width: "100%", position: "relative" }}
    >
      {/* Header */}
      <HeaderCard
        logoSrc="/assets/lrsr_logo.png"
        title="Radar Visualization"
      />

      {/* Product/Radar Selector */}
      <ProductSelector
        radars={radars}
        products={products}
        selectedRadar={selectedRadar}
        selectedProduct={selectedProduct}
        onRadarChange={handleRadarChange}
        onProductChange={handleProductChange}
      />

      {/* Map */}
      <SimpleMapView
        tileUrl={currentTileUrl}
        opacity={opacity}
        center={
          selectedRadar && radars.length > 0
            ? (() => {
                const radar = radars.find((r) => r.code === selectedRadar);
                return radar
                  ? [parseFloat(radar.center_lat), parseFloat(radar.center_long)]
                  : [-31.4, -64.2];
              })()
            : [-31.4, -64.2]
        }
        zoom={8}
      />

      {/* Animation Controls */}
      {cogList.length > 1 && (
        <AnimationControls
          isPlaying={isPlaying}
          playSpeed={playSpeed}
          currentIndex={currentTimeIndex}
          totalFrames={cogList.length}
          onPlayPause={handlePlayPause}
          onSpeedChange={handleSpeedChange}
          onIndexChange={handleTimeIndexChange}
          timestamps={timestamps}
        />
      )}

      {/* Legend */}
      {colormap && (
        <LegendComponent
          colormap={colormap}
          productKey={selectedProduct}
        />
      )}

      {/* Opacity Control */}
      <OpacityControl
        opacity={opacity}
        onChange={handleOpacityChange}
      />

      {/* Alerts and Loader */}
      <Alerts
        open={alert.open}
        message={alert.message}
        severity={alert.severity}
        onClose={() => setAlert({ ...alert, open: false })}
      />
      <Loader open={loading} />
    </div>
  );
}
