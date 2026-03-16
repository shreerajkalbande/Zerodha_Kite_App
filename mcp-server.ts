import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { KiteConnect } from "kiteconnect";

const apiKey = process.env.KITE_API_KEY;
const apiSecret = process.env.KITE_API_SECRET;
const requestToken = process.env.KITE_REQUEST_TOKEN;

if (!apiKey || !apiSecret) {
  console.error("KITE_API_KEY and KITE_API_SECRET are required");
  process.exit(1);
}

const kc = new KiteConnect({ api_key: apiKey });

if (requestToken) {
  try {
    const session = await kc.generateSession(requestToken, apiSecret);
    kc.setAccessToken(session.access_token);
    console.error("Authenticated with Kite Connect");
  } catch (err) {
    console.error("Session generation failed:", err);
    process.exit(1);
  }
}

const server = new Server(
  { name: "zerodha-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// --- Tool definitions ---

const tools = [
  {
    name: "get_profile",
    description: "Get user profile — email, username, broker, account details",
    inputSchema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "get_holdings",
    description: "Get long-term equity holdings with average price and P&L",
    inputSchema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "get_positions",
    description: "Get intraday (day) and net positions",
    inputSchema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "get_orders",
    description: "Get all orders placed during the current trading session",
    inputSchema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "place_order",
    description: "Place a BUY or SELL order on an exchange",
    inputSchema: {
      type: "object" as const,
      properties: {
        exchange: {
          type: "string",
          enum: ["NSE", "BSE", "NFO", "CDS", "MCX", "BFO"],
          description: "Exchange (NSE, BSE, NFO, etc.)",
        },
        tradingsymbol: {
          type: "string",
          description: "Trading symbol (e.g. INFY, RELIANCE)",
        },
        transaction_type: {
          type: "string",
          enum: ["BUY", "SELL"],
          description: "Transaction type",
        },
        quantity: { type: "number", description: "Number of shares/lots" },
        order_type: {
          type: "string",
          enum: ["MARKET", "LIMIT", "SL", "SL-M"],
          description: "Order type",
        },
        product: {
          type: "string",
          enum: ["CNC", "MIS", "NRML"],
          description: "Product type — CNC (delivery), MIS (intraday), NRML (F&O)",
        },
        price: {
          type: "number",
          description: "Limit price (required for LIMIT and SL orders)",
        },
        trigger_price: {
          type: "number",
          description: "Trigger price (required for SL and SL-M orders)",
        },
        validity: {
          type: "string",
          enum: ["DAY", "IOC"],
          description: "Order validity (default: DAY)",
        },
      },
      required: [
        "exchange",
        "tradingsymbol",
        "transaction_type",
        "quantity",
        "order_type",
        "product",
      ],
    },
  },
  {
    name: "cancel_order",
    description: "Cancel a pending order by order ID",
    inputSchema: {
      type: "object" as const,
      properties: {
        variety: {
          type: "string",
          enum: ["regular", "amo", "co", "iceberg", "auction"],
          description: "Order variety (default: regular)",
        },
        order_id: { type: "string", description: "Order ID to cancel" },
      },
      required: ["order_id"],
    },
  },
  {
    name: "get_quote",
    description:
      "Get full market quote — OHLC, volume, bid/ask depth, last price",
    inputSchema: {
      type: "object" as const,
      properties: {
        instruments: {
          type: "array",
          items: { type: "string" },
          description: 'Instrument keys, e.g. ["NSE:INFY", "BSE:SENSEX"]',
        },
      },
      required: ["instruments"],
    },
  },
  {
    name: "get_ltp",
    description: "Get last traded price for one or more instruments",
    inputSchema: {
      type: "object" as const,
      properties: {
        instruments: {
          type: "array",
          items: { type: "string" },
          description: 'Instrument keys, e.g. ["NSE:INFY"]',
        },
      },
      required: ["instruments"],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

// --- Tool handlers ---

function jsonResponse(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;
  const a = args as Record<string, any>;

  try {
    switch (name) {
      case "get_profile":
        return jsonResponse(await kc.getProfile());

      case "get_holdings":
        return jsonResponse(await kc.getHoldings());

      case "get_positions":
        return jsonResponse(await kc.getPositions());

      case "get_orders":
        return jsonResponse(await kc.getOrders());

      case "place_order": {
        const params: Record<string, any> = {
          exchange: a.exchange,
          tradingsymbol: a.tradingsymbol,
          transaction_type: a.transaction_type,
          quantity: a.quantity,
          order_type: a.order_type,
          product: a.product,
        };
        if (a.price !== undefined) params.price = a.price;
        if (a.trigger_price !== undefined) params.trigger_price = a.trigger_price;
        if (a.validity !== undefined) params.validity = a.validity;

        const result = await kc.placeOrder("regular", params as any);
        return {
          content: [
            { type: "text" as const, text: `Order placed. Order ID: ${result.order_id}` },
          ],
        };
      }

      case "cancel_order": {
        const variety = (a.variety ?? "regular") as any;
        await kc.cancelOrder(variety, a.order_id);
        return {
          content: [
            { type: "text" as const, text: `Order ${a.order_id} cancelled` },
          ],
        };
      }

      case "get_quote":
        return jsonResponse(await kc.getQuote(a.instruments as string[]));

      case "get_ltp":
        return jsonResponse(await kc.getLTP(a.instruments as string[]));

      default:
        return {
          content: [{ type: "text" as const, text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text" as const, text: `Error: ${message}` }],
      isError: true,
    };
  }
});

// --- Start ---

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Zerodha MCP Server running on stdio");
