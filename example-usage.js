#!/usr/bin/env node

import {
  getChannelPlaylists,
  getPlaylistVideos,
  searchPlaylists,
  getVideoDetails,
  exportPlaylistData,
  getPlaylistsFromChannel,
  batchExportPlaylists
} from './youtube-api.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Example usage of YouTube API functions
async function examples() {
  try {
    console.log('YouTube API Usage Examples\n');
    console.log('='+'='.repeat(40));

    // Example 1: Search for playlists
    console.log('\n1. Searching for playlists about "JavaScript tutorials"...');
    const searchResults = await searchPlaylists('music', 5);
    console.log(`Found ${searchResults.length} playlists:`);
    searchResults.forEach(playlist => {
      console.log(`  - ${playlist.title} by ${playlist.channelTitle}`);
      console.log(`    ID: ${playlist.playlistId}`);
    });

    // Example 2: Get videos from a specific playlist
    if (searchResults.length > 0) {
      console.log('\n2. Getting videos from the first playlist...');
      const playlistId = searchResults[0].playlistId;
      const videos = await getPlaylistVideos(playlistId);
      console.log(`Found ${videos.length} videos in playlist "${searchResults[0].title}":`);
      videos.slice(0, 5).forEach(video => {
        console.log(`  - ${video.title}`);
        console.log(`    URL: ${video.url}`);
      });
    }

    // Example 3: Get playlists from a channel
    console.log('\n3. Getting playlists from a channel...');
    // You can use @handle, channel URL, or channel ID
    const channelPlaylists = await getPlaylistsFromChannel('@GoogleDevelopers');
    console.log(`Found ${channelPlaylists.length} playlists from Google Developers:`);
    channelPlaylists.slice(0, 5).forEach(playlist => {
      console.log(`  - ${playlist.title} (${playlist.videoCount} videos)`);
    });

    // Example 4: Get details of a specific video
    console.log('\n4. Getting details of a specific video...');
    // Example video ID (you can replace with any valid video ID)
    const videoId = 'dQw4w9WgXcQ'; // Rick Astley - Never Gonna Give You Up
    const videoDetails = await getVideoDetails(videoId);
    console.log('Video Details:');
    console.log(`  Title: ${videoDetails.title}`);
    console.log(`  Channel: ${videoDetails.channelTitle}`);
    console.log(`  Views: ${parseInt(videoDetails.viewCount).toLocaleString()}`);
    console.log(`  URL: ${videoDetails.url}`);

    // Example 5: Export playlist data to JSON
    if (searchResults.length > 0) {
      console.log('\n5. Exporting playlist data to JSON...');
      const playlistId = searchResults[0].playlistId;
      const outputPath = `example-playlist-${Date.now()}.json`;
      const exportedData = await exportPlaylistData(playlistId, outputPath);
      console.log(`Exported playlist "${exportedData.playlist.title}" with ${exportedData.videos.length} videos`);
      console.log(`File saved to: ${outputPath}`);
    }

    console.log('\n' + '='.repeat(40));
    console.log('Examples completed successfully!');

  } catch (error) {
    console.error('Error in examples:', error.message);
    if (error.message.includes('API key')) {
      console.error('\nPlease set up your YouTube API key:');
      console.error('1. Get an API key from https://console.cloud.google.com');
      console.error('2. Copy .env.example to .env');
      console.error('3. Add your API key to the .env file');
    }
  }
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  if (!process.env.YOUTUBE_API_KEY) {
    console.error('Error: YOUTUBE_API_KEY not found in environment variables');
    console.error('\nPlease set up your API key:');
    console.error('1. Get an API key from https://console.cloud.google.com');
    console.error('2. Copy .env.example to .env');
    console.error('3. Add your API key to the .env file');
    process.exit(1);
  }

  examples();
}
