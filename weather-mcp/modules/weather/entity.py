from dataclasses import dataclass


@dataclass
class Alert:
    """Domain model for weather alerts."""
    event: str
    area: str
    severity: str
    description: str
    instructions: str | None


@dataclass
class ForecastPeriod:
    """Domain model for a forecast period."""
    name: str
    temperature: int
    temperature_unit: str
    wind_speed: str
    wind_direction: str
    detailed_forecast: str
