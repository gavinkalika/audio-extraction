from dataclasses import dataclass
from typing import Optional
from datetime import datetime


@dataclass
class Video:
    id: str
    title: str
    channel_id: str
    channel_title: str
    duration: Optional[int] = None
    published_at: Optional[datetime] = None
    description: Optional[str] = None


@dataclass
class Playlist:
    id: str
    title: str
    channel_id: str
    channel_title: str
    video_count: int
    videos: Optional[list[Video]] = None

    def __post_init__(self):
        if self.videos is None:
            self.videos = []
