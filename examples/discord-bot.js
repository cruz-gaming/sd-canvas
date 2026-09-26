/**
 * Discord.js v14 Integration Guide & Example
 * SD Canvas - Stacks Development (SD)
 * Design Once. Render Everywhere.
 *
 * NOTE: discord.js is NOT a dependency of sd-canvas.
 * This demonstrates how easy it is to plug sd-canvas directly into any Discord bot.
 */

import { Canvas } from '../src/index.js';

/**
 * Example Discord event listener: guildMemberAdd
 *
 * @param {import('discord.js').GuildMember} member
 */
export async function onGuildMemberAdd(member) {
  // 1. Initialize canvas and pick the welcome preset
  const canvas = new Canvas();

  // 2. Apply dynamic variables from Discord guild member
  canvas.usePreset('welcome', {
    username: member.user.tag || member.user.username,
    avatar: member.user.displayAvatarURL({ extension: 'png', size: 256, forceStatic: true }),
    guild: {
      name: member.guild.name
    },
    memberCount: member.guild.memberCount
  });

  // 3. Render directly to a PNG Buffer
  const buffer = await canvas.render();

  // 4. Send to Discord channel using native Attachment
  const welcomeChannel = member.guild.channels.cache.find(c => c.name === 'welcome');
  if (welcomeChannel) {
    await welcomeChannel.send({
      content: `Welcome to the server, ${member}!`,
      files: [
        {
          attachment: buffer,
          name: `welcome-${member.id}.png`
        }
      ]
    });
  }
}

/**
 * Example Slash Command: /rank
 *
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {object} userDatabaseRecord
 */
export async function handleRankCommand(interaction, userDatabaseRecord) {
  await interaction.deferReply();

  const user = interaction.user;

  // Calculate progress width (max width 545px in rank preset)
  const currentXP = userDatabaseRecord.xp;
  const neededXP = userDatabaseRecord.nextLevelXP;
  const ratio = Math.min(1, Math.max(0, currentXP / neededXP));
  const progressWidth = Math.round(545 * ratio);

  const canvas = new Canvas();
  canvas.usePreset('rank', {
    username: user.username,
    avatar: user.displayAvatarURL({ extension: 'png', size: 256, forceStatic: true }),
    rank: userDatabaseRecord.rank,
    level: userDatabaseRecord.level,
    currentXP: currentXP.toLocaleString(),
    requiredXP: neededXP.toLocaleString(),
    progressWidth
  });

  const buffer = await canvas.render();

  await interaction.editReply({
    files: [
      {
        attachment: buffer,
        name: `rank-${user.id}.png`
      }
    ]
  });
}

console.log('Discord.js integration example loaded. See functions onGuildMemberAdd and handleRankCommand.');
