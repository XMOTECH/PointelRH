import Colors from './colors';

const Shadows = {
  // Subtle ambient — cards, inputs
  sm: {
    shadowColor: Colors.on_surface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  // Medium focal — elevated cards, modals
  md: {
    shadowColor: Colors.on_surface,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 5,
  },
  // Premium floating — FAB, CTAs
  lg: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 10,
  },
};

export default Shadows;
