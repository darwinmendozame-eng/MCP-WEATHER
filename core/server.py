from mcp.server.fastmcp import FastMCP


def create_mcp_server(name: str = "weather") -> FastMCP:
    """Create and configure a FastMCP server instance."""
    return FastMCP(name)
