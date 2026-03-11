import { Box, Slider, Typography, Paper } from "@mui/material";
import { Opacity } from "@mui/icons-material";

export default function OpacityControl({ opacity, onChange }) {
  const handleChange = (_, value) => {
    onChange(value / 100);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        top: 100,
        left: 20,
        padding: 2,
        minWidth: 200,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        zIndex: 1000,
      }}
    >
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Opacity />
        <Typography variant="subtitle2" fontWeight="bold">
          Opacity
        </Typography>
      </Box>
      
      <Slider
        value={opacity * 100}
        min={0}
        max={100}
        onChange={handleChange}
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => `${value}%`}
      />
    </Paper>
  );
}
