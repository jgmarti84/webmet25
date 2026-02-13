import { Box, Typography, Paper } from "@mui/material";

export default function LegendComponent({ colormap, productKey }) {
  if (!colormap || !colormap.entries || colormap.entries.length === 0) {
    return null;
  }

  const { entries, unit } = colormap;

  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        top: 100,
        right: 20,
        padding: 2,
        minWidth: 150,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        zIndex: 1000,
      }}
    >
      <Typography variant="subtitle2" gutterBottom fontWeight="bold">
        {productKey} {unit && `(${unit})`}
      </Typography>
      
      <Box display="flex" flexDirection="column" gap={0.5}>
        {entries.map((entry, index) => (
          <Box
            key={index}
            display="flex"
            alignItems="center"
            gap={1}
          >
            <Box
              sx={{
                width: 30,
                height: 20,
                backgroundColor: entry.color,
                border: "1px solid #ccc",
              }}
            />
            <Typography variant="caption">
              {entry.value} - {entry.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
