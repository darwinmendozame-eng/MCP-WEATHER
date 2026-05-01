from mcp.server.fastmcp import FastMCP
from modules.weather.interactor import WeatherInteractor
from modules.weather.presenter import WeatherPresenter


def register_weather_tools(mcp: FastMCP, interactor: WeatherInteractor, presenter: WeatherPresenter) -> None:
    """Register all weather MCP tools."""

    @mcp.tool()
    async def get_alerts(state: str) -> str:
        """Get alerts for a given state.
        Args:
            state: The state to get alerts for (e.g., "CA").
        """
        alerts = await interactor.get_alerts(state)
        if not alerts:
            return "Unable to fetch alerts for this state."
        return presenter.format_alerts(alerts)

    @mcp.tool()
    async def get_forecast(latitude: float, longitude: float) -> str:
        """Get weather forecast for a location.
        Args:
            latitude: Latitude of the location
            longitude: Longitude of the location
        """
        periods = await interactor.get_forecast(latitude, longitude)
        if not periods:
            return "Unable to fetch forecast data for this location."
        return presenter.format_forecast(periods)
