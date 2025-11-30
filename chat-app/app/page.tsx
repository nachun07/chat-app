"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const CORRECT_PASSWORD = process.env.NEXT_PUBLIC_CHAT_PASSWORD || "chat-app";

export default function HomePage() {
  const router = useRouter();
  const [step, setStep] = useState<"password" | "name">("password");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handlePasswordSubmit = (e: any) => {
    e.preventDefault();
    if (password !== CORRECT_PASSWORD) {
      setError("パスワードが違います");
      return;
    }
    setError("");
    setStep("name");
  };

  const handleNameSubmit = async (e: any) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("名前を入力してください");
      return;
    }

    // Firebase に名前を保存
    const userRef = await addDoc(collection(db, "users"), {
      name: name.trim(),
      createdAt: serverTimestamp(),
    });

    const userId = userRef.id;

    // URL や localStorage には保存しない
    // router.push("/chat") で遷移後、メモリ経由で userId を渡す方法に切り替える
    router.push(`/chat?uid=${userId}`);
  };

  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column"
    }}>
      <h1 style={{ fontSize: 28, marginBottom: 20 }}>chat-app</h1>

      {step === "password" && (
        <form onSubmit={handlePasswordSubmit}
          style={{ display: "flex", flexDirection: "column", width: "100%", maxWidth: 260 }}>
          
          <input
            type="password"
            value={password}
            placeholder="パスワードを入力"
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            style={{
              padding: 8,
              borderRadius: 8,
              border: "1px solid #ccc",
              marginBottom: 16,
              fontSize: 16
            }}
          />

          <button
            type="submit"
            style={{
              padding: 10,
              borderRadius: 8,
              border: "none",
              backgroundColor: "#007bff",
              color: "#fff",
              fontSize: 16
            }}>
            次へ
          </button>

          {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
        </form>
      )}

      {step === "name" && (
        <form onSubmit={handleNameSubmit}
          style={{ display: "flex", flexDirection: "column", width: "100%", maxWidth: 260 }}>

          <input
            type="text"
            value={name}
            placeholder="名前を入力"
            onChange={(e) => { setName(e.target.value); setError(""); }}
            style={{
              padding: 8,
              borderRadius: 8,
              border: "1px solid #ccc",
              marginBottom: 16,
              fontSize: 16
            }}
          />

          <button
            type="submit"
            style={{
              padding: 10,
              borderRadius: 8,
              border: "none",
              backgroundColor: "#007bff",
              color: "#fff",
              fontSize: 16
            }}>
            チャットへ
          </button>

          {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
        </form>
      )}
    </div>
  );
}
