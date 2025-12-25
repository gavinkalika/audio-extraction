import { spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import ora from 'ora';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Downloads audio from a YouTube video URL
 * @param {string} url - YouTube video URL to download audio from
 * @param {Object} options - Download options
 * @param {string} options.format - Audio format (mp3, m4a, wav)
 * @param {string} options.quality - Audio quality (0=best, 9=worst)
 * @returns {Promise<void>}
 */
export async function downloadYouTubeAudio(url, options) {
  const spinner = ora('Fetching video information...').start();

  try {
    // Create output path
    const audioDir = path.join(__dirname, 'audio');
    await fs.ensureDir(audioDir);

    // Get video title first for display
    const titleProcess = spawn('yt-dlp', ['--get-title', url]);
    let videoTitle = '';

    titleProcess.stdout.on('data', (data) => {
      videoTitle += data.toString().trim();
    });

    await new Promise((resolve, reject) => {
      titleProcess.on('exit', (code) => {
        if (code === 0) resolve();
        else reject(new Error('Failed to get video title'));
      });
      titleProcess.on('error', reject);
    });

    spinner.text = `Downloading audio: ${chalk.cyan(videoTitle)}`;

    // Prepare yt-dlp arguments
    const outputTemplate = path.join(audioDir, '%(title)s.%(ext)s');
    const ytdlpArgs = [
      url,
      '-x', // Extract audio
      '--audio-format', options.format,
      '--audio-quality', options.quality,
      '-o', outputTemplate,
      '--progress',
      '--newline', // Progress on new lines
      '--no-playlist', // Download single video only
      '--restrict-filenames', // Sanitize filenames
    ];

    // Run yt-dlp
    const downloadProcess = spawn('yt-dlp', ytdlpArgs);

    let lastPercent = '0';

    // Handle stdout (progress updates)
    downloadProcess.stdout.on('data', (data) => {
      const output = data.toString();

      // Parse progress percentage
      const percentMatch = output.match(/(\d+\.\d+)%/);
      if (percentMatch) {
        lastPercent = percentMatch[1];
        spinner.text = `Downloading audio: ${chalk.cyan(videoTitle)} - ${lastPercent}%`;
      }

      // Check if extraction is happening
      if (output.includes('[ExtractAudio]')) {
        spinner.text = `Extracting audio: ${chalk.cyan(videoTitle)}`;
      }

      // Check if conversion is happening
      if (output.includes('Deleting original file')) {
        spinner.text = `Converting to ${options.format}: ${chalk.cyan(videoTitle)}`;
      }
    });

    // Handle stderr (error messages)
    let errorOutput = '';
    downloadProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Wait for download to complete
    await new Promise((resolve, reject) => {
      downloadProcess.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`yt-dlp exited with code ${code}: ${errorOutput}`));
        }
      });

      downloadProcess.on('error', (err) => {
        reject(err);
      });
    });

    // Find the downloaded file
    const files = await fs.readdir(audioDir);
    const audioFile = files.find(f =>
      f.includes(videoTitle.replace(/[^\w\s]/gi, '_')) &&
      f.endsWith(`.${options.format}`)
    ) || files[files.length - 1]; // Fallback to most recent file

    if (audioFile) {
      spinner.succeed(chalk.green(`✓ Audio saved to: ${chalk.cyan(path.join('audio', audioFile))}`));
    } else {
      spinner.succeed(chalk.green(`✓ Audio downloaded successfully to audio directory`));
    }

  } catch (error) {
    spinner.fail(chalk.red('Failed to extract audio'));
    console.error(chalk.red(`Error: ${error.message}`));

    // Check if yt-dlp is installed
    if (error.message.includes('spawn yt-dlp ENOENT')) {
      console.log(chalk.yellow('\n⚠ yt-dlp is not installed'));
      console.log(chalk.yellow('  Install it with: brew install yt-dlp (macOS) or pip install yt-dlp'));
    }

    // Check if ffmpeg is missing
    if (error.message.includes('ffmpeg not found') || error.message.includes('ffprobe not found')) {
      console.log(chalk.yellow('\n⚠ ffmpeg is required for audio extraction'));
      console.log(chalk.yellow('  Install it with: brew install ffmpeg (macOS)'));
      console.log(chalk.yellow('  This may take a few minutes as it has many dependencies'));
    }

    process.exit(1);
  }
}