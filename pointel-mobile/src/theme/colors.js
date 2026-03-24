const Colors = {
  primary: '#0041c8', // Pointel Blue
  primary_vibrant: '#0052ff', // Skello Accent
  on_primary: '#ffffff',
  
  // Surface Hierarchy (Skello-Style Softness)
  surface: '#f8f9fc', // Neutral Base
  surface_container_lowest: '#ffffff', // Cards (Pure White)
  surface_container_low: '#f1f3f9',    // Sections
  surface_container: '#e9ecf5',        // Dividers Replace
  surface_container_high: '#dde2f0',
  surface_container_highest: '#d1d9ec',
  
  on_surface: '#12141a', // Rich Deep Grey
  on_surface_variant: '#4a4f5d',
  
  // Skello Professional Palette
  status: {
    success: { 
      bg: '#e8f5e9', 
      text: '#2e7d32', 
      vibrant: '#4caf50' 
    },
    error: { 
      bg: '#ffebee', 
      text: '#c62828', 
      vibrant: '#f44336' 
    },
    warning: { 
      bg: '#fff8e1', 
      text: '#f57f17', 
      vibrant: '#ffb300' 
    },
    info: { 
      bg: '#e3f2fd', 
      text: '#1565c0', 
      vibrant: '#2196f3' 
    },
  },
  
  // Glassmorphism tokens
  glass: 'rgba(255, 255, 255, 0.7)',
  glass_border: 'rgba(255, 255, 255, 0.3)',
};

export { Colors };
export default Colors;
