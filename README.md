# Audio Extraction Project

A Node.js application for extracting audio from YouTube videos and managing playlists via the YouTube Data API.

## Features

### 1. Audio Extractor CLI (`index.js`)
- Extract audio from YouTube videos
- Multiple audio formats (MP3, M4A, WAV)
- Progress tracking during download
- Configurable audio quality

### 2. YouTube API Integration (`youtube-api.js`)
- Fetch playlists from channels
- Get all videos from playlists
- Search for playlists
- Get detailed video information
- Export playlist data to JSON

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Install system dependencies:
```bash
# macOS
brew install yt-dlp ffmpeg

# Linux
sudo apt-get install yt-dlp ffmpeg

# Windows
# Install yt-dlp and ffmpeg from their respective websites
```

## Setup

### For YouTube API features:

1. Get a YouTube Data API v3 key from [Google Cloud Console](https://console.cloud.google.com)
2. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
3. Add your API key to `.env`:
```
YOUTUBE_API_KEY=your_api_key_here
```

## Usage

### Extract Audio from YouTube

```bash
# Download as MP3 (default)
node index.js https://www.youtube.com/watch?v=VIDEO_ID

# Download as M4A
node index.js https://www.youtube.com/watch?v=VIDEO_ID --format m4a

# Download with lower quality (smaller file)
node index.js https://www.youtube.com/watch?v=VIDEO_ID --quality 5

# Show help
node index.js --help
```

### YouTube API Functions

```bash
# Get all videos from a playlist
node youtube-api.js playlist PLAYLIST_ID

# Get all playlists from a channel
node youtube-api.js channel @channelHandle
node youtube-api.js channel CHANNEL_ID

# Search for playlists
node youtube-api.js search "coding tutorials"

# Get video details
node youtube-api.js video VIDEO_ID

# Export playlist to JSON
node youtube-api.js export PLAYLIST_ID output.json
```

### Using as a Module

```javascript
import { getPlaylistVideos, exportPlaylistData } from './youtube-api.js';

// Get all videos from a playlist
const videos = await getPlaylistVideos('PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf');

// Export playlist data
const data = await exportPlaylistData('PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf', 'playlist.json');
```

## Example Usage

Run the example script to see all API functions in action:

```bash
node example-usage.js
```

## API Functions

### `getChannelPlaylists(channelId)`
Get all playlists from a YouTube channel.

### `getPlaylistVideos(playlistId)`
Get all videos from a specific playlist with URLs.

### `searchPlaylists(query, maxResults)`
Search for playlists by keyword.

### `getVideoDetails(videoId)`
Get detailed information about a specific video.

### `exportPlaylistData(playlistId, outputPath)`
Export complete playlist data to JSON file.

### `getPlaylistsFromChannel(channelUrl)`
Get playlists from various channel URL formats (@handle, URL, ID).

### `batchExportPlaylists(playlistIds)`
Export multiple playlists at once.

## File Structure

```
audio-extraction-project/
├── index.js              # Audio extraction CLI
├── youtube-api.js        # YouTube API integration
├── example-usage.js      # API usage examples
├── package.json          # Dependencies
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
├── audio/               # Downloaded audio files (git-ignored)
└── README.md            # This file
```

## API Quotas

The YouTube Data API v3 has quotas:
- Default quota: 10,000 units per day
- Playlist.list: 1 unit per request
- PlaylistItems.list: 1 unit per request
- Search.list: 100 units per request

Plan your usage accordingly.

## Future Integration

The YouTube API script is designed to be integrated with the audio extraction CLI to enable batch downloading of entire playlists or channels.

## License

Private project - not for distribution