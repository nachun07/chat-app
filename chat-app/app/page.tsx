"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, doc, setDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function HomePage() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    // 同じ名前が既に存在するかチェック
    const q = query(collection(db, "users"), where("name", "==", trimmedName));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      setError("この名前は既に使われています。他の名前にしてください。");
      return;
    }

    // ユーザーを登録
    const userRef = doc(collection(db, "users"));
    await setDoc(userRef, { name: trimmedName });

    // チャットページに遷移（名前は渡さずuserIdだけ）
    router.push(`/chat?userId=${userRef.id}`);
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      padding: 16,
      backgroundColor: "#f0f0f0"
    }}>
      <h1 style={{ marginBottom: 24 }}>チャットアプリへようこそ</h1>
      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", width: "100%", maxWidth: 300 }}>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(""); }}
          placeholder="名前を入力してください"
          style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc", marginBottom: 16, fontSize: 16 }}
        />
        {error && <p style={{ color: "red", marginBottom: 16 }}>{error}</p>}
        <button
          type="submit"
          style={{ padding: 10, borderRadius: 8, border: "none", backgroundColor: "#007bff", color: "#fff", fontSize: 16, cursor: "pointer" }}
        >
          チャットに参加
        </button>
      </form>
    </div>
  );
}
