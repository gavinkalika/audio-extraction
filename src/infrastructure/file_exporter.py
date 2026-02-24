import csv
import json
from typing import Optional

from domain.entities import Playlist


class FileExporter:
    @staticmethod
    def to_json(playlist: Playlist, filepath: Optional[str] = None) -> str:
        """Export playlist to JSON format."""
        data = {
            'id': playlist.id,
            'title': playlist.title,
            'channel_id': playlist.channel_id,
            'channel_title': playlist.channel_title,
            'video_count': playlist.video_count,
            'videos': [
                {
                    'order': i + 1,
                    'id': video.id,
                    'title': video.title,
                    'channel_title': video.channel_title,
                    'duration_seconds': video.duration,
                    'duration_formatted': FileExporter._format_duration(video.duration)
                }
                for i, video in enumerate(playlist.videos or [])
            ]
        }
        
        json_str = json.dumps(data, indent=2, ensure_ascii=False)
        
        if filepath:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(json_str)
        
        return json_str

    @staticmethod
    def to_csv(playlist: Playlist, filepath: Optional[str] = None) -> str:
        """Export playlist videos to CSV format."""
        import io
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow(['Order', 'Video ID', 'Title', 'Channel', 'Duration (seconds)', 'Duration'])
        
        # Rows
        for i, video in enumerate(playlist.videos or []):
            writer.writerow([
                i + 1,
                video.id,
                video.title,
                video.channel_title,
                video.duration or '',
                FileExporter._format_duration(video.duration)
            ])
        
        csv_str = output.getvalue()
        
        if filepath:
            with open(filepath, 'w', encoding='utf-8', newline='') as f:
                f.write(csv_str)
        
        return csv_str

    @staticmethod
    def _format_duration(seconds: Optional[int]) -> str:
        """Format seconds to HH:MM:SS or MM:SS."""
        if not seconds:
            return ''
        hours, remainder = divmod(seconds, 3600)
        minutes, secs = divmod(remainder, 60)
        if hours:
            return f'{hours}:{minutes:02d}:{secs:02d}'
        return f'{minutes}:{secs:02d}'
