from domain.entities import Playlist
from domain.url_parser import extract_playlist_id
from interfaces.youtube_repository import YouTubeRepository


class GetPlaylistVideosUseCase:
    def __init__(self, repository: YouTubeRepository):
        self.repository = repository

    def execute(self, playlist_input: str) -> Playlist:
        """
        Fetch playlist metadata and all videos.
        
        Args:
            playlist_input: Playlist URL or ID
            
        Returns:
            Playlist object with populated videos list
        """
        playlist_id = extract_playlist_id(playlist_input)
        
        # Get playlist metadata
        playlist = self.repository.get_playlist(playlist_id)
        
        # Get all videos in playlist
        videos = self.repository.get_playlist_videos(playlist_id)
        playlist.videos = videos
        
        return playlist
