import { Box, IconButton, Slider, Typography, Paper } from "@mui/material";
import {
  PlayArrow,
  Pause,
  SkipPrevious,
  SkipNext,
  Speed,
} from "@mui/icons-material";

export default function AnimationControls({
  isPlaying,
  playSpeed,
  currentIndex,
  totalFrames,
  onPlayPause,
  onSpeedChange,
  onIndexChange,
  timestamps = [],
}) {
  const speedOptions = [0.5, 1, 2];
  
  const handleSpeedToggle = () => {
    const currentIdx = speedOptions.indexOf(playSpeed);
    const nextIdx = (currentIdx + 1) % speedOptions.length;
    onSpeedChange(speedOptions[nextIdx]);
  };
  
  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : totalFrames - 1;
    onIndexChange(newIndex);
  };
  
  const handleNext = () => {
    const newIndex = (currentIndex + 1) % totalFrames;
    onIndexChange(newIndex);
  };
  
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        padding: 2,
        minWidth: 400,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        zIndex: 1000,
      }}
    >
      <Box display="flex" alignItems="center" gap={1}>
        {/* Previous button */}
        <IconButton onClick={handlePrevious} size="small">
          <SkipPrevious />
        </IconButton>
        
        {/* Play/Pause button */}
        <IconButton onClick={onPlayPause} color="primary">
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
        
        {/* Next button */}
        <IconButton onClick={handleNext} size="small">
          <SkipNext />
        </IconButton>
        
        {/* Speed control */}
        <IconButton onClick={handleSpeedToggle} size="small" title={`Speed: ${playSpeed}x`}>
          <Speed />
          <Typography variant="caption" sx={{ ml: 0.5 }}>
            {playSpeed}x
          </Typography>
        </IconButton>
        
        {/* Timeline slider */}
        <Box flex={1} ml={2} mr={2}>
          <Slider
            value={currentIndex}
            min={0}
            max={totalFrames - 1}
            onChange={(_, value) => onIndexChange(value)}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `Frame ${value + 1}/${totalFrames}`}
          />
        </Box>
      </Box>
      
      {/* Current timestamp */}
      {timestamps[currentIndex] && (
        <Typography variant="caption" align="center" display="block" mt={1}>
          {formatTimestamp(timestamps[currentIndex])}
        </Typography>
      )}
    </Paper>
  );
}
