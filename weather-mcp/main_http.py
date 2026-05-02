import uvicorn
from starlette.middleware.cors import CORSMiddleware
from core.server import create_mcp_server
from shared.http_client import HttpClient
from modules.weather.service import WeatherService
from modules.weather.interactor import WeatherInteractor
from modules.weather.presenter import WeatherPresenter
from modules.weather.router import register_weather_tools
from modules.geocoding.service import GeocodingService
from modules.geocoding.interactor import GeocodingInteractor
from modules.geocoding.presenter import GeocodingPresenter
from modules.geocoding.router import register_geocoding_tools


def main():
    http_client = HttpClient(base_url="https://api.weather.gov")
    weather_service = WeatherService(http_client)
    weather_interactor = WeatherInteractor(weather_service)
    weather_presenter = WeatherPresenter()
    register_weather_tools(mcp, weather_interactor, weather_presenter)

    geo_service = GeocodingService(http_client)
    geo_interactor = GeocodingInteractor(geo_service)
    geo_presenter = GeocodingPresenter()
    register_geocoding_tools(mcp, geo_interactor, geo_presenter)

    app = mcp.streamable_http_app()

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["mcp-session-id"],
    )

    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
