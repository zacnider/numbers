// app/.well-known/farcaster.json/route.ts
// Farcaster Mini App için manifest dosyası

import { NextResponse } from 'next/server';

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  const farcasterConfig = {
   
    accountAssociation: {
      "header": "",
      "payload": "",
      "signature": ""
    },
    frame: {
      version: "1",
      name: "Monad Sliding Puzzle",
      iconUrl: `${appUrl}/images/icon.png`, 
      homeUrl: `${appUrl}`, // Varsayılan açılış URL'i
      imageUrl: `${appUrl}/images/feed.png`, 
      screenshotUrls: [], 
      tags: ["monad", "farcaster", "miniapp", "game", "blockchain", "puzzle"], 
      primaryCategory: "games",
      buttonTitle: "Sliding Puzzle Oyna",
      splashImageUrl: `${appUrl}/images/splash.png`, 
      splashBackgroundColor: "#4f46e5", 
    }
  };

  return NextResponse.json(farcasterConfig);
}
