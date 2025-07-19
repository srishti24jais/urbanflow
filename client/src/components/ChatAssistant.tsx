// src/components/ChatAssistant.tsx
import React, { useState } from "react";
import { db } from "../firebase";
import { collection, doc, getDoc, query, orderBy, limit, getDocs } from "firebase/firestore";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const ChatAssistant: React.FC = () => {
  const [queryText, setQueryText] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchSignalState = async (signal: string) => {
    const snap = await getDoc(doc(db, "signals", signal));
    return snap.exists() ? snap.data()?.state : "unknown";
  };

  const fetchLastYellowTimestamp = async (signal: string) => {
    const q = query(
      collection(db, "analytics"),
      orderBy("timestamp", "desc"),
      limit(20)
    );
    const docs = await getDocs(q);
    for (const doc of docs.docs) {
      const d = doc.data();
      if (d.signal === signal && d.state === "yellow") {
        return d.timestamp;
      }
    }
    return "No recent yellow state found.";
  };

  const handleAsk = async () => {
    if (!queryText.trim()) return;
    setLoading(true);
    setResponse("");

    try {
      const prompt = `User asked: "${queryText}". 
      If asking for current signal state, fetch from Firestore signals collection.
      If asking about last yellow timestamp, fetch from analytics collection.`;

      // Ask OpenAI what action to take
      const aiRes = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You're a traffic assistant that analyzes Firebase traffic signal data and answers with short, friendly replies.",
          },
          { role: "user", content: prompt },
        ],
      });

      const aiReply = aiRes.choices[0].message.content?.toLowerCase() || "";

      let finalResponse = aiReply;

      // Smart actions based on AI guess
      if (aiReply.includes("signal a")) {
        const state = await fetchSignalState("A");
        finalResponse = `Signal A is currently ${state.toUpperCase()}.`;
      } else if (aiReply.includes("signal b")) {
        const state = await fetchSignalState("B");
        finalResponse = `Signal B is currently ${state.toUpperCase()}.`;
      } else if (aiReply.includes("signal c")) {
        const state = await fetchSignalState("C");
        finalResponse = `Signal C is currently ${state.toUpperCase()}.`;
      } else if (aiReply.includes("last yellow") && aiReply.includes("signal b")) {
        const time = await fetchLastYellowTimestamp("B");
        finalResponse = `Signal B was last yellow at ${time}.`;
      }

      setResponse(finalResponse);
    } catch (error) {
      console.error("Assistant error:", error);
      setResponse("Sorry, I couldn’t fetch the data. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <input
          className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
          placeholder="Ask about signal status..."
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
        />
      </div>
      <button
        onClick={handleAsk}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 transform hover:scale-105"
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processing...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <span>🤖</span>
            <span>Ask Assistant</span>
          </div>
        )}
      </button>

      {response && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs">💡</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-900 mb-1">Assistant Response</p>
              <p className="text-sm text-gray-700 leading-relaxed">{response}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatAssistant;
