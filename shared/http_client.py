from typing import Any
import httpx


class HttpClient:
    """Reusable async HTTP client for external API calls."""

    def __init__(self, base_url: str = "", user_agent: str = "weather-mcp/0.1"):
        self.base_url = base_url
        self.headers = {"User-Agent": user_agent, "Accept": "application/geo+json"}

    async def get(self, path: str, timeout: float = 30.0) -> dict[str, Any] | None:
        """Make GET request to the API with proper error handling."""
        url = f"{self.base_url}{path}" if self.base_url else path
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, headers=self.headers, timeout=timeout)
                response.raise_for_status()
                return response.json()
            except Exception:
                return None
