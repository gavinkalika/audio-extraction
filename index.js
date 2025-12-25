#!/usr/bin/env node

import { program } from 'commander';
import { downloadYouTubeAudio } from './audio-downloader.js';

program
  .name('audio-extractor')
  .description('CLI tool to extract audio from YouTube videos')
  .version('1.0.0')
  .argument('<url>', 'YouTube video URL')
  .option('-f, --format <format>', 'audio format (mp3, m4a, wav)', 'mp3')
  .option('-q, --quality <quality>', 'audio quality (0=best, 9=worst)', '0')
  .action(async (url, options) => {
    await downloadYouTubeAudio(url, options);
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no arguments
if (!process.argv.slice(2).length) {
  program.outputHelp();
}