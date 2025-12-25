#!/usr/bin/env node

import { google } from 'googleapis';
import dotenv from 'dotenv';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize YouTube API
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

// Configuration
const CONFIG = {
  maxResults: 50, // Maximum results per API call
  maxRetries: 3,
  retryDelay: 1000, // milliseconds
};

/**
 * Get all playlists for a channel
 * @param {string} channelId - YouTube channel ID
 * @returns {Promise<Array>} Array of playlist objects
 */
export async function getChannelPlaylists(channelId) {
  try {
    const playlists = [];
    let pageToken = null;

    do {
      const response = await youtube.playlists.list({
        part: ['snippet', 'contentDetails'],
        channelId: channelId,
        maxResults: CONFIG.maxResults,
        pageToken: pageToken
      });

      if (response.data.items) {
        playlists.push(...response.data.items.map(item => ({
          id: item.id,
          title: item.snippet.title,
          description: item.snippet.description,
          videoCount: item.contentDetails.itemCount,
          thumbnails: item.snippet.thumbnails,
          publishedAt: item.snippet.publishedAt
        })));
      }

      pageToken = response.data.nextPageToken;
    } while (pageToken);

    return playlists;
  } catch (error) {
    console.error('Error fetching channel playlists:', error.message);
    throw error;
  }
}

/**
 * Get all videos from a playlist
 * @param {string} playlistId - YouTube playlist ID
 * @returns {Promise<Array>} Array of video objects with URLs
 */
export async function getPlaylistVideos(playlistId) {
  try {
    const videos = [];
    let pageToken = null;

    do {
      const response = await youtube.playlistItems.list({
        part: ['snippet', 'contentDetails'],
        playlistId: playlistId,
        maxResults: CONFIG.maxResults,
        pageToken: pageToken
      });

      if (response.data.items) {
        videos.push(...response.data.items.map(item => ({
          videoId: item.contentDetails.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          url: `https://www.youtube.com/watch?v=${item.contentDetails.videoId}`,
          thumbnails: item.snippet.thumbnails,
          position: item.snippet.position,
          publishedAt: item.snippet.publishedAt,
          channelTitle: item.snippet.channelTitle
        })));
      }

      pageToken = response.data.nextPageToken;
    } while (pageToken);

    return videos;
  } catch (error) {
    console.error('Error fetching playlist videos:', error.message);
    throw error;
  }
}

/**
 * Search for playlists by query
 * @param {string} query - Search query
 * @param {number} maxResults - Maximum number of results
 * @returns {Promise<Array>} Array of playlist search results
 */
export async function searchPlaylists(query, maxResults = 10) {
  try {
    const response = await youtube.search.list({
      part: ['snippet'],
      q: query,
      type: ['playlist'],
      maxResults: maxResults
    });

    if (!response.data.items) {
      return [];
    }

    return response.data.items.map(item => ({
      playlistId: item.id.playlistId,
      title: item.snippet.title,
      description: item.snippet.description,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      thumbnails: item.snippet.thumbnails,
      publishedAt: item.snippet.publishedAt
    }));
  } catch (error) {
    console.error('Error searching playlists:', error.message);
    throw error;
  }
}

/**
 * Get detailed information about a single video
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} Video details object
 */
export async function getVideoDetails(videoId) {
  try {
    const response = await youtube.videos.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      id: [videoId]
    });

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('Video not found');
    }

    const video = response.data.items[0];
    return {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      url: `https://www.youtube.com/watch?v=${video.id}`,
      duration: video.contentDetails.duration,
      viewCount: video.statistics.viewCount,
      likeCount: video.statistics.likeCount,
      commentCount: video.statistics.commentCount,
      publishedAt: video.snippet.publishedAt,
      channelTitle: video.snippet.channelTitle,
      channelId: video.snippet.channelId,
      tags: video.snippet.tags,
      thumbnails: video.snippet.thumbnails
    };
  } catch (error) {
    console.error('Error fetching video details:', error.message);
    throw error;
  }
}

