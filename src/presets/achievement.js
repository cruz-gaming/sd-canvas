/**
 * Achievement Unlock Card Preset
 * Stacks Development (SD)
 * Design Once. Render Everywhere.
 */

export const achievementPreset = {
  width: 800,
  height: 240,
  background: {
    type: 'gradient',
    direction: 'to bottom right',
    colors: ['#18181b', '#27272a']
  },
  elements: [
    // Outer card
    {
      type: 'rectangle',
      id: 'card',
      x: 20,
      y: 20,
      width: 760,
      height: 200,
      radius: 18,
      fill: '#18181b',
      stroke: 'rgba(234, 179, 8, 0.4)',
      strokeWidth: 2,
      shadowColor: 'rgba(0, 0, 0, 0.5)',
      shadowBlur: 20
    },
    // Left decorative icon badge
    {
      type: 'rectangle',
      id: 'icon_bg',
      x: 50,
      y: 50,
      width: 140,
      height: 140,
      radius: 20,
      fill: {
        type: 'gradient',
        direction: 'to bottom right',
        colors: ['#eab308', '#ca8a04']
      },
      shadowColor: 'rgba(234, 179, 8, 0.35)',
      shadowBlur: 15
    },
    // Trophy / Star icon text
    {
      type: 'text',
      id: 'icon_emoji',
      x: 120,
      y: 85,
      text: '🏆',
      fontSize: 50,
      align: 'center'
    },
    // Header label
    {
      type: 'text',
      id: 'header_label',
      x: 225,
      y: 50,
      text: 'ACHIEVEMENT UNLOCKED',
      fontFamily: 'sans-serif',
      fontSize: 16,
      fontWeight: 'bold',
      color: '#eab308',
      letterSpacing: 2
    },
    // Achievement Title
    {
      type: 'text',
      id: 'title',
      x: 225,
      y: 82,
      text: '{{title}}',
      fontFamily: 'sans-serif',
      fontSize: 32,
      fontWeight: 'bold',
      color: '#ffffff',
      maxWidth: 500,
      ellipsis: true
    },
    // Achievement Description
    {
      type: 'text',
      id: 'description',
      x: 225,
      y: 130,
      text: '{{description}}',
      fontFamily: 'sans-serif',
      fontSize: 18,
      color: '#a1a1aa',
      maxWidth: 500,
      wrap: true,
      maxLines: 2
    },
    // Reward points badge
    {
      type: 'rectangle',
      id: 'pts_bg',
      x: 640,
      y: 50,
      width: 110,
      height: 36,
      radius: 18,
      fill: 'rgba(234, 179, 8, 0.15)',
      stroke: 'rgba(234, 179, 8, 0.4)',
      strokeWidth: 1
    },
    {
      type: 'text',
      id: 'pts_text',
      x: 695,
      y: 58,
      text: '+{{points}} XP',
      fontFamily: 'sans-serif',
      fontSize: 14,
      fontWeight: 'bold',
      color: '#fde047',
      align: 'center'
    }
  ]
};

export default achievementPreset;
