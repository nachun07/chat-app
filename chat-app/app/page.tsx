"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // パスワードチェック（任意の固定パスワードに変更可能）
    if (password !== "H-chat-app") {
      setError("パスワードが違います");
      return;
    }

    if (!name.trim()) {
      setError("名前を入力してください");
      return;
    }

    // クライアントサイドでチャットに進む
    // localStorage を使わず、クエリで名前を渡す
    router.push(`/chat?name=${encodeURIComponent(name.trim())}`);
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      backgroundColor: "#f0f0f0",
      gap: 16
    }}>
      <h1>チャットにログイン</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="名前"
          style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc", fontSize: 14 }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="パスワード"
          style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc", fontSize: 14 }}
        />
        {error && <div style={{ color: "red" }}>{error}</div>}
        <button type="submit" style={{
          padding: "8px 16px",
          borderRadius: 8,
          border: "none",
          backgroundColor: "#007bff",
          color: "#fff",
          cursor: "pointer"
        }}>ログイン</button>
      </form>
    </div>
  );
}
