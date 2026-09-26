/**
 * Welcome Card Preset
 * Stacks Development (SD)
 * Design Once. Render Everywhere.
 */

export const welcomePreset = {
  width: 1200,
  height: 500,
  background: {
    type: 'gradient',
    direction: 'to bottom right',
    colors: ['#0f172a', '#1e1b4b']
  },
  elements: [
    // Background glow / decorative card
    {
      type: 'rectangle',
      id: 'card_bg',
      x: 40,
      y: 40,
      width: 1120,
      height: 420,
      radius: 28,
      fill: 'rgba(30, 41, 59, 0.75)',
      stroke: 'rgba(99, 102, 241, 0.35)',
      strokeWidth: 2,
      shadowColor: 'rgba(0, 0, 0, 0.4)',
      shadowBlur: 30,
      shadowOffsetY: 10
    },
    // Decorative accent bar
    {
      type: 'rectangle',
      id: 'accent_bar',
      x: 40,
      y: 40,
      width: 1120,
      height: 8,
      radius: [28, 28, 0, 0],
      fill: {
        type: 'gradient',
        direction: 'to right',
        colors: ['#6366f1', '#ec4899']
      }
    },
    // User avatar
    {
      type: 'image',
      id: 'avatar',
      src: '{{avatar}}',
      x: 90,
      y: 120,
      width: 240,
      height: 240,
      circle: true,
      borderColor: '#6366f1',
      borderWidth: 6,
      shadowColor: 'rgba(99, 102, 241, 0.4)',
      shadowBlur: 20
    },
    // Greeting Subtitle
    {
      type: 'text',
      id: 'welcome_label',
      x: 380,
      y: 145,
      text: 'WELCOME TO {{guild.name}}',
      fontFamily: 'sans-serif',
      fontSize: 22,
      fontWeight: 'bold',
      color: '#818cf8',
      letterSpacing: 2
    },
    // Main Username
    {
      type: 'text',
      id: 'username',
      x: 380,
      y: 190,
      text: '{{username}}',
      fontFamily: 'sans-serif',
      fontSize: 54,
      fontWeight: 'bold',
      color: '#ffffff',
      maxWidth: 700,
      ellipsis: true
    },
    // Welcome message / Member count
    {
      type: 'text',
      id: 'subtext',
      x: 380,
      y: 275,
      text: 'Member #{{memberCount}} • Have a wonderful time in our community!',
      fontFamily: 'sans-serif',
      fontSize: 24,
      color: '#94a3b8'
    },
    // Badge pill
    {
      type: 'rectangle',
      id: 'badge_bg',
      x: 380,
      y: 335,
      width: 220,
      height: 48,
      radius: 24,
      fill: 'rgba(99, 102, 241, 0.2)',
      stroke: 'rgba(99, 102, 241, 0.5)',
      strokeWidth: 1.5
    },
    {
      type: 'text',
      id: 'badge_text',
      x: 490,
      y: 349,
      text: '✦ NEW MEMBER',
      fontFamily: 'sans-serif',
      fontSize: 16,
      fontWeight: 'bold',
      color: '#c7d2fe',
      align: 'center'
    }
  ]
};

export default welcomePreset;
