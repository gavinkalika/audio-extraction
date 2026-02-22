import os
from dotenv import load_dotenv
from infrastructure.youtube_api import YouTubeAPIRepository


def main():
    load_dotenv()
    
    api_key = os.getenv('YOUTUBE_API_KEY')
    # print(api_key)
    if not api_key:
        print("Error: YOUTUBE_API_KEY not set")
        return

    repo = YouTubeAPIRepository()
    repo.authenticate(api_key)
    print("Successfully connected to YouTube API")

    test_video_id = "dQw4w9WgXcQ"
    try:
        video = repo.get_video(test_video_id)
        print(f"Test video: {video.title} by {video.channel_title}")
    except Exception as e:
        print(f"Error fetching video: {e}")


if __name__ == "__main__":
    main()
