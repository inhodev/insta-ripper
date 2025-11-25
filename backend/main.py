from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import instaloader
import re
import requests
import json
import random
from bs4 import BeautifulSoup
from fake_useragent import UserAgent

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class URLRequest(BaseModel):
    url: str

def get_random_headers():
    ua = UserAgent()
    return {
        "User-Agent": ua.random,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Referer": "https://www.instagram.com/",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0",
    }

@app.post("/api/download")
async def download_post(request: URLRequest):
    # Method 1: Try Instaloader (No Login)
    try:
        L = instaloader.Instaloader()
        shortcode_match = re.search(r'(?:p|reel)/([A-Za-z0-9_-]+)', request.url)
        if shortcode_match:
            shortcode = shortcode_match.group(1)
            post = instaloader.Post.from_shortcode(L.context, shortcode)
            
            images = []
            if post.typename == 'GraphSidecar':
                for node in post.get_sidecar_nodes():
                    if not node.is_video:
                        images.append(node.display_url)
            elif not post.is_video:
                images.append(post.url)
            
            return {
                "images": images,
                "caption": post.caption,
                "owner": post.owner_username,
                "likes": post.likes,
                "is_video": post.is_video,
                "video_url": post.video_url if post.is_video else None
            }
    except Exception as e:
        print(f"Instaloader failed: {e}")
        # Continue to fallback

    # Method 2: Stealth Fallback (Requests + BeautifulSoup + Regex)
    try:
        headers = get_random_headers()
        print(f"Using User-Agent: {headers['User-Agent']}")
        
        response = requests.get(request.url, headers=headers, timeout=10)
        if response.status_code != 200:
             raise HTTPException(status_code=400, detail=f"Failed to fetch page: {response.status_code}")
        
        html = response.text
        soup = BeautifulSoup(html, 'html.parser')
        
        images = []
        video_url = None
        is_video = False
        caption = ""
        owner = "unknown"
        likes = 0

        # Strategy A: Open Graph Tags (Simplest, usually single image)
        og_image = soup.find("meta", property="og:image")
        if og_image:
            images.append(og_image["content"].replace("&amp;", "&"))
        
        og_desc = soup.find("meta", property="og:description")
        if og_desc:
            caption = og_desc["content"]

        # Strategy B: Parse sharedData (Complex, but gets sidecar)
        # Look for script containing window._sharedData
        shared_data_script = None
        for script in soup.find_all("script"):
            if script.string and "window._sharedData" in script.string:
                shared_data_script = script.string
                break
        
        if shared_data_script:
            try:
                json_str = shared_data_script.split("window._sharedData = ")[1].split(";")[0]
                data = json.loads(json_str)
                post_data = data['entry_data']['PostPage'][0]['graphql']['shortcode_media']
                
                owner = post_data['owner']['username']
                caption = post_data['edge_media_to_caption']['edges'][0]['node']['text'] if post_data['edge_media_to_caption']['edges'] else ""
                likes = post_data['edge_media_preview_like']['count']
                is_video = post_data['is_video']
                if is_video:
                    video_url = post_data['video_url']

                # Overwrite images with high-res sidecar data if available
                if 'edge_sidecar_to_children' in post_data:
                    new_images = []
                    for edge in post_data['edge_sidecar_to_children']['edges']:
                        node = edge['node']
                        if not node['is_video']:
                            new_images.append(node['display_url'])
                    if new_images:
                        images = new_images
                elif not is_video:
                    images = [post_data['display_url']]
            except Exception as e:
                print(f"Error parsing sharedData: {e}")

        # Strategy C: Regex for additional image candidates if still empty
        if not images:
            # Look for display_url inside script tags (GraphQL)
            matches = re.findall(r'"display_url":"([^"]+)"', html)
            for m in matches:
                clean_url = m.replace("\\u0026", "&")
                if clean_url not in images:
                    images.append(clean_url)
            
            # Limit to first few to avoid junk
            images = images[:10]

        if not images and not is_video:
             raise HTTPException(status_code=400, detail="Could not find any images. Post might be private or blocked.")

        return {
            "images": images,
            "caption": caption,
            "owner": owner,
            "likes": likes,
            "is_video": is_video, 
            "video_url": video_url
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing URL: {str(e)}")

@app.get("/api/proxy-image")
async def proxy_image(url: str):
    try:
        headers = get_random_headers()
        # Fetch image with fake headers
        resp = requests.get(url, headers=headers, stream=True, timeout=10)
        
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch image")
        
        # Get content type from original response or default to jpeg
        content_type = resp.headers.get("Content-Type", "image/jpeg")
        
        return Response(content=resp.content, media_type=content_type)
    except Exception as e:
        print(f"Proxy error: {e}")
        raise HTTPException(status_code=400, detail=f"Proxy failed: {str(e)}")

@app.get("/")
def read_root():
    return {"message": "Instagram Downloader API (Stealth Mode) is running"}
