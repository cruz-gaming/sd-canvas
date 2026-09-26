/**
 * User Profile Card Preset
 * Stacks Development (SD)
 * Design Once. Render Everywhere.
 */

export const profilePreset = {
  width: 1000,
  height: 560,
  background: {
    type: 'gradient',
    direction: 'to bottom',
    colors: ['#090d16', '#111827']
  },
  elements: [
    // Outer card
    {
      type: 'rectangle',
      id: 'card_shell',
      x: 30,
      y: 30,
      width: 940,
      height: 500,
      radius: 24,
      fill: '#1e293b',
      stroke: 'rgba(255, 255, 255, 0.08)',
      strokeWidth: 1.5,
      shadowColor: 'rgba(0, 0, 0, 0.5)',
      shadowBlur: 25,
      shadowOffsetY: 8
    },
    // Banner / header image or gradient
    {
      type: 'rectangle',
      id: 'banner',
      x: 30,
      y: 30,
      width: 940,
      height: 180,
      radius: [24, 24, 0, 0],
      fill: {
        type: 'gradient',
        direction: 'to right',
        colors: ['#3b82f6', '#8b5cf6', '#ec4899']
      }
    },
    // Avatar
    {
      type: 'image',
      id: 'avatar',
      src: '{{avatar}}',
      x: 70,
      y: 110,
      width: 150,
      height: 150,
      circle: true,
      borderColor: '#1e293b',
      borderWidth: 6,
      shadowColor: 'rgba(0,0,0,0.4)',
      shadowBlur: 16
    },
    // Username
    {
      type: 'text',
      id: 'displayName',
      x: 245,
      y: 225,
      text: '{{displayName}}',
      fontFamily: 'sans-serif',
      fontSize: 34,
      fontWeight: 'bold',
      color: '#ffffff'
    },
    // Handle / tag
    {
      type: 'text',
      id: 'username_handle',
      x: 245,
      y: 270,
      text: '@{{username}}',
      fontFamily: 'sans-serif',
      fontSize: 20,
      color: '#94a3b8'
    },
    // Level Badge Pill
    {
      type: 'rectangle',
      id: 'lvl_pill',
      x: 770,
      y: 225,
      width: 160,
      height: 48,
      radius: 24,
      fill: '#3b82f6'
    },
    {
      type: 'text',
      id: 'lvl_text',
      x: 850,
      y: 238,
      text: 'LEVEL {{level}}',
      fontFamily: 'sans-serif',
      fontSize: 18,
      fontWeight: 'bold',
      color: '#ffffff',
      align: 'center'
    },
    // Divider line
    {
      type: 'line',
      id: 'divider',
      x1: 70,
      y1: 320,
      x2: 930,
      y2: 320,
      color: 'rgba(255, 255, 255, 0.1)',
      width: 1
    },
    // Stats: Rank
    {
      type: 'text',
      id: 'stat_rank_label',
      x: 100,
      y: 350,
      text: 'RANK',
      fontSize: 16,
      color: '#64748b',
      fontWeight: 'bold'
    },
    {
      type: 'text',
      id: 'stat_rank_val',
      x: 100,
      y: 380,
      text: '#{{rank}}',
      fontSize: 28,
      fontWeight: 'bold',
      color: '#f8fafc'
    },
    // Stats: XP
    {
      type: 'text',
      id: 'stat_xp_label',
      x: 280,
      y: 350,
      text: 'TOTAL XP',
      fontSize: 16,
      color: '#64748b',
      fontWeight: 'bold'
    },
    {
      type: 'text',
      id: 'stat_xp_val',
      x: 280,
      y: 380,
      text: '{{xp}}',
      fontSize: 28,
      fontWeight: 'bold',
      color: '#60a5fa'
    },
    // Stats: Coins
    {
      type: 'text',
      id: 'stat_coins_label',
      x: 480,
      y: 350,
      text: 'COINS',
      fontSize: 16,
      color: '#64748b',
      fontWeight: 'bold'
    },
    {
      type: 'text',
      id: 'stat_coins_val',
      x: 480,
      y: 380,
      text: '{{coins}} 🪙',
      fontSize: 28,
      fontWeight: 'bold',
      color: '#fbbf24'
    },
    // XP Progress Track
    {
      type: 'rectangle',
      id: 'progress_track',
      x: 70,
      y: 450,
      width: 860,
      height: 20,
      radius: 10,
      fill: 'rgba(255, 255, 255, 0.08)'
    },
    // XP Progress Fill
    {
      type: 'rectangle',
      id: 'progress_fill',
      x: 70,
      y: 450,
      width: '{{progressWidth}}',
      height: 20,
      radius: 10,
      fill: {
        type: 'gradient',
        direction: 'to right',
        colors: ['#3b82f6', '#8b5cf6']
      }
    }
  ]
};

export default profilePreset;
