from shared.http_client import HttpClient
from modules.geocoding.entity import Location


class GeocodingService:
    """Handles geocoding using Open-Meteo Geocoding API."""

    def __init__(self, http_client: HttpClient):
        self._http = http_client

    async def search(self, query: str, limit: int = 5) -> list[Location]:
        """Search for locations by name."""
        url = f"https://geocoding-api.open-meteo.com/v1/search?name={query}&count={limit}&language=en&format=json"
        data = await self._http.get(url)
        if not data or "results" not in data:
            return []
        return [self._parse_location(r) for r in data["results"]]

    def _parse_location(self, result: dict) -> Location:
        return Location(
            name=result.get("name", "Unknown"),
            latitude=result["latitude"],
            longitude=result["longitude"],
            country=result.get("country", "Unknown"),
            admin1=result.get("admin1"),  # State/Province
        )
