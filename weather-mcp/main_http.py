import uvicorn
from core.server import create_mcp_server
from shared.http_client import HttpClient
from modules.weather.service import WeatherService
from modules.weather.interactor import WeatherInteractor
from modules.weather.presenter import WeatherPresenter
from modules.weather.router import register_weather_tools


def main():
    http_client = HttpClient(base_url="https://api.weather.gov")
    service = WeatherService(http_client)
    interactor = WeatherInteractor(service)
    presenter = WeatherPresenter()

    mcp = create_mcp_server("weather")
    register_weather_tools(mcp, interactor, presenter)

    app = mcp.streamable_http_app()
    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
