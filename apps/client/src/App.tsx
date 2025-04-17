import { useMemo, useState } from "react";

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
    <main className=" h-screen flex flex-col gap-2">
      <Prompt />
      <Chat />
      <StreamingPrompt />
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
    <div className=" h-52 bg-blue-50 rounded p-2 flex flex-col">
      <div className=" flex p-2 bg-slate-100 flex-col gap-1 flex-1 overflow-auto">
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

function StreamingPrompt() {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");

  async function handleSubmit() {
    setAnswer("");
    const res = await fetch("http://localhost:3000/api/streaming-prompt", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: prompt,
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const reader = res.body!.getReader();

    const decoder = new TextDecoder();

    let done = false;
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      const match = chunkValue.match(/0:"(.*)"/)?.[1];
      if (match) {
        setAnswer((prev) => prev + match);
      }
    }

    reader.releaseLock();
  }

  const parsedNewLines = useMemo(() => {
    return answer.split("\\n");
  }, [answer]);

  return (
    <div className=" bg-sky-100 p-2 flex flex-col">
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
      <div>
        {parsedNewLines.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
