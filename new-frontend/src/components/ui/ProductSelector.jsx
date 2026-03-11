import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from "@mui/material";

export default function ProductSelector({
  radars,
  products,
  selectedRadar,
  selectedProduct,
  onRadarChange,
  onProductChange,
}) {
  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        padding: 2,
        display: "flex",
        gap: 2,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        zIndex: 1000,
      }}
    >
      {/* Radar selector */}
      <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Radar</InputLabel>
        <Select
          value={selectedRadar || ""}
          onChange={(e) => onRadarChange(e.target.value)}
          label="Radar"
        >
          {radars.map((radar) => (
            <MenuItem key={radar.code} value={radar.code}>
              {radar.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Product selector */}
      <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Product</InputLabel>
        <Select
          value={selectedProduct || ""}
          onChange={(e) => onProductChange(e.target.value)}
          label="Product"
        >
          {products.map((product) => (
            <MenuItem key={product.product_key} value={product.product_key}>
              {product.product_title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Paper>
  );
}
