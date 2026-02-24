import os
from dotenv import load_dotenv
from infrastructure.youtube_api import YouTubeAPIRepository
from infrastructure.file_exporter import FileExporter
from interfaces.youtube_repository import YouTubeRepository
from use_cases.get_video import GetVideoUseCase
from use_cases.get_playlist_videos import GetPlaylistVideosUseCase

def format_duration(seconds: int | None) -> str:
    """Format seconds to HH:MM:SS or MM:SS."""
    if not seconds:
        return '--:--'
    hours, remainder = divmod(seconds, 3600)
    minutes, secs = divmod(remainder, 60)
    if hours:
        return f'{hours}:{minutes:02d}:{secs:02d}'
    return f'{minutes}:{secs:02d}'

def display_menu() -> str:
    """Display main menu and get user choice."""
    print("\n=== YouTube CLI ===")
    print("1. Get video info")
    print("2. Get playlist videos")
    print("3. Exit")
    return input("\nSelect option (1-3): ").strip()

def handle_get_video(get_video: GetVideoUseCase):
    """Handle get video use case."""
    video_id = input("Enter video ID: ").strip()
    if not video_id:
        print("Error: Video ID required")
        return
    
    try:
        video = get_video.execute(video_id)
        print(f"\nTitle: {video.title}")
        print(f"Channel: {video.channel_title}")
        print(f"Description: {(video.description or '')[:100]}...")
    except Exception as e:
        print(f"Error: {e}")

def handle_get_playlist(get_playlist: GetPlaylistVideosUseCase, repo: YouTubeRepository):
    """Handle get playlist videos use case."""
    playlist_input = input("Enter playlist ID or URL: ").strip()
    if not playlist_input:
        print("Error: Playlist ID or URL required")
        return
    
    try:
        print("Fetching playlist...")
        playlist = get_playlist.execute(playlist_input)
        
        # Fetch durations for all videos
        if playlist.videos:
            print("Fetching video durations...")
            video_ids = [v.id for v in playlist.videos]
            videos_with_duration = repo.get_videos_batch(video_ids)
            
            # Map durations back to playlist videos
            duration_map = {v.id: v.duration for v in videos_with_duration}
            for video in playlist.videos:
                video.duration = duration_map.get(video.id)
        
        # Display results
        print(f"\n=== {playlist.title} ===")
        print(f"Channel: {playlist.channel_title}")
        print(f"Total videos: {playlist.video_count}\n")
        
        print(f"{'#':<4} {'Duration':<10} {'Title'}")
        print("-" * 60)
        for i, video in enumerate(playlist.videos or [], 1):
            duration_str = format_duration(video.duration)
            title = video.title[:45] + "..." if len(video.title) > 45 else video.title
            print(f"{i:<4} {duration_str:<10} {title}")
        
        # Ask about export
        export = input("\nExport to file? (json/csv/no): ").strip().lower()
        if export in ('json', 'csv'):
            filename = f"{playlist.id}.{export}"
            if export == 'json':
                FileExporter.to_json(playlist, filename)
            else:
                FileExporter.to_csv(playlist, filename)
            print(f"Exported to {filename}")
            
    except Exception as e:
        print(f"Error: {e}")

def main():
    load_dotenv()
    
    api_key = os.getenv('YOUTUBE_API_KEY')
    if not api_key:
        print("Error: YOUTUBE_API_KEY not set")
        return

    # Initialize repository
    repo: YouTubeRepository = YouTubeAPIRepository()
    repo.authenticate(api_key)
    print("Successfully connected to YouTube API")

    # Initialize use cases
    get_video = GetVideoUseCase(repo)
    get_playlist = GetPlaylistVideosUseCase(repo)

    # Main loop
    while True:
        choice = display_menu()
        
        if choice == '1':
            handle_get_video(get_video)
        elif choice == '2':
            handle_get_playlist(get_playlist, repo)
        elif choice == '3':
            print("Goodbye!")
            break
        else:
            print("Invalid option")

if __name__ == "__main__":
    main()
