# Monad Sliding Puzzle MiniApp

This project is a number sliding puzzle game that runs on the Monad blockchain and is presented as a Farcaster Mini App.

## Features

- Number sliding puzzle game
- Monad blockchain integration
- Warpcast wallet integration
- In-game wallet management
- Send and receive MON tokens
- Game records on blockchain
- Game completion rewards

## Installation

### Installing Requirements

```bash
npm install
# or
yarn
```

### Configuring Environment Variables

```bash
cp .env.example .env.local
```

Edit the .env.local file to set the required environment variables:

```
NEXT_PUBLIC_URL=https://your-app-url.com
```

During development, you can use Cloudflared or Ngrok to expose localhost and use that URL.

### Starting the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building the Project

```bash
npm run build
# or
yarn build
```

## Deployment on Netlify

This project is configured for direct deployment on Netlify. When you connect your Github repo to Netlify, the configurations in `netlify.toml` will be used automatically.

After deployment, you need to set the following environment variable in Netlify:
- `NEXT_PUBLIC_URL`: The full URL of your application (e.g., https://your-app.netlify.app)

## Testing in Warpcast Embed Tool

You can test your application in the Warpcast [Embed tool](https://warpcast.com/~/developers/mini-apps/embed). Use your Netlify URL or the URL you've exposed using Cloudflared/Ngrok in this tool.

## Registering as a Farcaster Mini App

To register your application in the Farcaster ecosystem, update the configuration in `app/.well-known/farcaster.json/route.ts` and add account association information.
