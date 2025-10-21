<div align="center">

# 🚀 Zerodha MCP Server

### Trade with Claude AI using Natural Language

*"Hey Claude, buy 10 shares of Infosys at market price"* - and it's done! 

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)
[![MCP](https://img.shields.io/badge/MCP-Enabled-green?style=for-the-badge)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

---

## What is this?

A Model Context Protocol (MCP) server that connects Claude AI to Zerodha's Kite Connect API. Trade stocks, check portfolios, and manage orders using natural language.

> **MCP (Model Context Protocol)** allows AI assistants like Claude to securely connect to external tools and data sources.

## Features

- 🤖 **Natural Language Trading**: Tell Claude what you want to trade in plain English
- 📊 **Portfolio Management**: Check holdings, positions, and orders
- 💹 **Market Data**: Get real-time quotes and last traded prices
- 🔄 **Order Management**: Place and cancel orders
- 🔒 **Secure**: Environment-based credentials

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

Restart Claude Desktop after saving the config.

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
