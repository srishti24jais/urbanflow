// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import MapView from "../components/MapView";
import { doc, setDoc, onSnapshot, collection, addDoc } from "firebase/firestore";
import ChatAssistant from "../components/ChatAssistant";

interface SignalState {
  [key: string]: string;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [signalStates, setSignalStates] = useState<SignalState>({
    A: "red",
    B: "red",
    C: "red",
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    const unsubSignals = ["A", "B", "C"].map((signal) =>
      onSnapshot(doc(db, "signals", signal), (docSnap) => {
        const data = docSnap.data();
        if (data?.state) {
          setSignalStates((prev) => ({
            ...prev,
            [signal]: data.state,
          }));
        }
      })
    );

    const autoSwitchSignals = () => {
      const order = ["green", "yellow", "red"];
      let idx = 0;
      setInterval(() => {
        const state = order[idx % 3];
        ["A", "B", "C"].forEach(async (signal) => {
          await setDoc(doc(db, "signals", signal), { state });
          await addDoc(collection(db, "analytics"), {
            signal,
            state,
            timestamp: new Date().toISOString(),
            user: auth.currentUser?.email || "unknown",
          });
        });
        idx++;
      }, 6000);
    };

    autoSwitchSignals();

    return () => {
      unsubscribe();
      unsubSignals.forEach((unsub) => unsub());
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">🚦</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">UrbanFlow</h1>
                <p className="text-blue-100">Traffic Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right text-white">
                <p className="text-sm text-blue-100">Welcome back,</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Signal Status Cards */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            {Object.entries(signalStates).map(([signal, state]) => (
              <div key={signal} className="bg-white rounded-xl shadow-lg border-l-4 border-blue-500 p-6 transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Signal {signal}</h3>
                    <p className="text-sm text-gray-600">Current Status</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full shadow-lg ${
                    state === 'red' ? 'bg-red-500 animate-pulse' : 
                    state === 'yellow' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500 animate-pulse'
                  }`}></div>
                </div>
                <div className="mt-4">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
                    state === 'red' ? 'bg-red-100 text-red-800 border border-red-200' : 
                    state === 'yellow' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'bg-green-100 text-green-800 border border-green-200'
                  }`}>
                    {state.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="flex justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl">
            {/* Map View */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">🗺️</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Live Traffic Map</h2>
                      <p className="text-blue-100">Real-time signal locations</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <MapView />
                </div>
              </div>
            </div>

            {/* Chat Assistant */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full">
                <div className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">🤖</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">AI Assistant</h2>
                      <p className="text-purple-100">Ask about traffic signals</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <ChatAssistant />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
