from abc import ABC, abstractmethod
from typing import List
from src.domain.entities import Video, Playlist


class YouTubeRepository(ABC):
    @abstractmethod
    def authenticate(self, api_key: str) -> None:
        pass

    @abstractmethod
    def get_playlist(self, playlist_id: str) -> Playlist:
        pass

    @abstractmethod
    def get_playlist_videos(self, playlist_id: str) -> List[Video]:
        pass

    @abstractmethod
    def get_video(self, video_id: str) -> Video:
        pass