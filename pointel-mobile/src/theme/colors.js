const Colors = {
  // Core Brand
  primary: '#0041c8',
  primary_vibrant: '#0052ff',
  primary_light: '#e8eeff',
  primary_soft: '#3370ff',
  on_primary: '#ffffff',

  // Surface Hierarchy
  background: '#f8f9fc',
  surface: '#f8f9fc',
  surface_container_lowest: '#ffffff',
  surface_container_low: '#f1f3f9',
  surface_container: '#e9ecf5',
  surface_container_high: '#dde2f0',
  surface_container_highest: '#d1d9ec',
  surface_variant: '#e9ecf5',

  // Text
  on_surface: '#12141a',
  on_surface_variant: '#4a4f5d',
  on_surface_muted: '#8b90a0',

  // Status
  status: {
    success: {
      bg: '#e8f5e9',
      text: '#2e7d32',
      vibrant: '#4caf50',
      light: '#c8e6c9',
    },
    error: {
      bg: '#ffebee',
      text: '#c62828',
      vibrant: '#f44336',
      light: '#ffcdd2',
    },
    warning: {
      bg: '#fff8e1',
      text: '#f57f17',
      vibrant: '#ffb300',
      light: '#ffecb3',
    },
    info: {
      bg: '#e3f2fd',
      text: '#1565c0',
      vibrant: '#2196f3',
      light: '#bbdefb',
    },
  },

  // Glassmorphism
  glass: 'rgba(255, 255, 255, 0.85)',
  glass_border: 'rgba(255, 255, 255, 0.4)',
  glass_dark: 'rgba(0, 0, 0, 0.6)',

  // Gradients (start/end pairs)
  gradient: {
    primary: ['#0041c8', '#0052ff'],
    surface: ['#f8f9fc', '#ffffff'],
    scanner: ['rgba(0,65,200,0.9)', 'rgba(0,82,255,0.7)'],
  },
};

export { Colors };
export default Colors;
