"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { useSearchParams, useRouter } from "next/navigation";
import md5 from "md5";

interface Message {
  id: string;
  text: string;
  senderName: string;
  timestamp: any;
}

export default function ChatRoom() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userNameParam = searchParams.get("name"); // URL ?name=xxx から取得

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userNameParam) {
      router.push("/"); // 名前がなければ戻す
    }
  }, [userNameParam, router]);

  const handleSend = async (e: any) => {
    e.preventDefault();
    if (!newMessage.trim() || !userNameParam) return;

    const messagesCol = collection(db, "messages");
    await addDoc(messagesCol, {
      text: newMessage.trim(),
      senderName: userNameParam,
      timestamp: serverTimestamp(),
    });

    setNewMessage("");
  };

  const getAvatarUrl = (name: string) => {
    const hash = md5(name.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
  };

  // メッセージ取得
  useEffect(() => {
    const messagesCol = collection(db, "messages");
    const q = query(messagesCol, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Message));

      setMessages(msgs);
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    return () => unsubscribe();
  }, []);

  if (!userNameParam) return <div>Loading...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#f0f0f0" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map((msg) => {
          const isSelf = msg.senderName === userNameParam;
          return (
            <div key={msg.id} style={{ display: "flex", alignItems: "flex-start", justifyContent: isSelf ? "flex-end" : "flex-start", gap: 8 }}>
              {!isSelf && <img src={getAvatarUrl(msg.senderName)} alt={msg.senderName} style={{ width: 32, height: 32, borderRadius: "50%" }} />}
              <div style={{ backgroundColor: isSelf ? "#007bff" : "#fff", color: isSelf ? "#fff" : "#000", padding: "8px 12px", borderRadius: 16, maxWidth: "70%", wordBreak: "break-word", textAlign: "left" }}>
                {!isSelf && <strong>{msg.senderName}: </strong>}
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSend} autoComplete="off" style={{ display: "flex", justifyContent: "center", padding: 16, backgroundColor: "#fff" }}>
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="メッセージを入力..."
          style={{ width: "80%", maxWidth: 300, padding: "12px 10px", borderRadius: 16, border: "1px solid #ccc", fontSize: 14, height: 48 }}
          autoComplete="off"
        />
        <button type="submit" style={{ marginLeft: 8, padding: "10px 16px", borderRadius: 16, backgroundColor: "#007bff", color: "#fff", border: "none", cursor: "pointer", fontSize: 14 }}>
          送信
        </button>
      </form>
    </div>
  );
}