// app/.well-known/farcaster.json/route.ts
// Farcaster Mini App için manifest dosyası

import { NextResponse } from 'next/server';

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  const farcasterConfig = {
    // Gerçek bir uygulamada bu alanlar doldurulmalıdır
    accountAssociation: {
      "header": "",
      "payload": "",
      "signature": ""
    },
    frame: {
      version: "1",
      name: "Monad Sliding Puzzle",
      iconUrl: `${appUrl}/images/icon.png`, // Uygulama mağazasındaki icon
      homeUrl: `${appUrl}`, // Varsayılan açılış URL'i
      imageUrl: `${appUrl}/images/feed.png`, // Feed'de gösterilecek varsayılan görüntü
      screenshotUrls: [], // Uygulamanın görsel önizlemeleri
      tags: ["monad", "farcaster", "miniapp", "game", "blockchain", "puzzle"], // Arama için tanımlayıcı etiketler
      primaryCategory: "games",
      buttonTitle: "Sliding Puzzle Oyna",
      splashImageUrl: `${appUrl}/images/splash.png`, // Yükleme ekranında gösterilecek görüntü
      splashBackgroundColor: "#4f46e5", // Yükleme ekranı arka plan rengi (hex kodu)
    }
  };

  return NextResponse.json(farcasterConfig);
}
