from modules.geocoding.entity import Location


class GeocodingPresenter:
    """Format geocoding results for output."""

    def format_locations(self, locations: list[Location]) -> str:
        if not locations:
            return "No locations found for that search."

        lines = ["Found locations:\n"]
        for i, loc in enumerate(locations, 1):
            state_part = f", {loc.admin1}" if loc.admin1 else ""
            lines.append(f"{i}. {loc.name}{state_part}, {loc.country}")
            lines.append(f"   Lat: {loc.latitude}, Lon: {loc.longitude}\n")

        return "\n".join(lines)