/**
 * Export full playlist data to a JSON file
 * @param {string} playlistId - YouTube playlist ID
 * @param {string} outputPath - Path to save the JSON file
 * @returns {Promise<Object>} Playlist data object
 */
export async function exportPlaylistData(playlistId, outputPath = null) {
  try {
    // Get playlist info
    const playlistResponse = await youtube.playlists.list({
      part: ['snippet', 'contentDetails'],
      id: [playlistId]
    });

    if (!playlistResponse.data.items || playlistResponse.data.items.length === 0) {
      throw new Error('Playlist not found');
    }

    const playlist = playlistResponse.data.items[0];

    // Get all videos in playlist
    const videos = await getPlaylistVideos(playlistId);

    const playlistData = {
      playlist: {
        id: playlist.id,
        title: playlist.snippet.title,
        description: playlist.snippet.description,
        channelTitle: playlist.snippet.channelTitle,
        channelId: playlist.snippet.channelId,
        videoCount: playlist.contentDetails.itemCount,
        publishedAt: playlist.snippet.publishedAt,
        thumbnails: playlist.snippet.thumbnails
      },
      videos: videos,
      exportedAt: new Date().toISOString()
    };

    // Save to file if path provided
    if (outputPath) {
      await fs.writeJson(outputPath, playlistData, { spaces: 2 });
      console.log(`Playlist data exported to: ${outputPath}`);
    }

    return playlistData;
  } catch (error) {
    console.error('Error exporting playlist data:', error.message);
    throw error;
  }
}

/**
 * Batch download playlist data for multiple playlists
 * @param {Array<string>} playlistIds - Array of playlist IDs
 * @returns {Promise<Array>} Array of playlist data objects
 */
export async function batchExportPlaylists(playlistIds) {
  const results = [];

  for (const playlistId of playlistIds) {
    try {
      console.log(`Fetching playlist: ${playlistId}`);
      const data = await exportPlaylistData(playlistId);
      results.push(data);

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to fetch playlist ${playlistId}:`, error.message);
      results.push({
        playlistId,
        error: error.message
      });
    }
  }

  return results;
}

// CLI functionality when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
YouTube Playlist Fetcher

Usage:
  node youtube-api.js <command> [options]

Commands:
  playlist <playlistId>           Get all videos from a playlist
  channel <channelId/@handle>     Get all playlists from a channel
  search <query>                  Search for playlists
  video <videoId>                 Get video details
  export <playlistId> [output]    Export playlist data to JSON

Examples:
  node youtube-api.js playlist PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf
  node youtube-api.js channel @MrBeast
  node youtube-api.js search "coding tutorials"
  node youtube-api.js export PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf playlist.json
    `);
    process.exit(0);
  }

  const command = args[0];
  const param = args[1];

  if (!process.env.YOUTUBE_API_KEY) {
    console.error('Error: YOUTUBE_API_KEY not found in environment variables');
    console.error('Please create a .env file with your YouTube API key');
    process.exit(1);
  }

  (async () => {
    try {
      switch (command) {
        case 'playlist':
          const videos = await getPlaylistVideos(param);
          console.log(JSON.stringify(videos, null, 2));
          break;

        case 'channel':
          const playlists = await getPlaylistsFromChannel(param);
          console.log(JSON.stringify(playlists, null, 2));
          break;

        case 'search':
          const results = await searchPlaylists(param);
          console.log(JSON.stringify(results, null, 2));
          break;

        case 'video':
          const video = await getVideoDetails(param);
          console.log(JSON.stringify(video, null, 2));
          break;

        case 'export':
          const outputPath = args[2] || `playlist-${param}.json`;
          const data = await exportPlaylistData(param, outputPath);
          console.log(`Exported ${data.videos.length} videos to ${outputPath}`);
          break;

        default:
          console.error(`Unknown command: ${command}`);
          process.exit(1);
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  })();
}
