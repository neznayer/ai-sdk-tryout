import { useState } from "react";

function App() {
  return (
    <main>
      <Prompt />
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

export default App;
