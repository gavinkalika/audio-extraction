from googleapiclient.discovery import build
from typing import List
from domain.entities import Video, Playlist
from interfaces.youtube_repository import YouTubeRepository


class YouTubeAPIRepository(YouTubeRepository):
    def __init__(self):
        self.youtube = None

    def authenticate(self, api_key: str) -> None:
        self.youtube = build('youtube', 'v3', developerKey=api_key)

    def get_video(self, video_id: str) -> Video:
        response = self.youtube.videos().list(
            part='snippet,contentDetails',
            id=video_id
        ).execute()

        if not response['items']:
            raise ValueError(f"Video {video_id} not found")

        item = response['items'][0]
        return Video(
            id=item['id'],
            title=item['snippet']['title'],
            channel_id=item['snippet']['channelId'],
            channel_title=item['snippet']['channelTitle'],
            description=item['snippet'].get('description'),
            published_at=item['snippet'].get('publishedAt')
        )

    def get_channel(self, channel_id: str) -> dict:
        response = self.youtube.channels().list(
            part='snippet,statistics',
            id=channel_id
        ).execute()

        if not response['items']:
            raise ValueError(f"Channel {channel_id} not found")

        item = response['items'][0]
        return {
            'id': item['id'],
            'title': item['snippet']['title'],
            'description': item['snippet'].get('description'),
            'subscriber_count': item['statistics'].get('subscriberCount'),
            'video_count': item['statistics'].get('videoCount')
        }

    def get_playlist(self, playlist_id: str) -> Playlist:
        response = self.youtube.playlists().list(
            part='snippet,contentDetails',
            id=playlist_id
        ).execute()

        if not response['items']:
            raise ValueError(f"Playlist {playlist_id} not found")

        item = response['items'][0]
        return Playlist(
            id=item['id'],
            title=item['snippet']['title'],
            channel_id=item['snippet']['channelId'],
            channel_title=item['snippet']['channelTitle'],
            video_count=item['contentDetails']['itemCount']
        )

    def get_playlist_videos(self, playlist_id: str) -> List[Video]:
        videos = []
        next_page_token = None

        while True:
            response = self.youtube.playlistItems().list(
                part='snippet,contentDetails',
                playlistId=playlist_id,
                maxResults=50,
                pageToken=next_page_token
            ).execute()

            for item in response['items']:
                videos.append(Video(
                    id=item['contentDetails']['videoId'],
                    title=item['snippet']['title'],
                    channel_id=item['snippet']['videoOwnerChannelId'],
                    channel_title=item['snippet'].get('videoOwnerChannelTitle', '')
                ))

            next_page_token = response.get('nextPageToken')
            if not next_page_token:
                break

        return videos

    def get_videos_batch(self, video_ids: List[str]) -> List[Video]:
        """Fetch multiple videos with full details including duration."""
        videos = []
        
        # API allows max 50 videos per request
        for i in range(0, len(video_ids), 50):
            batch_ids = video_ids[i:i + 50]
            response = self.youtube.videos().list(
                part='snippet,contentDetails',
                id=','.join(batch_ids)
            ).execute()

            for item in response['items']:
                duration = self._parse_duration(item['contentDetails']['duration'])
                videos.append(Video(
                    id=item['id'],
                    title=item['snippet']['title'],
                    channel_id=item['snippet']['channelId'],
                    channel_title=item['snippet']['channelTitle'],
                    duration=duration,
                    description=item['snippet'].get('description'),
                    published_at=item['snippet'].get('publishedAt')
                ))

        return videos

    def _parse_duration(self, duration_str: str) -> int:
        """Parse ISO 8601 duration (PT1H2M3S) to seconds."""
        import re
        match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration_str)
        if not match:
            return 0
        hours = int(match.group(1) or 0)
        minutes = int(match.group(2) or 0)
        seconds = int(match.group(3) or 0)
        return hours * 3600 + minutes * 60 + seconds