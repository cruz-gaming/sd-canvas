/**
 * Leaderboard Rank Card Preset
 * Stacks Development (SD)
 * Design Once. Render Everywhere.
 */

export const rankPreset = {
  width: 1000,
  height: 320,
  background: {
    type: 'gradient',
    direction: 'to right',
    colors: ['#0f172a', '#1e293b']
  },
  elements: [
    // Outer card shell
    {
      type: 'rectangle',
      id: 'card_bg',
      x: 25,
      y: 25,
      width: 950,
      height: 270,
      radius: 20,
      fill: 'rgba(15, 23, 42, 0.85)',
      stroke: 'rgba(255, 255, 255, 0.08)',
      strokeWidth: 1.5,
      shadowColor: 'rgba(0, 0, 0, 0.4)',
      shadowBlur: 20
    },
    // User avatar
    {
      type: 'image',
      id: 'avatar',
      src: '{{avatar}}',
      x: 65,
      y: 65,
      width: 190,
      height: 190,
      circle: true,
      borderColor: '#38bdf8',
      borderWidth: 5,
      shadowColor: 'rgba(56, 189, 248, 0.3)',
      shadowBlur: 15
    },
    // Username
    {
      type: 'text',
      id: 'username',
      x: 290,
      y: 75,
      text: '{{username}}',
      fontFamily: 'sans-serif',
      fontSize: 40,
      fontWeight: 'bold',
      color: '#ffffff',
      maxWidth: 400,
      ellipsis: true
    },
    // Rank label + number
    {
      type: 'text',
      id: 'rank_label',
      x: 750,
      y: 70,
      text: 'RANK',
      fontFamily: 'sans-serif',
      fontSize: 18,
      fontWeight: 'bold',
      color: '#38bdf8'
    },
    {
      type: 'text',
      id: 'rank_val',
      x: 810,
      y: 56,
      text: '#{{rank}}',
      fontFamily: 'sans-serif',
      fontSize: 40,
      fontWeight: 'bold',
      color: '#ffffff'
    },
    // Level label + number
    {
      type: 'text',
      id: 'lvl_label',
      x: 880,
      y: 70,
      text: 'LEVEL',
      fontFamily: 'sans-serif',
      fontSize: 18,
      fontWeight: 'bold',
      color: '#a855f7'
    },
    {
      type: 'text',
      id: 'lvl_val',
      x: 940,
      y: 56,
      text: '{{level}}',
      fontFamily: 'sans-serif',
      fontSize: 40,
      fontWeight: 'bold',
      color: '#ffffff'
    },
    // XP ratio display
    {
      type: 'text',
      id: 'xp_ratio',
      x: 935,
      y: 160,
      text: '{{currentXP}} / {{requiredXP}} XP',
      fontFamily: 'sans-serif',
      fontSize: 20,
      fontWeight: 'bold',
      color: '#94a3b8',
      align: 'right'
    },
    // Progress Bar Background
    {
      type: 'rectangle',
      id: 'bar_track',
      x: 290,
      y: 195,
      width: 645,
      height: 28,
      radius: 14,
      fill: 'rgba(255, 255, 255, 0.08)'
    },
    // Progress Bar Fill
    {
      type: 'rectangle',
      id: 'bar_fill',
      x: 290,
      y: 195,
      width: '{{progressWidth}}',
      height: 28,
      radius: 14,
      fill: {
        type: 'gradient',
        direction: 'to right',
        colors: ['#38bdf8', '#818cf8']
      }
    }
  ]
};

export default rankPreset;
