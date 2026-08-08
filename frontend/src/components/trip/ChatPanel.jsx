import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import Modal from "../ui/Modal";

// Five canned messages riders send most often while waiting for pickup,
// each paired with a simulated driver reply — there's no real chat backend
// yet, so this keeps the conversation feeling alive on the client.
const QUICK_REPLIES = [
  { text: "I'm at the pickup point", reply: "Got it, on my way!" },
  { text: "Please hurry, I'm running late", reply: "Sure, I'm almost there!" },
  { text: "Where are you right now?", reply: "Just a couple of minutes away." },
  { text: "I'll be there in 2 minutes", reply: "No problem, take your time." },
  { text: "Thank you, see you soon!", reply: "See you soon!" },
];

function ChatPanel({ open, onClose, driverName }) {
  const [messages, setMessages] = useState([
    { from: "driver", text: `Hi! This is ${driverName || "your driver"}, on my way to pick you up.` },
  ]);
  const [input, setInput] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function sendMessage(text, autoReply) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((m) => [...m, { from: "me", text: trimmed }]);
    setTimeout(() => {
      setMessages((m) => [...m, { from: "driver", text: autoReply }]);
    }, 1200);
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage(input, "Got it, thanks for letting me know!");
    setInput("");
  }

  return (
    <Modal open={open} onClose={onClose} title={`Chat with ${driverName || "your driver"}`}>
      <div ref={listRef} className="mb-4 flex max-h-72 flex-col gap-2.5 overflow-y-auto pr-1">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-5 ${
              m.from === "me"
                ? "self-end bg-violet-600 text-white"
                : "self-start bg-surface-alt text-text"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {QUICK_REPLIES.map((qr) => (
          <button
            key={qr.text}
            type="button"
            onClick={() => sendMessage(qr.text, qr.reply)}
            className="cursor-pointer rounded-full border border-border bg-black/[0.02] px-3 py-1.5 text-xs font-medium text-text-dim transition hover:border-violet-400/40 hover:text-text"
          >
            {qr.text}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-xl border border-border bg-surface-alt/60 px-4 py-2.5 text-sm outline-none focus:border-violet-400"
        />
        <button
          type="submit"
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-500"
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </form>
    </Modal>
  );
}

export default ChatPanel;
