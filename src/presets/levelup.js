/**
 * Level-Up Card Preset
 * Stacks Development (SD)
 * Design Once. Render Everywhere.
 */

export const levelupPreset = {
  width: 1000,
  height: 400,
  background: {
    type: 'gradient',
    direction: 'to bottom right',
    colors: ['#1e1b4b', '#0f172a']
  },
  elements: [
    // Outer card
    {
      type: 'rectangle',
      id: 'card',
      x: 30,
      y: 30,
      width: 940,
      height: 340,
      radius: 24,
      fill: 'rgba(30, 27, 75, 0.6)',
      stroke: 'rgba(234, 179, 8, 0.4)',
      strokeWidth: 2,
      shadowColor: 'rgba(234, 179, 8, 0.25)',
      shadowBlur: 25
    },
    // Avatar
    {
      type: 'image',
      id: 'avatar',
      src: '{{avatar}}',
      x: 70,
      y: 95,
      width: 210,
      height: 210,
      circle: true,
      borderColor: '#eab308',
      borderWidth: 6,
      shadowColor: 'rgba(234, 179, 8, 0.4)',
      shadowBlur: 20
    },
    // Sub-title
    {
      type: 'text',
      id: 'sub_label',
      x: 320,
      y: 90,
      text: 'CONGRATULATIONS!',
      fontFamily: 'sans-serif',
      fontSize: 20,
      fontWeight: 'bold',
      color: '#eab308',
      letterSpacing: 3
    },
    // Heading
    {
      type: 'text',
      id: 'main_heading',
      x: 320,
      y: 125,
      text: 'LEVEL UP!',
      fontFamily: 'sans-serif',
      fontSize: 56,
      fontWeight: 'bold',
      color: '#ffffff',
      shadowColor: 'rgba(0, 0, 0, 0.5)',
      shadowBlur: 10
    },
    // Username and level transition
    {
      type: 'text',
      id: 'user_desc',
      x: 320,
      y: 205,
      text: '{{username}} just advanced to Level {{level}}!',
      fontFamily: 'sans-serif',
      fontSize: 26,
      color: '#cbd5e1'
    },
    // Big Level Badge
    {
      type: 'rectangle',
      id: 'badge_bg',
      x: 320,
      y: 260,
      width: 240,
      height: 52,
      radius: 26,
      fill: {
        type: 'gradient',
        direction: 'to right',
        colors: ['#eab308', '#ca8a04']
      },
      shadowColor: 'rgba(234, 179, 8, 0.5)',
      shadowBlur: 15
    },
    {
      type: 'text',
      id: 'badge_text',
      x: 440,
      y: 274,
      text: '⚡ LEVEL {{level}} REACHED',
      fontFamily: 'sans-serif',
      fontSize: 18,
      fontWeight: 'bold',
      color: '#000000',
      align: 'center'
    }
  ]
};

export default levelupPreset;
