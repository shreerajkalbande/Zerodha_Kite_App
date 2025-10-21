#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { KiteConnect } from "kiteconnect";

const apiKey = process.env.KITE_API_KEY;
const apiSecret = process.env.KITE_API_SECRET;
const requestToken = process.env.KITE_REQUEST_TOKEN;

if (!apiKey || !apiSecret) {
  console.error("Missing KITE_API_KEY or KITE_API_SECRET");
  process.exit(1);
}

const kc = new KiteConnect({ api_key: apiKey });

// Initialize session if request token is available
if (requestToken) {
  try {
    const response = await kc.generateSession(requestToken, apiSecret);
    kc.setAccessToken(response.access_token);
  } catch (err) {
    console.error("Session generation failed:", err);
  }
}

const server = new Server(
  { name: "zerodha-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_profile",
      description: "Get user profile information including email, username, and account details",
      inputSchema: { type: "object", properties: {}, required: [] }
    },
    {
      name: "get_holdings",
      description: "Get list of long-term equity holdings",
      inputSchema: { type: "object", properties: {}, required: [] }
    },
    {
      name: "get_positions",
      description: "Get current day and net positions",
      inputSchema: { type: "object", properties: {}, required: [] }
    },
    {
      name: "get_orders",
      description: "Get list of all orders for the day",
      inputSchema: { type: "object", properties: {}, required: [] }
    },
    {
      name: "place_order",
      description: "Place a new order (BUY/SELL)",
      inputSchema: {
        type: "object",
        properties: {
          exchange: { type: "string", description: "Exchange (NSE, BSE, NFO, etc.)" },
          tradingsymbol: { type: "string", description: "Trading symbol (e.g., INFY, RELIANCE)" },
          transaction_type: { type: "string", enum: ["BUY", "SELL"], description: "Transaction type" },
          quantity: { type: "number", description: "Quantity to trade" },
          order_type: { type: "string", enum: ["MARKET", "LIMIT"], description: "Order type" },
          product: { type: "string", enum: ["CNC", "MIS", "NRML"], description: "Product type" },
          price: { type: "number", description: "Price (required for LIMIT orders)" }
        },
        required: ["exchange", "tradingsymbol", "transaction_type", "quantity", "order_type", "product"]
      }
    },
    {
      name: "cancel_order",
      description: "Cancel an existing order",
      inputSchema: {
        type: "object",
        properties: {
          order_id: { type: "string", description: "Order ID to cancel" }
        },
        required: ["order_id"]
      }
    },
    {
      name: "get_quote",
      description: "Get market quote for instruments",
      inputSchema: {
        type: "object",
        properties: {
          instruments: { type: "array", items: { type: "string" }, description: "Array of instruments (e.g., ['NSE:INFY', 'BSE:SENSEX'])" }
        },
        required: ["instruments"]
      }
    },
    {
      name: "get_ltp",
      description: "Get last traded price for instruments",
      inputSchema: {
        type: "object",
        properties: {
          instruments: { type: "array", items: { type: "string" }, description: "Array of instruments (e.g., ['NSE:INFY'])" }
        },
        required: ["instruments"]
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "get_profile": {
        const profile = await kc.getProfile();
        return { content: [{ type: "text", text: JSON.stringify(profile, null, 2) }] };
      }

      case "get_holdings": {
        const holdings = await kc.getHoldings();
        return { content: [{ type: "text", text: JSON.stringify(holdings, null, 2) }] };
      }

      case "get_positions": {
        const positions = await kc.getPositions();
        return { content: [{ type: "text", text: JSON.stringify(positions, null, 2) }] };
      }

      case "get_orders": {
        const orders = await kc.getOrders();
        return { content: [{ type: "text", text: JSON.stringify(orders, null, 2) }] };
      }

      case "place_order": {
        const order = await kc.placeOrder(args.exchange, args.tradingsymbol, args.transaction_type, args.quantity, {
          order_type: args.order_type,
          product: args.product,
          price: args.price
        });
        return { content: [{ type: "text", text: `Order placed successfully. Order ID: ${order.order_id}` }] };
      }

      case "cancel_order": {
        await kc.cancelOrder(args.order_id);
        return { content: [{ type: "text", text: `Order ${args.order_id} cancelled successfully` }] };
      }

      case "get_quote": {
        const quote = await kc.getQuote(args.instruments);
        return { content: [{ type: "text", text: JSON.stringify(quote, null, 2) }] };
      }

      case "get_ltp": {
        const ltp = await kc.getLTP(args.instruments);
        return { content: [{ type: "text", text: JSON.stringify(ltp, null, 2) }] };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Zerodha MCP Server running on stdio");
}

main();
