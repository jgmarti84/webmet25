import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

/**
 * List available radars
 */
export const listRadars = async () => {
  const response = await api.get("/api/v1/radars");
  return response.data;
};

/**
 * Get a specific radar by code
 */
export const getRadar = async (radarCode) => {
  const response = await api.get(`/api/v1/radars/${radarCode}`);
  return response.data;
};

/**
 * List available products
 */
export const listProducts = async (enabledOnly = true) => {
  const response = await api.get("/api/v1/products", {
    params: { enabled_only: enabledOnly },
  });
  return response.data;
};

/**
 * Get a specific product by key
 */
export const getProduct = async (productKey) => {
  const response = await api.get(`/api/v1/products/${productKey}`);
  return response.data;
};

/**
 * Get colormap for a product
 */
export const getProductColormap = async (productKey) => {
  const response = await api.get(`/api/v1/products/${productKey}/colormap`);
  return response.data;
};

/**
 * List COG files with filters
 */
export const listCogs = async ({
  radarCode = null,
  productKey = null,
  startTime = null,
  endTime = null,
  page = 1,
  pageSize = 50,
} = {}) => {
  const params = {
    page,
    page_size: pageSize,
  };
  
  if (radarCode) params.radar_code = radarCode;
  if (productKey) params.product_key = productKey;
  if (startTime) params.start_time = startTime;
  if (endTime) params.end_time = endTime;
  
  const response = await api.get("/api/v1/cogs", { params });
  return response.data;
};

/**
 * Get the latest COG for a radar and product
 */
export const getLatestCog = async (radarCode, productKey) => {
  const response = await api.get("/api/v1/cogs/latest", {
    params: {
      radar_code: radarCode,
      product_key: productKey,
    },
  });
  return response.data;
};

/**
 * Get timeline of available timestamps for animation
 */
export const getTimeline = async (radarCode, productKey, hours = 6) => {
  const response = await api.get("/api/v1/cogs/timeline", {
    params: {
      radar_code: radarCode,
      product_key: productKey,
      hours: hours,
    },
  });
  return response.data;
};

/**
 * Get a specific COG by ID
 */
export const getCog = async (cogId) => {
  const response = await api.get(`/api/v1/cogs/${cogId}`);
  return response.data;
};

/**
 * Build tile URL for a COG
 */
export const getTileUrl = (cogId) => {
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  return `${baseUrl}/api/v1/tiles/${cogId}/{z}/{x}/{y}.png`;
};

/**
 * Build tile URL by parameters
 */
export const getTileUrlByParams = (radarCode, productKey, timestamp) => {
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  return `${baseUrl}/api/v1/tiles/by-params/${radarCode}/${productKey}/${timestamp}/{z}/{x}/{y}.png`;
};

export default api;
