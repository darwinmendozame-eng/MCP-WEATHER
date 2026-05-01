from typing import Any
from shared.http_client import HttpClient
from modules.weather.entity import Alert, ForecastPeriod


class WeatherService:
    """Handles external API calls to National Weather Service."""

    def __init__(self, http_client: HttpClient):
        self._http = http_client

    async def get_alerts(self, state: str) -> list[Alert]:
        """Fetch active alerts for a state."""
        url = f"/alerts/active/area/{state}"
        data = await self._http.get(url)
        if not data or "features" not in data:
            return []
        return [self._parse_alert(f) for f in data["features"]]

    async def get_forecast(self, latitude: float, longitude: float) -> list[ForecastPeriod]:
        """Fetch forecast for a location."""
        points_url = f"/points/{latitude},{longitude}"
        points_data = await self._http.get(points_url)
        if not points_data:
            return []
        forecast_url = points_data["properties"]["forecast"]
        forecast_data = await self._http.get(forecast_url)
        if not forecast_data:
            return []
        return [self._parse_period(p) for p in forecast_data["properties"]["periods"]]

    def _parse_alert(self, feature: dict) -> Alert:
        props = feature["properties"]
        return Alert(
            event=props.get("event", "unknown"),
            area=props.get("areaDesc", "unknown"),
            severity=props.get("severity", "unknown"),
            description=props.get("description", "No description available"),
            instructions=props.get("instruction"),
        )

    def _parse_period(self, period: dict) -> ForecastPeriod:
        return ForecastPeriod(
            name=period["name"],
            temperature=period["temperature"],
            temperature_unit=period["temperatureUnit"],
            wind_speed=period["windSpeed"],
            wind_direction=period["windDirection"],
            detailed_forecast=period["detailedForecast"],
        )
