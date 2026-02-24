import re
from urllib.parse import urlparse, parse_qs


def extract_playlist_id(input_string: str) -> str:
    """
    Extract playlist ID from URL or return as-is if already an ID.
    
    Supports:
    - https://www.youtube.com/playlist?list=PLxxxxxx
    - https://youtube.com/playlist?list=PLxxxxxx
    - PLxxxxxx (raw ID)
    """
    input_string = input_string.strip()
    
    # Check if it's a URL
    if input_string.startswith(('http://', 'https://', 'www.')):
        parsed = urlparse(input_string)
        query_params = parse_qs(parsed.query)
        
        if 'list' in query_params:
            return query_params['list'][0]
        
        raise ValueError(f"Could not extract playlist ID from URL: {input_string}")
    
    # Assume it's a raw playlist ID
    # YouTube playlist IDs typically start with PL, UU, LL, FL, or OL
    if re.match(r'^(PL|UU|LL|FL|OL|RD)[a-zA-Z0-9_-]+$', input_string):
        return input_string
    
    # Could be a custom playlist ID, return as-is
    return input_string
