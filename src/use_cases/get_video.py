from domain.entities import Video
from interfaces.youtube_repository import YouTubeRepository


class GetVideoUseCase:
    def __init__(self, repository: YouTubeRepository):
        self.repository = repository

    def execute(self, video_id: str) -> Video:
        return self.repository.get_video(video_id)
