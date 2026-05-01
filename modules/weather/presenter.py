from modules.weather.entity import Alert, ForecastPeriod


class WeatherPresenter:
    """Formats weather data for presentation."""

    def format_alerts(self, alerts: list[Alert]) -> str:
        """Format alerts as a readable string."""
        if not alerts:
            return "No active alerts for this state."
        formatted = []
        for alert in alerts:
            formatted.append(f"""
  Event: {alert.event}
    Area: {alert.area}
    Severity: {alert.severity}
    Description: {alert.description}
    Instructions: {alert.instructions or "No specific instructions available"}
    """)
        return "\n---\n".join(formatted)

    def format_forecast(self, periods: list[ForecastPeriod], limit: int = 5) -> str:
        """Format forecast periods as a readable string."""
        if not periods:
            return "Unable to fetch forecast data for this location."
        forecasts = []
        for period in periods[:limit]:
            forecasts.append(f"""
{period.name}:
Temperature: {period.temperature}°{period.temperature_unit}
Wind: {period.wind_speed} {period.wind_direction}
Forecast: {period.detailed_forecast}
""")
        return "\n---\n".join(forecasts)
