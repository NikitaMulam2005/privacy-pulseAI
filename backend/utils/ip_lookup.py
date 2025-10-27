import requests
import socket

def get_website_country(url: str):
    try:
       
        hostname = url.replace("https://", "").replace("http://", "").split("/")[0]
        ip_address = socket.gethostbyname(hostname)

        response = requests.get(f"https://ipapi.co/{ip_address}/json/")
        data = response.json()

        return {
            "ip": ip_address,
            "country": data.get("country_name", "Unknown"),
            "city": data.get("city", "Unknown"),
            "region": data.get("region", "Unknown"),
            "org": data.get("org", "Unknown"),
            "latitude": data.get("latitude"),   
            "longitude": data.get("longitude")  
        }

    except Exception as e:
        print(f"Geo lookup failed for {url}: {e}")
        return {
            "ip": None,
            "country": "Unknown",
            "city": None,
            "region": None,
            "org": None,
            "latitude": None,
            "longitude": None
        }
