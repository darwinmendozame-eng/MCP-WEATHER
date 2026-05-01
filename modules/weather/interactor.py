from modules.weather.entity import Alert, ForecastPeriod
from modules.weather.service import WeatherService


class WeatherInteractor:
    """Business logic layer for weather operations."""

    def __init__(self, service: WeatherService):
        self._service = service

    async def get_alerts(self, state: str) -> list[Alert]:
        """Get alerts for a given state."""
        if not state or len(state) != 2:
            return []
        return await self._service.get_alerts(state.upper())

    async def get_forecast(self, latitude: float, longitude: float) -> list[ForecastPeriod]:
        """Get forecast for a location."""
        if not (-90 <= latitude <= 90) or not (-180 <= longitude <= 180):
            return []
        return await self._service.get_forecast(latitude, longitude)
