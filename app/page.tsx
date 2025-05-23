// app/page.tsx
// Ana sayfa, Farcaster Frame bilgilerini içerir

import { Metadata } from "next";
import App from "@/components/pages/app";
import { APP_URL } from "@/lib/constants";

const frame = {
  version: "next",
  imageUrl: `${APP_URL}/images/feed.png`,
  button: {
    title: "Sliding Puzzle Play",
    action: {
      type: "launch_frame",
      name: "Monad Sliding Puzzle",
      url: APP_URL,
      splashImageUrl: `${APP_URL}/images/splash.png`,
      splashBackgroundColor: "#4f46e5",
    },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Monad Sliding Puzzle",
    description: "A number shift puzzle running on the Monad blockchain",
    openGraph: {
      title: "Monad Sliding Puzzle",
      description: "A number shift puzzle running on the Monad blockchain",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return <App />;
}
