from dataclasses import dataclass


@dataclass
class Location:
    name: str
    latitude: float
    longitude: float
    country: str
    admin1: str | None = None  # State/Province


@dataclass
class GeoResult:
    locations: list[Location]
