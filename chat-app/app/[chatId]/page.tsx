"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc, doc, onSnapshot, query, orderBy, serverTimestamp, getDoc, setDoc } from "firebase/firestore";
import md5 from "md5";
import { useParams, useSearchParams } from "next/navigation";

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: any;
}

interface User {
  id: string;
  name: string;
}

export default function ChatRoom() {
  const params = useParams();
  const searchParams = useSearchParams();
  const chatIdParam = params.chatId;
  const currentUserId = searchParams.get("currentUserId");

  if (!chatIdParam || Array.isArray(chatIdParam) || !currentUserId) {
    return <div>不正なアクセスです</div>;
  }

  const chatId = chatIdParam;
  const [participants, setParticipants] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // 参加者情報取得
  useEffect(() => {
    const fetchParticipants = async () => {
      const ids = chatId.split("_");
      const list: User[] = [];
      for (const id of ids) {
        const docSnap = await getDoc(doc(db, "users", id));
        if (docSnap.exists()) list.push({ id, name: docSnap.data().name });
        else list.push({ id, name: "名無し" });
      }
      setParticipants(list);
    };
    fetchParticipants();
  }, [chatId]);

  // メッセージ取得（リアルタイム）
  useEffect(() => {
    const messagesCol = collection(db, `chats/${chatId}/messages`);
    const q = query(messagesCol, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, snapshot => {
      const msgs: Message[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    });
    return () => unsubscribe();
  }, [chatId]);

  // メッセージ送信
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // チャット作成（存在しない場合）
    await setDoc(doc(db, "chats", chatId), { participants: participants.map(p => p.id), createdAt: serverTimestamp() }, { merge: true });

    // メッセージ追加
    const messagesCol = collection(db, `chats/${chatId}/messages`);
    await addDoc(messagesCol, { text: newMessage.trim(), senderId: currentUserId, timestamp: serverTimestamp() });
    setNewMessage("");
  };

  const getGravatar = (id: string) => `https://www.gravatar.com/avatar/${md5(id)}?d=identicon`;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#f0f0f0" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map(msg => {
          const isMe = currentUserId === msg.senderId;
          return (
            <div key={msg.id} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", alignItems: "flex-start", gap: 8 }}>
              <img src={getGravatar(msg.senderId)} alt="" style={{ width: 32, height: 32, borderRadius: "50%" }} />
              <div style={{
                backgroundColor: isMe ? "#007bff" : "#fff",
                color: isMe ? "#fff" : "#000",
                padding: "8px 12px",
                borderRadius: 16,
                maxWidth: "70%",
                wordBreak: "break-word"
              }}>
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSend} style={{ display: "flex", padding: 16, backgroundColor: "#fff" }}>
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="メッセージを入力..."
          style={{ flex: 1, padding: 8, borderRadius: 20, border: "1px solid #ccc", marginRight: 8 }}
        />
        <button type="submit" style={{ padding: "8px 16px", borderRadius: 20, backgroundColor: "#007bff", color: "#fff", border: "none", cursor: "pointer" }}>送信</button>
      </form>
    </div>
  );
}
