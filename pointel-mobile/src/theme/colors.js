const Colors = {
  primary: '#0041c8',
  primary_container: '#dbe1ff',
  on_primary: '#ffffff',
  
  // Surface Hierarchy (Tonal Layering)
  surface: '#faf8ff', // Level 0 (Base)
  surface_container_low: '#f3f2ff', // Level 1 (Sections)
  surface_container: '#ededfb', // Level 2
  surface_container_highest: '#e2e1ec', // Active/Highest
  surface_container_lowest: '#ffffff', // Level 3 (Floating Cards)
  
  on_surface: '#191b25', // Soft Black
  on_surface_variant: '#44464f',
  outline_variant: 'rgba(195, 197, 217, 0.2)', // Ghost Border (20% opacity for inputs)
  
  status: {
    success: { bg: '#e1f5ee', text: '#0f6e56' },
    error:   { bg: '#fcebeb', text: '#a32d2d' },
    warning: { bg: '#faeeda', text: '#854f0b' },
  },
};

export { Colors };
export default Colors;
