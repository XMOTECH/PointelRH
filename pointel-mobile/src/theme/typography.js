const Typography = {
  // Architectural Space Grotesk (Headlines)
  display:  { fontFamily: 'SpaceGrotesk_700Bold',    fontSize: 32, lineHeight: 40, letterSpacing: -0.64 },
  headline: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 24, lineHeight: 32, letterSpacing: -0.48 },
  title:    { fontFamily: 'SpaceGrotesk_500Medium',   fontSize: 18, lineHeight: 26 },

  // Functional Inter (Body)
  body_lg:  { fontFamily: 'Inter_500Medium',   fontSize: 16, lineHeight: 24 },
  body_md:  { fontFamily: 'Inter_400Regular',  fontSize: 14, lineHeight: 22 },
  caption:  { fontFamily: 'Inter_400Regular',  fontSize: 12, lineHeight: 18 },
  label:    { fontFamily: 'Inter_600SemiBold', fontSize: 12, lineHeight: 16, textTransform: 'uppercase' },

  // Aliases (backward compat)
  h1: { fontFamily: 'SpaceGrotesk_700Bold',    fontSize: 28, lineHeight: 36, letterSpacing: -0.56 },
  h2: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 22, lineHeight: 30, letterSpacing: -0.44 },
  h3: { fontFamily: 'SpaceGrotesk_500Medium',   fontSize: 18, lineHeight: 26 },
};

export { Typography };
export default Typography;
