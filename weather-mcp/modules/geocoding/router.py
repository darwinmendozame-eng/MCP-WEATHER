from mcp.server.fastmcp import FastMCP
from modules.geocoding.interactor import GeocodingInteractor
from modules.geocoding.presenter import GeocodingPresenter


def register_geocoding_tools(mcp: FastMCP, interactor: GeocodingInteractor, presenter: GeocodingPresenter) -> None:
    """Register geocoding MCP tools."""

    @mcp.tool()
    async def search_locations(query: str) -> str:
        """Search for locations by city name or zip code.
        Args:
            query: City name, state, or zip code to search (e.g., "San Francisco", "90210", "Austin TX").
        """
        locations = await interactor.search_locations(query)
        return presenter.format_locations(locations)
