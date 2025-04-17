import { useState } from "react";

type CoreMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type ResponseMessage = {
  role: "user" | "assistant" | "system";
  content: Array<{ type: "text" | "image"; text: string }>;
};

function App() {
  return (
    <main>
      <Prompt />
      <Chat />
    </main>
  );
}

function Prompt() {
  const [prompt, setPrompt] = useState("");

  const [answer, setAnswer] = useState("");

  async function handleSubmit() {
    const res = await fetch("http://localhost:3000/api/prompt", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      throw new Error("Failed to submit prompt");
    }

    const data = await res.text();

    setAnswer(data);
  }

  return (
    <div className=" h-52 bg-blue-50 rounded p-2">
      <div>
        <input
          className="p-1 border border-slate-300"
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          className="p-1 bg-blue-500 text-white rounded"
        >
          Submit
        </button>
      </div>
      <div>{answer}</div>
    </div>
  );
}

function Chat() {
  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");

  async function handleSubmit() {
    const newMessages: CoreMessage[] = [
      ...messages,
      { role: "user", content: currentMessage },
    ];

    setMessages((prev) => [...prev, { role: "user", content: currentMessage }]);

    const res = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMessages),
    });

    if (!res.ok) {
      throw new Error("Failed to submit chat");
    }

    const data = (await res.json()) as ResponseMessage[];

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: data[0].content.map((c) => c.text).join(" "),
      },
    ]);
    setCurrentMessage("");
  }

  return (
    <div className=" h-52 bg-blue-50 rounded p-2">
      <div className=" flex p-2 bg-slate-100 flex-col gap-1">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : ""} ${message.role === "assistant" ? "justify-start" : ""}`}
          >
            <div>{message.content}</div>
          </div>
        ))}
      </div>
      <div>
        <input
          className="p-1 border border-slate-300"
          type="text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          className="p-1 bg-blue-500 text-white rounded"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default App;
