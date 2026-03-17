# Zerodha MCP Server

An MCP (Model Context Protocol) server that exposes Zerodha's Kite Connect trading API as structured tool calls. This allows any MCP-compatible AI client (e.g. Claude Desktop) to execute trades, query portfolio state, and fetch market data through a standardized interface.

## Architecture

```
┌──────────────────┐       stdio        ┌──────────────────┐      HTTPS       ┌────────────────┐
│                  │  ─────────────────►│                  │ ───────────────► │                │
│   Claude Desktop │   MCP Protocol     │  MCP Server      │   Kite Connect   │  Zerodha APIs  │
│   (MCP Client)   │  ◄───────────────  │  (this project)  │ ◄─────────────── │                │
│                  │   JSON responses   │                  │   REST responses │                │
└──────────────────┘                    └──────────────────┘                  └────────────────┘
```

The server runs as a child process of the MCP client, communicating over **stdio** using JSON-RPC. On startup it authenticates with Kite Connect using the provided request token, then registers 8 tools that the client can invoke.

## Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `get_profile` | Account information (email, username, broker ID) | — |
| `get_holdings` | Long-term equity holdings with P&L | — |
| `get_positions` | Intraday and net positions | — |
| `get_orders` | All orders placed during the trading session | — |
| `place_order` | Place a BUY/SELL order | `exchange`, `tradingsymbol`, `transaction_type`, `quantity`, `order_type`, `product`, `price`\* |
| `cancel_order` | Cancel a pending order | `order_id` |
| `get_quote` | Full market quote (OHLC, volume, depth) | `instruments[]` |
| `get_ltp` | Last traded price | `instruments[]` |

\* `price` is only required for LIMIT orders.

**Order parameters:**
- **exchange** — `NSE`, `BSE`, `NFO`, `CDS`, `MCX`
- **transaction_type** — `BUY`, `SELL`
- **order_type** — `MARKET`, `LIMIT`
- **product** — `CNC` (delivery), `MIS` (intraday), `NRML` (F&O/commodity)

## Tech Stack

- **Runtime**: [Bun](https://bun.sh)
- **Language**: TypeScript (strict mode, ESNext)
- **MCP SDK**: `@modelcontextprotocol/sdk`
- **Brokerage**: Zerodha Kite Connect (`kiteconnect` npm package)
- **Transport**: stdio (JSON-RPC over stdin/stdout)

## Prerequisites

1. [Bun](https://bun.sh) installed (`curl -fsSL https://bun.sh/install | bash`)
2. A Zerodha account with [Kite Connect](https://kite.trade/) API access
3. An MCP-compatible client (e.g. Claude Desktop)

## Setup

```bash
git clone https://github.com/shreerajkalbande/Zerodha_Kite_App.git
cd Zerodha_Kite_App
bun install
```

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

```
KITE_API_KEY=<your_api_key>
KITE_API_SECRET=<your_api_secret>
KITE_REQUEST_TOKEN=<your_request_token>
```

Credentials are obtained from the [Kite Connect developer console](https://developers.kite.trade/). The request token is generated each time a user completes the login flow and has a short validity window.

### Verifying credentials

Run the standalone auth test to confirm your credentials work:

```bash
bun run index.ts
```

This generates a session and prints your account profile.

## Claude Desktop Integration

Add the following to your Claude Desktop config:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "zerodha": {
      "command": "bun",
      "args": ["run", "/absolute/path/to/Zerodha_Kite_App/mcp-server.ts"],
      "env": {
        "KITE_API_KEY": "your_api_key",
        "KITE_API_SECRET": "your_api_secret",
        "KITE_REQUEST_TOKEN": "your_request_token"
      }
    }
  }
}
```

Restart Claude Desktop after updating the config. The server will appear as an available tool provider.

## Usage

Once connected, the MCP client can invoke any registered tool. Example natural language queries that map to tool calls:

```
"What's in my portfolio?"           → get_holdings
"Show today's positions"            → get_positions
"Buy 50 INFY at market on NSE"     → place_order (NSE, INFY, BUY, 50, MARKET, CNC)
"What's RELIANCE trading at?"      → get_ltp (["NSE:RELIANCE"])
"Cancel order 240315000012345"     → cancel_order
```

## Authentication Flow

1. User registers an app on [Kite Connect](https://developers.kite.trade/) and receives an **API key** and **API secret**
2. User is redirected to Zerodha's login page → completes login → receives a **request token** via redirect
3. On server startup, the request token is exchanged for an **access token** using `kc.generateSession()`
4. The access token is used for all subsequent API calls during the session
5. Request tokens are single-use and expire quickly — a new token is needed for each session

## Project Structure

```
├── mcp-server.ts       # MCP server — tool registration and request handling
├── index.ts            # Standalone script for credential verification
├── package.json
├── tsconfig.json
├── .env.example
└── .gitignore
```

## Security Notes

- API credentials are passed via environment variables, never hardcoded
- `.env` is gitignored — credentials are never committed
- Request tokens have short validity and are single-use
- The `place_order` tool executes real trades — the MCP client should always confirm with the user before invocation

## Disclaimer

This project interacts with live brokerage APIs and can place real trades. Use at your own risk. Always verify order parameters before execution. The author assumes no responsibility for financial losses.

## License

MIT
