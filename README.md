# 🌦️ Weather MCP Server

Monorepo containing the Weather MCP Server and UI frontend.

## 📁 Estructura del proyecto

```
weather/
├── weather-mcp/          # Backend (MCP Server)
│   ├── main.py          # Entry point (stdio)
│   ├── main_http.py     # Entry point (HTTP)
│   ├── core/
│   ├── modules/
│   ├── shared/
│   └── Dockerfile
│
└── ui-weather/           # Frontend (Angular)
    └── src/
```

## 🚀 Quick Start

### Backend

```bash
cd weather-mcp
uv sync
uv run main.py
```

### Frontend

```bash
cd ui-weather
npm install
ng serve
```

## 🐳 Docker

```bash
# Build both images
docker build -t weather-mcp ./weather-mcp
docker build -t ui-weather ./ui-weather

# Run with docker-compose
docker-compose up
```

## 🔌 Configuración MCP (Claude Desktop)

```json
{
  "mcpServers": {
    "weather": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "weather-mcp"]
    }
  }
}
```
