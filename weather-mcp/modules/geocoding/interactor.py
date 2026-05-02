from modules.geocoding.service import GeocodingService
from modules.geocoding.entity import Location


class GeocodingInteractor:
    """Business logic for geocoding."""

    def __init__(self, service: GeocodingService):
        self._service = service

    async def search_locations(self, query: str) -> list[Location]:
        """Search for locations matching the query."""
        if not query or len(query) < 2:
            return []
        return await self._service.search(query, limit=5)
