# Zerodha Trading API Integration

A simple TypeScript project to interact with Zerodha's Kite Connect API using Bun runtime.

## Prerequisites

- [Bun](https://bun.sh) runtime installed
- Zerodha Kite Connect API credentials (API Key, API Secret)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd zerodha_trade
```

2. Install dependencies:
```bash
bun install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Add your Zerodha API credentials to the `.env` file:
```env
KITE_API_KEY=your_api_key_here
KITE_API_SECRET=your_api_secret_here
KITE_REQUEST_TOKEN=your_request_token_here
```

## Getting API Credentials

1. Sign up for Kite Connect API at [Zerodha Kite Connect](https://kite.trade/)
2. Create an app to get your API Key and API Secret
3. Generate a request token by logging in through the login URL (printed when you run the app)

## Usage

Run the application:
```bash
bun run index.ts
```

## Features

- Generate session with Kite Connect API
- Fetch user profile information
- Environment-based configuration

## Security

- Never commit your `.env` file to version control
- Keep your API credentials secure
- Regenerate tokens if accidentally exposed

## License

MIT
