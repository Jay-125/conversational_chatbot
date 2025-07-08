// // import reactLogo from './assets/react.svg'
// // import viteLogo from '/vite.svg'
// // import './App.css'


// // import React, { useState } from 'react';

// // function App() {
// //   const [messages, setMessages] = useState([]);
// //   const [input, setInput] = useState("");

// //   const sendMessage = async () => {
// //     if (!input.trim()) return;

// //     const userMessage = { sender: "user", text: input };
// //     setMessages((prev) => [...prev, userMessage]);

// //     const res = await fetch("http://localhost:8000/chat", {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({ query: input }),
// //     });

// //     const data = await res.json();
// //     const botMessage = { sender: "bot", text: data.response };
// //     setMessages((prev) => [...prev, botMessage]);
// //     setInput("");
// //   };

// //   return (
// //     <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
// //       <h2>🤖 Company Assistant</h2>
// //       <div style={{ border: "1px solid #ccc", padding: 10, height: 400, overflowY: "auto" }}>
// //         {messages.map((msg, i) => (
// //           <div key={i} style={{ textAlign: msg.sender === "user" ? "right" : "left", marginBottom: 10 }}>
// //             <strong>{msg.sender === "user" ? "You" : "Assistant"}:</strong> {msg.text}
// //           </div>
// //         ))}
// //       </div>
// //       <div style={{ marginTop: 10 }}>
// //         <input
// //           style={{ width: "80%", padding: 10 }}
// //           value={input}
// //           onChange={(e) => setInput(e.target.value)}
// //           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
// //           placeholder="Ask something..."
// //         />
// //         <button onClick={sendMessage} style={{ padding: 10 }}>Send</button>
// //       </div>
// //     </div>
// //   );
// // }

// // export default App;


// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// import React, { useState } from 'react';

// function App() {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [speakingIndex, setSpeakingIndex] = useState(null);

//   const sendMessage = async () => {
//     if (!input.trim()) return;
  
//     const userMessage = { sender: "user", text: input };
//     setMessages((prev) => [...prev, userMessage]);
  
//     try {
//       const res = await fetch("http://localhost:8000/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ query: input }),
//       });
  
//       if (!res.ok) throw new Error("Server error");
  
//       const data = await res.json();
//       const botMessage = { sender: "bot", text: data.response };
//       setMessages((prev) => [...prev, botMessage]);
//     } catch (error) {
//       console.error("Chat API Error:", error.message);
//       setMessages((prev) => [...prev, { sender: "bot", text: "I don't know." }]);
//     }
  
//     setInput("");
//   };

//   const speakText = (text, index) => {
//     window.speechSynthesis.cancel(); // Stop anything currently speaking

//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.onend = () => setSpeakingIndex(null); // Reset after speaking ends

//     setSpeakingIndex(index);
//     window.speechSynthesis.speak(utterance);
//   };

//   const pauseSpeech = () => window.speechSynthesis.pause();
//   const resumeSpeech = () => window.speechSynthesis.resume();
//   const stopSpeech = () => {
//     window.speechSynthesis.cancel();
//     setSpeakingIndex(null);
//   };

//   return (
//     <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
//       <h2>🤖 Company Assistant</h2>
//       <div style={{ border: "1px solid #ccc", padding: 10, height: 400, overflowY: "auto" }}>
//         {messages.map((msg, i) => (
//           <div
//             key={i}
//             style={{ textAlign: msg.sender === "user" ? "right" : "left", marginBottom: 10 }}
//           >
//             <strong>{msg.sender === "user" ? "You" : "Assistant"}:</strong> {msg.text}
//             {msg.sender === "bot" && (
//               <>
//                 <button onClick={() => speakText(msg.text, i)} style={{ marginLeft: 10 }} title="Speak">
//                   🔊
//                 </button>
//                 {speakingIndex === i && (
//                   <span style={{ marginLeft: 10 }}>
//                     <button onClick={pauseSpeech} style={{ marginRight: 5 }}>⏸ Pause</button>
//                     <button onClick={resumeSpeech} style={{ marginRight: 5 }}>▶ Resume</button>
//                     <button onClick={stopSpeech}>⏹ Stop</button>
//                   </span>
//                 )}
//               </>
//             )}
//           </div>
//         ))}
//       </div>
//       <div style={{ marginTop: 10 }}>
//         <input
//           style={{ width: "80%", padding: 10 }}
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//           placeholder="Ask something..."
//         />
//         <button onClick={sendMessage} style={{ padding: 10 }}>Send</button>
//       </div>
//     </div>
//   );
// }

// export default App;


import React, { useState } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [listening, setListening] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      const botMessage = { sender: "bot", text: data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat API Error:", error.message);
      setMessages((prev) => [...prev, { sender: "bot", text: "I don't know." }]);
    }

    setInput("");
  };

  const speakText = (text, index) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeakingIndex(null);
    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const pauseSpeech = () => window.speechSynthesis.pause();
  const resumeSpeech = () => window.speechSynthesis.resume();
  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setSpeakingIndex(null);
  };

  // 🎤 Speech Recognition
  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Your browser doesn't support speech recognition.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h2>🤖 Company Assistant</h2>
      <div style={{ border: "1px solid #ccc", padding: 10, height: 400, overflowY: "auto" }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{ textAlign: msg.sender === "user" ? "right" : "left", marginBottom: 10 }}
          >
            <strong>{msg.sender === "user" ? "You" : "Assistant"}:</strong> {msg.text}
            {msg.sender === "bot" && (
              <>
                <button onClick={() => speakText(msg.text, i)} style={{ marginLeft: 10 }} title="Speak">
                  🔊
                </button>
                {speakingIndex === i && (
                  <span style={{ marginLeft: 10 }}>
                    <button onClick={pauseSpeech} style={{ marginRight: 5 }}>⏸ Pause</button>
                    <button onClick={resumeSpeech} style={{ marginRight: 5 }}>▶ Resume</button>
                    <button onClick={stopSpeech}>⏹ Stop</button>
                  </span>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10 }}>
        <input
          style={{ width: "70%", padding: 10 }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask something..."
        />
        <button onClick={sendMessage} style={{ padding: 10 }}>Send</button>
        <button
          onClick={handleMicClick}
          style={{ padding: 10, marginLeft: 5 }}
          title="Speak"
        >
          {listening ? "🎙️ Listening..." : "🎤"}
        </button>
      </div>
    </div>
  );
}

export default App;
