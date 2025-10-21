# Zerodha MCP Server

A Model Context Protocol (MCP) server that enables Claude AI to interact with Zerodha's Kite Connect API through natural language. Trade stocks, check positions, get market data, and manage orders by simply talking to Claude.

## What is MCP?

Model Context Protocol (MCP) is a standard that allows AI assistants like Claude to securely connect to external data sources and tools. This server exposes Zerodha trading capabilities to Claude, enabling natural language trading commands.

## Features

- 🤖 **Natural Language Trading**: Tell Claude what you want to trade in plain English
- 📊 **Portfolio Management**: Check holdings, positions, and orders
- 💹 **Market Data**: Get real-time quotes and last traded prices
- 🔄 **Order Management**: Place, modify, and cancel orders
- 🔒 **Secure**: Uses environment variables for credentials

## Available Tools

- `get_profile` - Get user account information
- `get_holdings` - View long-term equity holdings
- `get_positions` - Check current day positions
- `get_orders` - List all orders for the day
- `place_order` - Place BUY/SELL orders
- `cancel_order` - Cancel existing orders
- `get_quote` - Get detailed market quotes
- `get_ltp` - Get last traded price

## Prerequisites

- [Bun](https://bun.sh) runtime installed
- Zerodha Kite Connect API credentials
- Claude Desktop app (for MCP integration)

## Setup

1. Clone and install:
```bash
git clone https://github.com/shreerajkalbande/Zerodha_Kite_App.git
cd Zerodha_Kite_App
bun install
```

2. Configure credentials:
```bash
cp .env.example .env
```

3. Add your Zerodha API credentials to `.env`:
```env
KITE_API_KEY=your_api_key_here
KITE_API_SECRET=your_api_secret_here
KITE_REQUEST_TOKEN=your_request_token_here
```

4. Get API credentials from [Zerodha Kite Connect](https://kite.trade/)

## Claude Desktop Configuration

Add to your Claude Desktop config file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "zerodha": {
      "command": "bun",
      "args": ["run", "/absolute/path/to/Zerodha_Kite_App/mcp-server.ts"],
      "env": {
        "KITE_API_KEY": "your_api_key_here",
        "KITE_API_SECRET": "your_api_secret_here",
        "KITE_REQUEST_TOKEN": "your_request_token_here"
      }
    }
  }
}
```

## Usage Examples

Once configured, you can ask Claude:

- "What's my current portfolio?"
- "Buy 10 shares of INFY at market price"
- "What's the current price of RELIANCE?"
- "Show me all my open orders"
- "Cancel order ID 12345"
- "What are my positions for today?"

## Running Standalone

```bash
bun run mcp-server.ts
```

## Security

- Never commit `.env` file
- Keep API credentials secure
- Use request tokens with limited validity
- Review all trades before execution

## Disclaimer

⚠️ **Trading involves financial risk. This tool is for educational purposes. Always verify trades before execution. The authors are not responsible for any financial losses.**

## License

MIT
