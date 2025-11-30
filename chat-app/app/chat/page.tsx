"use client";

import dynamic from "next/dynamic";

// 元の ChatRoom コンポーネントをクライアントレンダリングに
const ChatRoom = dynamic(() => import("./ChatRoom"), { ssr: false });

export default function Page() {
  return <ChatRoom />;
}
