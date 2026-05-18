# Infinite newTab — Custom Component Examples Gallery

Welcome to the ultimate repository of custom node components! You can copy and paste any of the examples below directly into the "Edit Custom Code" panel of any Custom Node.

> **Important Notes:**
> - These components use `var` and standard `function()` syntax to ensure maximum compatibility with the sandboxed runtime.
> - They automatically utilize your centralized `App.css` classes (`.cbutn`, `.nr-text-input`, etc.) so they look native and inherit the futuristic beveled aesthetic.
> - Components that need to save data use the `window.__hc.storage` bridge so your data persists across all your new tabs!

---

## 1. Advanced Pomodoro Timer

A fully functional Pomodoro timer to track work and break sessions.

```jsx
import React, { useState, useEffect, useRef } from "react";

export default function Component() {
  var [timeLeft, setTimeLeft] = useState(25 * 60);
  var [isRunning, setIsRunning] = useState(false);
  var [mode, setMode] = useState("Work"); // "Work" or "Break"

  useEffect(function() {
    var timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(function() {
        setTimeLeft(function(prev) { return prev - 1; });
      }, 1000);
    } else if (timeLeft === 0) {
      // Auto-switch modes when timer hits 0
      if (mode === "Work") {
        setMode("Break");
        setTimeLeft(5 * 60);
      } else {
        setMode("Work");
        setTimeLeft(25 * 60);
      }
      setIsRunning(false);
    }
    return function() { clearInterval(timer); };
  }, [isRunning, timeLeft, mode]);

  function toggle() { setIsRunning(!isRunning); }
  function reset() { 
    setIsRunning(false); 
    setTimeLeft(mode === "Work" ? 25 * 60 : 5 * 60); 
  }
  function switchMode(newMode) {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === "Work" ? 25 * 60 : 5 * 60);
  }

  var m = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  var s = (timeLeft % 60).toString().padStart(2, "0");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 12, boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
        <button className="cbutn" style={{ opacity: mode === "Work" ? 1 : 0.5, padding: "4px 8px" }} onClick={function(){switchMode("Work")}}>Work</button>
        <button className="cbutn" style={{ opacity: mode === "Break" ? 1 : 0.5, padding: "4px 8px" }} onClick={function(){switchMode("Break")}}>Break</button>
      </div>
      
      <div className="textp" style={{ flex: 1, fontSize: 48, fontWeight: "bold" }}>
        {m}:{s}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
        <button className="cbutn" onClick={toggle} style={{ flex: 1 }}>{isRunning ? "Pause" : "Start"}</button>
        <button className="cbutn" onClick={reset} style={{ flex: 1, background: "rgba(220, 60, 60, 0.2)", color: "#dc3c3c" }}>Reset</button>
      </div>
    </div>
  );
}
```

---

## 2. Minimalist Calculator

A sleek, beveled calculator for quick math right on your canvas.

```jsx
import React, { useState } from "react";

export default function Component() {
  var [calc, setCalc] = useState("");
  var [result, setResult] = useState("");

  var ops = ["/", "*", "+", "-", "."];

  function updateCalc(val) {
    if ((ops.includes(val) && calc === "") || (ops.includes(val) && ops.includes(calc.slice(-1)))) {
      return;
    }
    setCalc(calc + val);
    if (!ops.includes(val)) {
      try { setResult(eval(calc + val).toString()); } catch(e) {}
    }
  }

  function calculate() {
    try { setCalc(eval(calc).toString()); } catch(e) {}
  }

  function deleteLast() {
    if (calc === "") return;
    var val = calc.slice(0, -1);
    setCalc(val);
    try { setResult(eval(val).toString()); } catch(e) { setResult(""); }
  }

  function clearAll() {
    setCalc("");
    setResult("");
  }

  var btnStyle = { padding: "10px", fontSize: 16 };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, boxSizing: "border-box" }}>
      <div style={{ textAlign: "right", padding: "10px", marginBottom: 10, background: "rgba(0,0,0,0.2)", borderRadius: "12px 0", cornerShape: "bevel" }}>
        <div style={{ fontSize: 14, color: "var(--accent)" }}>{result || "0"}</div>
        <div style={{ fontSize: 24, fontWeight: "bold" }}>{calc || "0"}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, flex: 1 }}>
        <button className="cbutn" style={btnStyle} onClick={clearAll}>C</button>
        <button className="cbutn" style={btnStyle} onClick={deleteLast}>DEL</button>
        <button className="cbutn" style={btnStyle} onClick={function(){updateCalc("/")}}>/</button>
        <button className="cbutn" style={{...btnStyle, background: "var(--accent)", color: "black"}} onClick={function(){updateCalc("*")}}>*</button>
        
        <button className="cbutn" style={btnStyle} onClick={function(){updateCalc("7")}}>7</button>
        <button className="cbutn" style={btnStyle} onClick={function(){updateCalc("8")}}>8</button>
        <button className="cbutn" style={btnStyle} onClick={function(){updateCalc("9")}}>9</button>
        <button className="cbutn" style={{...btnStyle, background: "var(--accent)", color: "black"}} onClick={function(){updateCalc("-")}}>-</button>
        
        <button className="cbutn" style={btnStyle} onClick={function(){updateCalc("4")}}>4</button>
        <button className="cbutn" style={btnStyle} onClick={function(){updateCalc("5")}}>5</button>
        <button className="cbutn" style={btnStyle} onClick={function(){updateCalc("6")}}>6</button>
        <button className="cbutn" style={{...btnStyle, background: "var(--accent)", color: "black"}} onClick={function(){updateCalc("+")}}>+</button>
        
        <button className="cbutn" style={btnStyle} onClick={function(){updateCalc("1")}}>1</button>
        <button className="cbutn" style={btnStyle} onClick={function(){updateCalc("2")}}>2</button>
        <button className="cbutn" style={btnStyle} onClick={function(){updateCalc("3")}}>3</button>
        <button className="cbutn" style={{...btnStyle, gridRow: "span 2", background: "var(--accent)", color: "black"}} onClick={calculate}>=</button>
        
        <button className="cbutn" style={{...btnStyle, gridColumn: "span 2"}} onClick={function(){updateCalc("0")}}>0</button>
        <button className="cbutn" style={btnStyle} onClick={function(){updateCalc(".")}}>.</button>
      </div>
    </div>
  );
}
```

---

## 3. Persistent Scratchpad

A simple markdown/text notepad that persists across all tabs and instances!

```jsx
import React, { useState, useEffect } from "react";

var KEY = "hc_scratchpad";

export default function Component() {
  var [text, setText] = useState("");
  var [loaded, setLoaded] = useState(false);

  useEffect(function() {
    window.__hc.storage.get(KEY, function(val) {
      if (typeof val === "string") setText(val);
      setLoaded(true);
    });
  }, []);

  useEffect(function() {
    if (!loaded) return;
    var id = setTimeout(function() { window.__hc.storage.set(KEY, text); }, 500);
    return function() { clearTimeout(id); };
  }, [text, loaded]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 8, boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong style={{ fontSize: 13 }}>Scratchpad</strong>
        <span style={{ fontSize: 10, opacity: 0.5 }}>{text.length} chars</span>
      </div>
      <textarea
        className="nr-text-input"
        style={{ flex: 1, resize: "none", width: "100%", padding: 10, textAlign: "left", whiteSpace: "pre-wrap" }}
        placeholder="Jot something down..."
        value={text}
        onChange={function(e) { setText(e.target.value); }}
      />
    </div>
  );
}
```

---

## 4. Habit Tracker Matrix

A 7-day habit tracker that saves your progress.

```jsx
import React, { useState, useEffect } from "react";

var KEY = "hc_habits";

export default function Component() {
  var [habits, setHabits] = useState([]);
  var [input, setInput] = useState("");
  var [loaded, setLoaded] = useState(false);

  var days = ["M", "T", "W", "T", "F", "S", "S"];

  useEffect(function() {
    window.__hc.storage.get(KEY, function(val) {
      if (Array.isArray(val)) setHabits(val);
      setLoaded(true);
    });
  }, []);

  useEffect(function() {
    if (!loaded) return;
    window.__hc.storage.set(KEY, habits);
  }, [habits, loaded]);

  function addHabit() {
    var text = input.trim();
    if (!text) return;
    setHabits(function(h) { return h.concat([{ id: Date.now(), name: text, log: [false,false,false,false,false,false,false] }]); });
    setInput("");
  }

  function toggleDay(habitId, dayIndex) {
    setHabits(function(h) {
      return h.map(function(hab) {
        if (hab.id !== habitId) return hab;
        var newLog = [].concat(hab.log);
        newLog[dayIndex] = !newLog[dayIndex];
        return { id: hab.id, name: hab.name, log: newLog };
      });
    });
  }
  
  function remove(id) {
    setHabits(function(h) { return h.filter(function(x) { return x.id !== id; }); });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 12, boxSizing: "border-box" }}>
      <strong style={{ fontSize: 13 }}>Habit Tracker</strong>
      
      <div style={{ display: "flex", gap: 4 }}>
        <input
          className="nr-text-input"
          style={{ flex: 1 }}
          placeholder="Add habit..."
          value={input}
          onChange={function(e) { setInput(e.target.value); }}
          onKeyDown={function(e) { if (e.key === "Enter") addHabit(); }}
        />
        <button className="cbutn" onClick={addHabit}>+</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        {habits.map(function(h) { return (
          <div key={h.id} style={{ display: "flex", flexDirection: "column", gap: 4, background: "rgba(0,0,0,0.2)", padding: 8, borderRadius: "12px 0", cornerShape: "bevel" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span>{h.name}</span>
              <span style={{ cursor: "pointer", color: "#dc3c3c" }} onClick={function(){remove(h.id)}}>×</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {days.map(function(d, i) { return (
                <div 
                  key={i}
                  onClick={function() { toggleDay(h.id, i); }}
                  style={{ 
                    width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, cursor: "pointer",
                    background: h.log[i] ? "var(--accent)" : "var(--code-bg)",
                    color: h.log[i] ? "black" : "var(--text)",
                    borderRadius: "4px 0", cornerShape: "bevel"
                  }}
                >{d}</div>
              ); })}
            </div>
          </div>
        ); })}
      </div>
    </div>
  );
}
```

---

## 5. Daily Motivational Quote

Fetches a random inspirational quote.

```jsx
import React, { useState, useEffect } from "react";

export default function Component() {
  var [quote, setQuote] = useState("Loading inspiration...");
  var [author, setAuthor] = useState("");

  function fetchQuote() {
    setQuote("...");
    setAuthor("");
    fetch("https://api.quotable.io/random")
      .then(function(res) { return res.json(); })
      .then(function(data) {
        setQuote(data.content);
        setAuthor(data.author);
      })
      .catch(function(err) {
        setQuote("Stay hungry, stay foolish.");
        setAuthor("Steve Jobs");
      });
  }

  useEffect(function() {
    fetchQuote();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 20, justifyContent: "center", boxSizing: "border-box" }}>
      <div style={{ fontSize: 18, fontStyle: "italic", textAlign: "center", color: "var(--text-h)" }}>
        "{quote}"
      </div>
      <div style={{ marginTop: 16, fontSize: 12, textAlign: "right", color: "var(--accent)" }}>
        — {author}
      </div>
      <button className="cbutn" style={{ marginTop: 24, alignSelf: "center", padding: "6px 12px" }} onClick={fetchQuote}>Refresh</button>
    </div>
  );
}
```

---

## 6. Mini Month Calendar

A dynamic grid showing the current month.

```jsx
import React, { useState } from "react";

export default function Component() {
  var [date, setDate] = useState(new Date());

  var year = date.getFullYear();
  var month = date.getMonth();
  
  var firstDay = new Date(year, month, 1).getDay();
  var daysInMonth = new Date(year, month + 1, 0).getDate();
  
  var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  var cells = [];
  for (var i = 0; i < firstDay; i++) { cells.push(null); }
  for (var d = 1; d <= daysInMonth; d++) { cells.push(d); }

  function prev() { setDate(new Date(year, month - 1, 1)); }
  function next() { setDate(new Date(year, month + 1, 1)); }

  var today = new Date();
  var isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <button className="cbutn" style={{ padding: "2px 8px" }} onClick={prev}>&lt;</button>
        <strong style={{ fontSize: 14 }}>{monthNames[month]} {year}</strong>
        <button className="cbutn" style={{ padding: "2px 8px" }} onClick={next}>&gt;</button>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, flex: 1 }}>
        {dayNames.map(function(dn) { return <div key={dn} style={{ fontSize: 10, textAlign: "center", color: "var(--accent)" }}>{dn}</div>; })}
        
        {cells.map(function(c, i) { 
          var isToday = isCurrentMonth && c === today.getDate();
          return (
            <div key={i} style={{ 
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
              background: isToday ? "var(--accent)" : c ? "rgba(255,255,255,0.05)" : "transparent",
              color: isToday ? "black" : "var(--text)",
              borderRadius: "6px 0", cornerShape: "bevel"
            }}>
              {c || ""}
            </div>
          ); 
        })}
      </div>
    </div>
  );
}
```

---

## 7. Random Password Generator

Generate secure passwords directly on your canvas.

```jsx
import React, { useState } from "react";

export default function Component() {
  var [pwd, setPwd] = useState("Click Generate");
  var [len, setLen] = useState(16);

  function generate() {
    var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    var result = "";
    for (var i = 0; i < len; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPwd(result);
  }

  function copy() {
    navigator.clipboard.writeText(pwd);
    var old = pwd;
    setPwd("Copied!");
    setTimeout(function() { setPwd(old); }, 1000);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 16, gap: 16, justifyContent: "center", boxSizing: "border-box" }}>
      <div 
        className="textp" 
        style={{ fontSize: 18, wordBreak: "break-all", background: "rgba(0,0,0,0.3)", padding: 12, cursor: "pointer" }}
        onClick={copy}
      >
        {pwd}
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12 }}>Length: {len}</span>
        <input 
          type="range" 
          min="8" max="32" 
          value={len} 
          onChange={function(e){setLen(parseInt(e.target.value))}} 
          style={{ flex: 1, accentColor: "var(--accent)" }}
        />
      </div>

      <button className="cbutn" style={{ padding: 12 }} onClick={generate}>Generate Password</button>
    </div>
  );
}
```

---

## 8. Expense Tracker

Keep track of your spending securely in local storage.

```jsx
import React, { useState, useEffect } from "react";

var KEY = "hc_expenses";

export default function Component() {
  var [expenses, setExpenses] = useState([]);
  var [name, setName] = useState("");
  var [amt, setAmt] = useState("");
  var [loaded, setLoaded] = useState(false);

  useEffect(function() {
    window.__hc.storage.get(KEY, function(val) {
      if (Array.isArray(val)) setExpenses(val);
      setLoaded(true);
    });
  }, []);

  useEffect(function() {
    if (!loaded) return;
    window.__hc.storage.set(KEY, expenses);
  }, [expenses, loaded]);

  function add() {
    if (!name.trim() || !amt.trim() || isNaN(amt)) return;
    setExpenses(function(e) { return [{ id: Date.now(), name: name, amt: parseFloat(amt) }].concat(e); });
    setName("");
    setAmt("");
  }

  function remove(id) {
    setExpenses(function(e) { return e.filter(function(x) { return x.id !== id; }); });
  }

  var total = expenses.reduce(function(acc, curr) { return acc + curr.amt; }, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 8, boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong style={{ fontSize: 13 }}>Expenses</strong>
        <span style={{ color: "var(--accent)", fontWeight: "bold" }}>Total: ${total.toFixed(2)}</span>
      </div>

      <div style={{ display: "flex", gap: 4 }}>
        <input className="nr-text-input" style={{ flex: 2 }} placeholder="Item" value={name} onChange={function(e){setName(e.target.value)}} />
        <input className="nr-text-input" style={{ flex: 1 }} placeholder="$" value={amt} onChange={function(e){setAmt(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter") add()}} />
        <button className="cbutn" onClick={add}>+</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
        {expenses.map(function(ex) { return (
          <div key={ex.id} style={{ display: "flex", justifyContent: "space-between", background: "rgba(0,0,0,0.2)", padding: "6px 8px", borderRadius: "8px 0", cornerShape: "bevel" }}>
            <span style={{ fontSize: 12 }}>{ex.name}</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: "bold" }}>${ex.amt.toFixed(2)}</span>
              <span style={{ cursor: "pointer", color: "#dc3c3c", fontSize: 14 }} onClick={function(){remove(ex.id)}}>×</span>
            </div>
          </div>
        ); })}
      </div>
    </div>
  );
}
```

---

## 9. Word of the Day (Dictionary)

Learn a new word by looking it up via the Free Dictionary API.

```jsx
import React, { useState } from "react";

export default function Component() {
  var [word, setWord] = useState("");
  var [def, setDef] = useState(null);
  var [loading, setLoading] = useState(false);

  function search() {
    if (!word.trim()) return;
    setLoading(true);
    setDef(null);
    fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + word.trim())
      .then(function(res) { return res.json(); })
      .then(function(data) {
        setLoading(false);
        if (data.title) {
          setDef({ error: "Word not found." });
        } else {
          var meaning = data[0].meanings[0];
          setDef({
            phonetic: data[0].phonetic,
            partOfSpeech: meaning.partOfSpeech,
            definition: meaning.definitions[0].definition
          });
        }
      })
      .catch(function(err) { setLoading(false); setDef({ error: "Network error." }); });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 12, boxSizing: "border-box" }}>
      <strong style={{ fontSize: 13 }}>Dictionary</strong>
      
      <div style={{ display: "flex", gap: 4 }}>
        <input 
          className="nr-text-input" 
          style={{ flex: 1 }} 
          placeholder="Lookup word..." 
          value={word} 
          onChange={function(e){setWord(e.target.value)}} 
          onKeyDown={function(e){if(e.key==="Enter") search()}} 
        />
        <button className="cbutn" onClick={search}>🔍</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 8, background: "rgba(0,0,0,0.15)", borderRadius: "12px 0", cornerShape: "bevel" }}>
        {loading && <div style={{ fontSize: 12, textAlign: "center", color: "var(--text)" }}>Searching...</div>}
        {def && def.error && <div style={{ fontSize: 12, color: "#dc3c3c" }}>{def.error}</div>}
        {def && !def.error && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 16, fontWeight: "bold", color: "var(--accent)" }}>{word}</div>
            {def.phonetic && <div style={{ fontSize: 11, fontStyle: "italic", opacity: 0.7 }}>{def.phonetic}</div>}
            <div style={{ fontSize: 10, background: "var(--accent-bg)", color: "var(--accent)", padding: "2px 4px", borderRadius: 4, width: "fit-content", marginTop: 4 }}>{def.partOfSpeech}</div>
            <div style={{ fontSize: 12, marginTop: 4, lineHeight: 1.4 }}>{def.definition}</div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 10. Stop Watch

A high precision stopwatch.

```jsx
import React, { useState, useEffect } from "react";

export default function Component() {
  var [time, setTime] = useState(0);
  var [running, setRunning] = useState(false);

  useEffect(function() {
    var timer;
    if (running) {
      timer = setInterval(function() {
        setTime(function(prev) { return prev + 10; });
      }, 10);
    }
    return function() { clearInterval(timer); };
  }, [running]);

  var ms = ("0" + ((time / 10) % 100)).slice(-2);
  var s = ("0" + Math.floor((time / 1000) % 60)).slice(-2);
  var m = ("0" + Math.floor((time / 60000) % 60)).slice(-2);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, justifyContent: "center", gap: 20, boxSizing: "border-box" }}>
      <div className="textp" style={{ fontSize: 40, letterSpacing: 2 }}>
        {m}:{s}<span style={{ fontSize: 20, color: "var(--accent)", marginLeft: 4 }}>{ms}</span>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
        <button className="cbutn" style={{ width: 80, padding: 8 }} onClick={function(){setRunning(!running)}}>{running ? "Pause" : "Start"}</button>
        <button className="cbutn" style={{ width: 80, padding: 8, background: "rgba(220,60,60,0.2)", color: "#dc3c3c" }} onClick={function(){setRunning(false); setTime(0);}}>Reset</button>
      </div>
    </div>
  );
}
```

---

## 11. BMI Calculator

Calculate your Body Mass Index (metric).

```jsx
import React, { useState } from "react";

export default function Component() {
  var [w, setW] = useState("");
  var [h, setH] = useState("");
  var [bmi, setBmi] = useState(null);

  function calc() {
    var weight = parseFloat(w);
    var height = parseFloat(h) / 100;
    if (weight > 0 && height > 0) setBmi((weight / (height * height)).toFixed(1));
  }

  var status = "";
  if (bmi) {
    if (bmi < 18.5) status = "Underweight";
    else if (bmi < 24.9) status = "Normal weight";
    else if (bmi < 29.9) status = "Overweight";
    else status = "Obesity";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 12, boxSizing: "border-box" }}>
      <strong style={{ fontSize: 13 }}>BMI Calculator</strong>
      <div style={{ display: "flex", gap: 8 }}>
        <input className="nr-text-input" style={{ flex: 1 }} placeholder="Weight (kg)" value={w} onChange={function(e){setW(e.target.value)}} />
        <input className="nr-text-input" style={{ flex: 1 }} placeholder="Height (cm)" value={h} onChange={function(e){setH(e.target.value)}} />
      </div>
      <button className="cbutn" style={{ padding: 8 }} onClick={calc}>Calculate</button>
      
      {bmi && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 32, fontWeight: "bold", color: "var(--accent)" }}>{bmi}</div>
          <div style={{ fontSize: 14 }}>{status}</div>
        </div>
      )}
    </div>
  );
}
```

---

## 12. Random Joke Generator

Fetch a dad joke to lighten the mood.

```jsx
import React, { useState } from "react";

export default function Component() {
  var [setup, setSetup] = useState("Need a laugh?");
  var [punchline, setPunchline] = useState("");
  var [loading, setLoading] = useState(false);

  function fetchJoke() {
    setLoading(true);
    setPunchline("");
    fetch("https://official-joke-api.appspot.com/random_joke")
      .then(function(res) { return res.json(); })
      .then(function(data) {
        setSetup(data.setup);
        setPunchline(data.punchline);
        setLoading(false);
      })
      .catch(function() {
        setSetup("Failed to load joke.");
        setLoading(false);
      });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 16, justifyContent: "center", gap: 16, boxSizing: "border-box", textAlign: "center" }}>
      <div style={{ fontSize: 16, fontWeight: "bold" }}>{setup}</div>
      <div style={{ fontSize: 14, color: "var(--accent)", minHeight: 20 }}>{punchline}</div>
      <button className="cbutn" style={{ padding: 8, alignSelf: "center", marginTop: 12 }} onClick={fetchJoke}>
        {loading ? "..." : "Tell me a joke"}
      </button>
    </div>
  );
}
```

---

## 13. Tip Calculator

Quickly figure out the tip and total split.

```jsx
import React, { useState } from "react";

export default function Component() {
  var [bill, setBill] = useState("");
  var [tipPct, setTipPct] = useState("15");
  var [split, setSplit] = useState("1");

  var billAmt = parseFloat(bill) || 0;
  var pct = parseFloat(tipPct) || 0;
  var ppl = parseInt(split) || 1;

  var tipAmt = billAmt * (pct / 100);
  var total = billAmt + tipAmt;
  var perPerson = total / ppl;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 8, boxSizing: "border-box" }}>
      <strong style={{ fontSize: 13 }}>Tip Calculator</strong>
      
      <div style={{ display: "flex", gap: 8 }}>
        <input className="nr-text-input" style={{ flex: 2 }} placeholder="Bill Amt ($)" value={bill} onChange={function(e){setBill(e.target.value)}} />
        <input className="nr-text-input" style={{ flex: 1 }} placeholder="Tip %" value={tipPct} onChange={function(e){setTipPct(e.target.value)}} />
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12 }}>Split: {split}</span>
        <input type="range" min="1" max="10" value={split} onChange={function(e){setSplit(e.target.value)}} style={{ flex: 1, accentColor: "var(--accent)" }} />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 4, background: "rgba(0,0,0,0.2)", padding: 8, borderRadius: "12px 0", cornerShape: "bevel" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span>Tip:</span> <span>${tipAmt.toFixed(2)}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: "bold" }}><span>Total:</span> <span>${total.toFixed(2)}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--accent)" }}><span>Per Person:</span> <span>${perPerson.toFixed(2)}</span></div>
      </div>
    </div>
  );
}
```

---

## 14. Counter / Tally Tracker

Simple tally counter with local storage persistence.

```jsx
import React, { useState, useEffect } from "react";

var KEY = "hc_tally";

export default function Component() {
  var [count, setCount] = useState(0);
  var [loaded, setLoaded] = useState(false);

  useEffect(function() {
    window.__hc.storage.get(KEY, function(val) {
      if (typeof val === "number") setCount(val);
      setLoaded(true);
    });
  }, []);

  useEffect(function() {
    if (!loaded) return;
    window.__hc.storage.set(KEY, count);
  }, [count, loaded]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, justifyContent: "center", gap: 16, boxSizing: "border-box" }}>
      <div className="textp" style={{ fontSize: 64, fontWeight: "bold" }}>{count}</div>
      <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
        <button className="cbutn" style={{ fontSize: 24, width: 50, height: 50 }} onClick={function(){setCount(count - 1)}}>-</button>
        <button className="cbutn" style={{ fontSize: 24, width: 50, height: 50, background: "var(--accent)", color: "black" }} onClick={function(){setCount(count + 1)}}>+</button>
      </div>
      <button className="cbutn" style={{ alignSelf: "center", fontSize: 10, padding: 4 }} onClick={function(){setCount(0)}}>Reset</button>
    </div>
  );
}
```

---

## 15. Random Fact Generator

Learn something new every time you click.

```jsx
import React, { useState } from "react";

export default function Component() {
  var [fact, setFact] = useState("Ready for a random fact?");
  var [loading, setLoading] = useState(false);

  function fetchFact() {
    setLoading(true);
    fetch("https://uselessfacts.jsph.pl/api/v2/facts/random")
      .then(function(res) { return res.json(); })
      .then(function(data) {
        setFact(data.text);
        setLoading(false);
      })
      .catch(function() {
        setFact("Failed to load fact. Are you offline?");
        setLoading(false);
      });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 20, justifyContent: "center", gap: 16, boxSizing: "border-box", textAlign: "center" }}>
      <div style={{ fontSize: 14, fontStyle: "italic" }}>{fact}</div>
      <button className="cbutn" style={{ padding: 8, alignSelf: "center" }} onClick={fetchFact}>
        {loading ? "..." : "New Fact"}
      </button>
    </div>
  );
}
```

---

## 16. Water Intake Tracker

Track your 8 glasses of water a day.

```jsx
import React, { useState, useEffect } from "react";

var KEY = "hc_water";

export default function Component() {
  var [glasses, setGlasses] = useState(0);
  var [loaded, setLoaded] = useState(false);

  useEffect(function() {
    window.__hc.storage.get(KEY, function(val) {
      // Reset if it's a new day, else load
      var today = new Date().toDateString();
      if (val && val.date === today) {
        setGlasses(val.count);
      }
      setLoaded(true);
    });
  }, []);

  useEffect(function() {
    if (!loaded) return;
    window.__hc.storage.set(KEY, { count: glasses, date: new Date().toDateString() });
  }, [glasses, loaded]);

  var arr = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, justifyContent: "center", gap: 16, boxSizing: "border-box" }}>
      <strong style={{ fontSize: 13, textAlign: "center" }}>Daily Water (8 Glasses)</strong>
      
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
        {arr.map(function(num) {
          var active = num <= glasses;
          return (
            <div 
              key={num} 
              onClick={function(){ setGlasses(active ? num - 1 : num); }}
              style={{
                width: 30, height: 40, background: active ? "#3b82f6" : "var(--code-bg)",
                borderRadius: "0 0 15px 15px", cornerShape: "bevel",
                cursor: "pointer", transition: "background 0.2s"
              }}
            />
          );
        })}
      </div>
      <div style={{ textAlign: "center", fontSize: 12, color: "var(--accent)" }}>{glasses} / 8</div>
    </div>
  );
}
```

---

## 17. Digital Clock (With Seconds)

A sharp digital clock for exact time tracking.

```jsx
import React, { useState, useEffect } from "react";

export default function Component() {
  var [now, setNow] = useState(new Date());

  useEffect(function() {
    var id = setInterval(function() { setNow(new Date()); }, 1000);
    return function() { clearInterval(id); };
  }, []);

  var h = now.getHours().toString().padStart(2, "0");
  var m = now.getMinutes().toString().padStart(2, "0");
  var s = now.getSeconds().toString().padStart(2, "0");

  return (
    <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
      <div className="textp" style={{ fontSize: 48, fontWeight: "bold" }}>
        {h}:{m}<span style={{ fontSize: 24, color: "var(--accent)", marginLeft: 4 }}>{s}</span>
      </div>
    </div>
  );
}
```

---

## 18. Dice Roller

Roll standard D6, D10, or D20 dice for tabletop gamers.

```jsx
import React, { useState } from "react";

export default function Component() {
  var [result, setResult] = useState("Roll!");

  function roll(sides) {
    var val = Math.floor(Math.random() * sides) + 1;
    setResult("D" + sides + ": " + val);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, justifyContent: "center", gap: 16, boxSizing: "border-box" }}>
      <div className="textp" style={{ fontSize: 28, fontWeight: "bold", background: "rgba(0,0,0,0.2)" }}>{result}</div>
      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
        <button className="cbutn" style={{ padding: "8px 12px" }} onClick={function(){roll(6)}}>D6</button>
        <button className="cbutn" style={{ padding: "8px 12px" }} onClick={function(){roll(10)}}>D10</button>
        <button className="cbutn" style={{ padding: "8px 12px", background: "var(--accent)", color: "black" }} onClick={function(){roll(20)}}>D20</button>
      </div>
    </div>
  );
}
```

---

## 19. Coin Flipper

Simple 50/50 heads or tails decider.

```jsx
import React, { useState } from "react";

export default function Component() {
  var [face, setFace] = useState("?");
  var [flipping, setFlipping] = useState(false);

  function flip() {
    setFlipping(true);
    setFace("...");
    setTimeout(function() {
      setFace(Math.random() > 0.5 ? "HEADS" : "TAILS");
      setFlipping(false);
    }, 600);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, alignItems: "center", justifyContent: "center", gap: 16, boxSizing: "border-box" }}>
      <div 
        style={{ 
          width: 80, height: 80, borderRadius: "50%", background: "var(--accent)", color: "black",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: "bold",
          transition: "transform 0.6s", transform: flipping ? "rotateY(720deg)" : "rotateY(0deg)"
        }}
      >
        {face}
      </div>
      <button className="cbutn" style={{ padding: "8px 24px" }} onClick={flip} disabled={flipping}>FLIP</button>
    </div>
  );
}
```

---

## 20. Temperature Converter

Convert quickly between Celsius and Fahrenheit.

```jsx
import React, { useState } from "react";

export default function Component() {
  var [c, setC] = useState("");
  var [f, setF] = useState("");

  function updateC(val) {
    setC(val);
    if (val === "") return setF("");
    var cNum = parseFloat(val);
    setF(((cNum * 9/5) + 32).toFixed(1));
  }

  function updateF(val) {
    setF(val);
    if (val === "") return setC("");
    var fNum = parseFloat(val);
    setC(((fNum - 32) * 5/9).toFixed(1));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, justifyContent: "center", gap: 12, boxSizing: "border-box" }}>
      <strong style={{ fontSize: 13, textAlign: "center" }}>Temp Converter</strong>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input className="nr-text-input" style={{ flex: 1 }} value={c} onChange={function(e){updateC(e.target.value)}} />
        <span style={{ fontSize: 16 }}>°C</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input className="nr-text-input" style={{ flex: 1 }} value={f} onChange={function(e){updateF(e.target.value)}} />
        <span style={{ fontSize: 16 }}>°F</span>
      </div>
    </div>
  );
}
```

---

## 21. Base64 Encoder/Decoder

Useful developer tool right in your new tab.

```jsx
import React, { useState } from "react";

export default function Component() {
  var [input, setInput] = useState("");
  var [output, setOutput] = useState("");

  function encode() {
    try { setOutput(btoa(input)); } catch(e) { setOutput("Error Encoding"); }
  }

  function decode() {
    try { setOutput(atob(input)); } catch(e) { setOutput("Error Decoding"); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 8, boxSizing: "border-box" }}>
      <textarea className="nr-text-input" style={{ flex: 1, resize: "none" }} placeholder="Input text..." value={input} onChange={function(e){setInput(e.target.value)}} />
      <div style={{ display: "flex", gap: 8 }}>
        <button className="cbutn" style={{ flex: 1, padding: 6 }} onClick={encode}>Encode</button>
        <button className="cbutn" style={{ flex: 1, padding: 6 }} onClick={decode}>Decode</button>
      </div>
      <textarea className="nr-text-input" style={{ flex: 1, resize: "none", background: "rgba(0,0,0,0.2)" }} placeholder="Output..." value={output} readOnly />
    </div>
  );
}
```

---

## 22. URL Encoder/Decoder

Convert URL strings safely.

```jsx
import React, { useState } from "react";

export default function Component() {
  var [input, setInput] = useState("");
  var [output, setOutput] = useState("");

  function encode() { setOutput(encodeURIComponent(input)); }
  function decode() { setOutput(decodeURIComponent(input)); }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 8, boxSizing: "border-box" }}>
      <textarea className="nr-text-input" style={{ flex: 1, resize: "none" }} placeholder="URL string..." value={input} onChange={function(e){setInput(e.target.value)}} />
      <div style={{ display: "flex", gap: 8 }}>
        <button className="cbutn" style={{ flex: 1, padding: 6 }} onClick={encode}>Encode</button>
        <button className="cbutn" style={{ flex: 1, padding: 6 }} onClick={decode}>Decode</button>
      </div>
      <textarea className="nr-text-input" style={{ flex: 1, resize: "none", background: "rgba(0,0,0,0.2)" }} placeholder="Output..." value={output} readOnly />
    </div>
  );
}
```

---

## 23. Word & Character Counter

See exact text metrics in real-time.

```jsx
import React, { useState } from "react";

export default function Component() {
  var [text, setText] = useState("");

  var words = text.trim() ? text.trim().split(/\s+/).length : 0;
  var chars = text.length;
  var noSpaces = text.replace(/\s/g, "").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 8, boxSizing: "border-box" }}>
      <textarea className="nr-text-input" style={{ flex: 1, resize: "none", textAlign: "left" }} placeholder="Paste text here..." value={text} onChange={function(e){setText(e.target.value)}} />
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, background: "rgba(0,0,0,0.2)", padding: 8, borderRadius: "12px 0", cornerShape: "bevel" }}>
        <div style={{ fontSize: 11, textAlign: "center" }}>Words: <strong style={{ color: "var(--accent)" }}>{words}</strong></div>
        <div style={{ fontSize: 11, textAlign: "center" }}>Chars: <strong style={{ color: "var(--accent)" }}>{chars}</strong></div>
        <div style={{ fontSize: 11, textAlign: "center", gridColumn: "span 2" }}>No Spaces: <strong>{noSpaces}</strong></div>
      </div>
    </div>
  );
}
```

---

## 24. Keycode Event Tester

Press any key to see its JS Event Keycode.

```jsx
import React, { useState, useEffect } from "react";

export default function Component() {
  var [key, setKey] = useState("");
  var [code, setCode] = useState("");

  useEffect(function() {
    function handle(e) {
      setKey(e.key);
      setCode(e.keyCode);
    }
    window.addEventListener("keydown", handle);
    return function() { window.removeEventListener("keydown", handle); };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, alignItems: "center", justifyContent: "center", gap: 16, boxSizing: "border-box" }}>
      <strong style={{ fontSize: 13, opacity: 0.5 }}>Press Any Key</strong>
      
      {key ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div className="textp" style={{ fontSize: 48, color: "var(--accent)", padding: 8 }}>{code}</div>
          <div style={{ fontSize: 18, fontFamily: "monospace", background: "var(--code-bg)", padding: "4px 12px", borderRadius: 4 }}>{key === " " ? "Space" : key}</div>
        </div>
      ) : (
        <div style={{ fontSize: 24, color: "var(--accent)" }}>---</div>
      )}
    </div>
  );
}
```

---

## 25. Breathing Exercise Timer

A simple 4-7-8 breathing pacer.

```jsx
import React, { useState, useEffect } from "react";

export default function Component() {
  var [phase, setPhase] = useState("Ready");
  var [timer, setTimer] = useState(0);
  var [running, setRunning] = useState(false);

  useEffect(function() {
    var id;
    if (running) {
      if (timer === 0) {
        if (phase === "Ready" || phase === "Exhale") { setPhase("Inhale"); setTimer(4); }
        else if (phase === "Inhale") { setPhase("Hold"); setTimer(7); }
        else if (phase === "Hold") { setPhase("Exhale"); setTimer(8); }
      } else {
        id = setTimeout(function() { setTimer(timer - 1); }, 1000);
      }
    }
    return function() { clearTimeout(id); };
  }, [running, timer, phase]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, alignItems: "center", justifyContent: "center", gap: 16, boxSizing: "border-box" }}>
      <div 
        style={{ 
          width: 100, height: 100, borderRadius: "50%", background: phase === "Inhale" ? "var(--accent)" : phase === "Hold" ? "#a855f7" : phase === "Exhale" ? "#3b82f6" : "var(--code-bg)",
          display: "flex", alignItems: "center", justifyContent: "center", color: phase === "Ready" ? "var(--text)" : "black",
          transition: "all 1s ease-in-out", transform: phase === "Inhale" ? "scale(1.2)" : phase === "Exhale" ? "scale(0.8)" : "scale(1)"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <strong style={{ fontSize: 14 }}>{phase}</strong>
          {timer > 0 && <span style={{ fontSize: 24, fontWeight: "bold" }}>{timer}</span>}
        </div>
      </div>

      <button className="cbutn" style={{ padding: "8px 24px" }} onClick={function() { setRunning(!running); if(!running){setPhase("Ready"); setTimer(0);} }}>
        {running ? "Stop" : "Start"}
      </button>
    </div>
  );
}
```

---

## 26. RGB to Hex Converter

Quickly convert web colors.

```jsx
import React, { useState } from "react";

export default function Component() {
  var [r, setR] = useState(255);
  var [g, setG] = useState(255);
  var [b, setB] = useState(255);

  function toHex(c) {
    var hex = parseInt(c).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }

  var hexStr = "#" + toHex(r) + toHex(g) + toHex(b);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 12, boxSizing: "border-box" }}>
      <div style={{ flex: 1, background: hexStr, borderRadius: "12px 0", cornerShape: "bevel", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ background: "rgba(0,0,0,0.5)", color: "white", padding: "4px 8px", borderRadius: 4, letterSpacing: 1 }}>{hexStr.toUpperCase()}</span>
      </div>

      <div style={{ display: "flex", gap: 4 }}>
        <input type="number" min="0" max="255" className="nr-text-input" style={{ flex: 1 }} value={r} onChange={function(e){setR(e.target.value)}} />
        <input type="number" min="0" max="255" className="nr-text-input" style={{ flex: 1 }} value={g} onChange={function(e){setG(e.target.value)}} />
        <input type="number" min="0" max="255" className="nr-text-input" style={{ flex: 1 }} value={b} onChange={function(e){setB(e.target.value)}} />
      </div>
    </div>
  );
}
```

---

## 27. Number Fact Trivia

Type a number, get a trivia fact about it.

```jsx
import React, { useState } from "react";

export default function Component() {
  var [num, setNum] = useState("42");
  var [fact, setFact] = useState("");
  var [loading, setLoading] = useState(false);

  function fetchFact() {
    if (!num) return;
    setLoading(true);
    fetch("http://numbersapi.com/" + num)
      .then(function(res) { return res.text(); })
      .then(function(text) {
        setFact(text);
        setLoading(false);
      })
      .catch(function() {
        setFact("Could not load fact.");
        setLoading(false);
      });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 12, boxSizing: "border-box" }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input type="number" className="nr-text-input" style={{ flex: 1 }} value={num} onChange={function(e){setNum(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter") fetchFact()}} />
        <button className="cbutn" onClick={fetchFact}>Get Fact</button>
      </div>
      
      <div style={{ flex: 1, padding: 12, background: "rgba(0,0,0,0.2)", borderRadius: "12px 0", cornerShape: "bevel", fontSize: 13, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", fontStyle: "italic" }}>
        {loading ? "..." : fact || "Enter a number to learn something!"}
      </div>
    </div>
  );
}
```

---

## 28. GitHub User Profile

Enter a GitHub username to see their public stats.

```jsx
import React, { useState } from "react";

export default function Component() {
  var [username, setUsername] = useState("");
  var [data, setData] = useState(null);

  function search() {
    if (!username) return;
    fetch("https://api.github.com/users/" + username)
      .then(function(res) { return res.json(); })
      .then(function(json) { setData(json); })
      .catch(function() {});
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 12, boxSizing: "border-box" }}>
      <div style={{ display: "flex", gap: 4 }}>
        <input className="nr-text-input" style={{ flex: 1 }} placeholder="GitHub User..." value={username} onChange={function(e){setUsername(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter") search()}} />
        <button className="cbutn" onClick={search}>🔍</button>
      </div>

      {data && data.message ? (
        <div style={{ color: "#dc3c3c", fontSize: 12, textAlign: "center" }}>User not found.</div>
      ) : data ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <img src={data.avatar_url} style={{ width: 60, height: 60, borderRadius: "50%" }} />
          <strong style={{ fontSize: 14 }}>{data.name || data.login}</strong>
          <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
            <span style={{ color: "var(--accent)" }}>Repos: {data.public_repos}</span>
            <span style={{ color: "var(--accent)" }}>Followers: {data.followers}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
```

---

## 29. Percentage Calculator

Quickly calculate X% of Y.

```jsx
import React, { useState } from "react";

export default function Component() {
  var [pct, setPct] = useState("");
  var [num, setNum] = useState("");

  var result = (parseFloat(pct) / 100) * parseFloat(num);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, justifyContent: "center", gap: 12, boxSizing: "border-box" }}>
      <strong style={{ fontSize: 13, textAlign: "center" }}>% Calculator</strong>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input type="number" className="nr-text-input" style={{ flex: 1 }} placeholder="%" value={pct} onChange={function(e){setPct(e.target.value)}} />
        <span style={{ fontSize: 12 }}>% of</span>
        <input type="number" className="nr-text-input" style={{ flex: 1 }} placeholder="Num" value={num} onChange={function(e){setNum(e.target.value)}} />
      </div>
      
      <div className="textp" style={{ fontSize: 32, fontWeight: "bold", background: "rgba(0,0,0,0.2)" }}>
        {isNaN(result) ? "---" : result.toFixed(2).replace(".00", "")}
      </div>
    </div>
  );
}
```

---

## 30. Local Storage Inspector

See how many items are saved in your window.__hc.storage bridge.

```jsx
import React, { useState } from "react";

export default function Component() {
  var [keys, setKeys] = useState([]);

  function scan() {
    // Note: Since __hc bridge currently only supports exact key get/set, 
    // we can't iterate all keys natively unless the extension passes it.
    // So we'll just check common ones we created!
    var common = ["hc_todos", "hc_scratchpad", "hc_habits", "hc_expenses", "hc_tally", "hc_water"];
    var found = [];
    var checked = 0;

    common.forEach(function(k) {
      window.__hc.storage.get(k, function(val) {
        if (val !== undefined && val !== null) found.push(k);
        checked++;
        if (checked === common.length) setKeys(found);
      });
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 12, boxSizing: "border-box" }}>
      <button className="cbutn" style={{ padding: 8 }} onClick={scan}>Scan Storage</button>
      
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
        {keys.length === 0 && <div style={{ fontSize: 12, textAlign: "center", opacity: 0.5 }}>No known keys found. Click Scan.</div>}
        {keys.map(function(k) { return (
          <div key={k} style={{ padding: 6, background: "rgba(0,0,0,0.2)", borderRadius: "6px 0", cornerShape: "bevel", fontSize: 11, color: "var(--accent)" }}>
            {k}
          </div>
        ); })}
      </div>
    </div>
  );
}
```

---

## 31. Crypto Price Ticker

Live fetch of Bitcoin, Ethereum, and Dogecoin prices from CoinGecko.

```jsx
import React, { useState, useEffect } from "react";

export default function Component() {
  var [prices, setPrices] = useState(null);
  var [loading, setLoading] = useState(false);

  function fetchPrices() {
    setLoading(true);
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,dogecoin&vs_currencies=usd")
      .then(function(res) { return res.json(); })
      .then(function(data) {
        setPrices(data);
        setLoading(false);
      })
      .catch(function() { setLoading(false); });
  }

  useEffect(function() { fetchPrices(); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 12, boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong style={{ fontSize: 13 }}>Crypto Ticker</strong>
        <button className="cbutn" style={{ padding: "4px 8px", fontSize: 10 }} onClick={fetchPrices}>{loading ? "..." : "Refresh"}</button>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {prices ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(0,0,0,0.2)", padding: 8, borderRadius: "8px 0", cornerShape: "bevel" }}>
              <span style={{ fontWeight: "bold", color: "#f7931a" }}>BTC</span>
              <span>${prices.bitcoin.usd.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(0,0,0,0.2)", padding: 8, borderRadius: "8px 0", cornerShape: "bevel" }}>
              <span style={{ fontWeight: "bold", color: "#627eea" }}>ETH</span>
              <span>${prices.ethereum.usd.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(0,0,0,0.2)", padding: 8, borderRadius: "8px 0", cornerShape: "bevel" }}>
              <span style={{ fontWeight: "bold", color: "#c2a633" }}>DOGE</span>
              <span>${prices.dogecoin.usd.toLocaleString()}</span>
            </div>
          </>
        ) : (
          <div style={{ fontSize: 12, textAlign: "center", opacity: 0.5, marginTop: 20 }}>Loading data...</div>
        )}
      </div>
    </div>
  );
}
```

---

## 32. Random Dog Picture

Because everyone needs a dog picture on their dashboard.

```jsx
import React, { useState, useEffect } from "react";

export default function Component() {
  var [img, setImg] = useState("");
  var [loading, setLoading] = useState(false);

  function fetchDog() {
    setLoading(true);
    fetch("https://dog.ceo/api/breeds/image/random")
      .then(function(res) { return res.json(); })
      .then(function(data) {
        setImg(data.message);
        setLoading(false);
      })
      .catch(function() { setLoading(false); });
  }

  useEffect(function() { fetchDog(); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 8, gap: 8, boxSizing: "border-box" }}>
      <div style={{ flex: 1, borderRadius: "15px 0", cornerShape: "bevel", overflow: "hidden", background: "var(--code-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {loading ? <span style={{ fontSize: 12 }}>Loading...</span> : img ? <img src={img} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
      </div>
      <button className="cbutn" style={{ padding: 8 }} onClick={fetchDog}>New Dog</button>
    </div>
  );
}
```

---

## 33. Bored? Activity Suggester

Fetches a random activity from the Bored API.

```jsx
import React, { useState } from "react";

export default function Component() {
  var [activity, setActivity] = useState(null);
  var [loading, setLoading] = useState(false);

  function fetchActivity() {
    setLoading(true);
    fetch("https://www.boredapi.com/api/activity")
      .then(function(res) { return res.json(); })
      .then(function(data) {
        setActivity(data);
        setLoading(false);
      })
      .catch(function() {
        setActivity({ activity: "Go outside for a walk.", type: "relaxation" });
        setLoading(false);
      });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 16, justifyContent: "center", gap: 16, boxSizing: "border-box", textAlign: "center" }}>
      {activity ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: "bold" }}>{activity.activity}</div>
          <div style={{ fontSize: 10, color: "var(--accent)", textTransform: "uppercase" }}>{activity.type}</div>
        </div>
      ) : (
        <div style={{ fontSize: 14 }}>Bored?</div>
      )}
      <button className="cbutn" style={{ padding: 8, alignSelf: "center" }} onClick={fetchActivity}>
        {loading ? "..." : "Suggest Activity"}
      </button>
    </div>
  );
}
```

---

## 34. Public IP Viewer

Fetches your current public IP address via ipify.

```jsx
import React, { useState, useEffect } from "react";

export default function Component() {
  var [ip, setIp] = useState("Checking...");

  function fetchIp() {
    setIp("Checking...");
    fetch("https://api.ipify.org?format=json")
      .then(function(res) { return res.json(); })
      .then(function(data) { setIp(data.ip); })
      .catch(function() { setIp("Error"); });
  }

  useEffect(function() { fetchIp(); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, justifyContent: "center", alignItems: "center", gap: 12, boxSizing: "border-box" }}>
      <strong style={{ fontSize: 12, opacity: 0.6 }}>Your Public IP</strong>
      <div className="textp" style={{ fontSize: 24, fontWeight: "bold", background: "rgba(0,0,0,0.2)", padding: "12px 24px" }}>
        {ip}
      </div>
      <button className="cbutn" style={{ padding: "4px 12px", fontSize: 11 }} onClick={fetchIp}>Refresh</button>
    </div>
  );
}
```

---

## 35. Kanye Quote Generator

Inspirational quotes fetched from Kanye Rest.

```jsx
import React, { useState, useEffect } from "react";

export default function Component() {
  var [quote, setQuote] = useState("");
  var [loading, setLoading] = useState(false);

  function fetchKanye() {
    setLoading(true);
    fetch("https://api.kanye.rest")
      .then(function(res) { return res.json(); })
      .then(function(data) {
        setQuote(data.quote);
        setLoading(false);
      })
      .catch(function() { setLoading(false); });
  }

  useEffect(function() { fetchKanye(); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 20, justifyContent: "center", gap: 16, boxSizing: "border-box", textAlign: "center" }}>
      <div style={{ fontSize: 16, fontStyle: "italic", fontWeight: "500" }}>"{quote || "..."}"</div>
      <div style={{ fontSize: 12, color: "var(--accent)" }}>- Kanye West</div>
      <button className="cbutn" style={{ padding: "6px 12px", alignSelf: "center" }} onClick={fetchKanye}>
        {loading ? "..." : "Next"}
      </button>
    </div>
  );
}
```

---

## 36. Cat Facts

Everyone loves cat facts!

```jsx
import React, { useState, useEffect } from "react";

export default function Component() {
  var [fact, setFact] = useState("");
  var [loading, setLoading] = useState(false);

  function fetchCatFact() {
    setLoading(true);
    fetch("https://catfact.ninja/fact")
      .then(function(res) { return res.json(); })
      .then(function(data) {
        setFact(data.fact);
        setLoading(false);
      })
      .catch(function() { setLoading(false); });
  }

  useEffect(function() { fetchCatFact(); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 16, justifyContent: "center", gap: 12, boxSizing: "border-box", textAlign: "center" }}>
      <strong style={{ fontSize: 14, color: "var(--accent)" }}>🐈 Cat Fact</strong>
      <div style={{ fontSize: 13, flex: 1, display: "flex", alignItems: "center" }}>{fact || "..."}</div>
      <button className="cbutn" style={{ padding: 8, alignSelf: "center" }} onClick={fetchCatFact}>
        {loading ? "..." : "Another"}
      </button>
    </div>
  );
}
```

---

## 37. SpaceX Next Launch

Fetches data about the upcoming SpaceX rocket launch.

```jsx
import React, { useState, useEffect } from "react";

export default function Component() {
  var [launch, setLaunch] = useState(null);
  var [loading, setLoading] = useState(true);

  useEffect(function() {
    fetch("https://api.spacexdata.com/v4/launches/next")
      .then(function(res) { return res.json(); })
      .then(function(data) {
        setLaunch(data);
        setLoading(false);
      })
      .catch(function() { setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: 16, textAlign: "center" }}>Fetching SpaceX...</div>;
  if (!launch) return <div style={{ padding: 16, textAlign: "center", color: "#dc3c3c" }}>Error fetching data.</div>;

  var date = new Date(launch.date_utc).toLocaleDateString();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 12, boxSizing: "border-box" }}>
      <strong style={{ fontSize: 14, color: "var(--accent)" }}>🚀 Next SpaceX Launch</strong>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, background: "rgba(0,0,0,0.2)", padding: 8, borderRadius: "12px 0", cornerShape: "bevel" }}>
        <div style={{ fontSize: 14, fontWeight: "bold" }}>{launch.name}</div>
        <div style={{ fontSize: 12 }}>Flight: #{launch.flight_number}</div>
        <div style={{ fontSize: 12 }}>Date: {date}</div>
      </div>
      <button className="cbutn" style={{ padding: 8 }} onClick={function() { window.__hc.open(launch.links.webcast || "https://spacex.com") }}>Watch Webcast</button>
    </div>
  );
}
```

---

## 38. Nationalize Name API

Type a name and it predicts the nationality probabilities.

```jsx
import React, { useState } from "react";

export default function Component() {
  var [name, setName] = useState("");
  var [data, setData] = useState([]);
  var [loading, setLoading] = useState(false);

  function predict() {
    if (!name.trim()) return;
    setLoading(true);
    fetch("https://api.nationalize.io?name=" + name.trim())
      .then(function(res) { return res.json(); })
      .then(function(json) {
        setData(json.country || []);
        setLoading(false);
      })
      .catch(function() { setLoading(false); });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 12, boxSizing: "border-box" }}>
      <div style={{ display: "flex", gap: 4 }}>
        <input className="nr-text-input" style={{ flex: 1 }} placeholder="First Name" value={name} onChange={function(e){setName(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter") predict()}} />
        <button className="cbutn" onClick={predict}>{loading ? "..." : "Guess"}</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
        {data.length === 0 && !loading && <div style={{ fontSize: 12, textAlign: "center", opacity: 0.5 }}>Enter a name to predict nationality!</div>}
        {data.map(function(c, i) { return (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: 6, background: "rgba(0,0,0,0.2)", borderRadius: "6px 0", cornerShape: "bevel", fontSize: 12 }}>
            <span style={{ fontWeight: "bold" }}>{c.country_id}</span>
            <span style={{ color: "var(--accent)" }}>{(c.probability * 100).toFixed(1)}%</span>
          </div>
        ); })}
      </div>
    </div>
  );
}
```

---

## 39. Random User Profile Generator

Generates a completely fake user identity.

```jsx
import React, { useState, useEffect } from "react";

export default function Component() {
  var [user, setUser] = useState(null);
  var [loading, setLoading] = useState(false);

  function fetchUser() {
    setLoading(true);
    fetch("https://randomuser.me/api/")
      .then(function(res) { return res.json(); })
      .then(function(data) {
        setUser(data.results[0]);
        setLoading(false);
      })
      .catch(function() { setLoading(false); });
  }

  useEffect(function() { fetchUser(); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 12, boxSizing: "border-box" }}>
      {user ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" }}>
          <img src={user.picture.large} style={{ width: 64, height: 64, borderRadius: "50%", border: "2px solid var(--accent)" }} />
          <strong style={{ fontSize: 14 }}>{user.name.first} {user.name.last}</strong>
          <div style={{ fontSize: 11, opacity: 0.8 }}>{user.email}</div>
          <div style={{ fontSize: 11, color: "var(--accent)" }}>{user.location.city}, {user.location.country}</div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>Loading identity...</div>
      )}
      <button className="cbutn" style={{ padding: 8 }} onClick={fetchUser}>Generate New Identity</button>
    </div>
  );
}
```

---

## 40. Open-Meteo Local Weather

Asks for browser geolocation, then fetches your exact local temperature!

```jsx
import React, { useState, useEffect } from "react";

export default function Component() {
  var [temp, setTemp] = useState(null);
  var [code, setCode] = useState(0);
  var [status, setStatus] = useState("Locating...");

  function fetchWeather() {
    setTemp(null);
    if (!navigator.geolocation) {
      setStatus("Geolocation not supported.");
      return;
    }
    setStatus("Locating...");
    navigator.geolocation.getCurrentPosition(
      function(pos) {
        setStatus("Fetching weather...");
        var lat = pos.coords.latitude;
        var lon = pos.coords.longitude;
        fetch("https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&current_weather=true")
          .then(function(res) { return res.json(); })
          .then(function(data) {
            setTemp(data.current_weather.temperature);
            setCode(data.current_weather.weathercode);
            setStatus("");
          })
          .catch(function() { setStatus("Weather error"); });
      },
      function() { setStatus("Location denied."); }
    );
  }

  useEffect(function() { fetchWeather(); }, []);

  var emoji = "🌤️";
  if (code === 0) emoji = "☀️";
  else if (code >= 1 && code <= 3) emoji = "⛅";
  else if (code >= 51 && code <= 67) emoji = "🌧️";
  else if (code >= 71 && code <= 82) emoji = "❄️";
  else if (code >= 95) emoji = "⛈️";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 16, justifyContent: "center", alignItems: "center", gap: 12, boxSizing: "border-box" }}>
      <strong style={{ fontSize: 14, opacity: 0.7 }}>Local Weather</strong>
      {temp !== null ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 48 }}>{emoji}</span>
          <span className="textp" style={{ fontSize: 32, padding: "8px 16px" }}>{temp}°C</span>
        </div>
      ) : (
        <div style={{ fontSize: 12 }}>{status}</div>
      )}
      <button className="cbutn" style={{ padding: "4px 8px", fontSize: 10, marginTop: 8 }} onClick={fetchWeather}>Refresh Location</button>
    </div>
  );
}
```

---

## 41. Random Advice Slip

Need some wisdom? Ask the Advice API.

```jsx
import React, { useState, useEffect } from "react";

export default function Component() {
  var [advice, setAdvice] = useState("Loading...");

  function fetchAdvice() {
    setAdvice("...");
    fetch("https://api.adviceslip.com/advice?" + Math.random()) // cache buster
      .then(function(res) { return res.json(); })
      .then(function(data) { setAdvice(data.slip.advice); })
      .catch(function() { setAdvice("Failed to get advice."); });
  }

  useEffect(function() { fetchAdvice(); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 16, justifyContent: "center", gap: 16, boxSizing: "border-box", textAlign: "center" }}>
      <div style={{ fontSize: 16, fontWeight: "500", fontStyle: "italic" }}>"{advice}"</div>
      <button className="cbutn" style={{ padding: "6px 12px", alignSelf: "center" }} onClick={fetchAdvice}>New Advice</button>
    </div>
  );
}
```

---

## 42. Yes/No Decision Maker

Let the API decide your fate. With an animated GIF!

```jsx
import React, { useState } from "react";

export default function Component() {
  var [data, setData] = useState(null);
  var [loading, setLoading] = useState(false);

  function decide() {
    setLoading(true);
    fetch("https://yesno.wtf/api")
      .then(function(res) { return res.json(); })
      .then(function(json) {
        setData(json);
        setLoading(false);
      })
      .catch(function() { setLoading(false); });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 8, gap: 8, boxSizing: "border-box" }}>
      <div style={{ flex: 1, borderRadius: "15px 0", cornerShape: "bevel", overflow: "hidden", background: "var(--code-bg)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        {data && <img src={data.image} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }} />}
        {data && <div style={{ position: "absolute", fontSize: 48, fontWeight: "bold", textTransform: "uppercase", textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>{data.answer}</div>}
      </div>
      <button className="cbutn" style={{ padding: 12, fontSize: 14 }} onClick={decide}>{loading ? "Thinking..." : "Should I Do It?"}</button>
    </div>
  );
}
```

---

## 43. Genderize Name

Predicts gender based on a first name.

```jsx
import React, { useState } from "react";

export default function Component() {
  var [name, setName] = useState("");
  var [result, setResult] = useState(null);

  function predict() {
    if (!name.trim()) return;
    fetch("https://api.genderize.io?name=" + name.trim())
      .then(function(res) { return res.json(); })
      .then(function(json) { setResult(json); })
      .catch(function() {});
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 12, boxSizing: "border-box" }}>
      <strong style={{ fontSize: 13 }}>Gender Guesser</strong>
      <div style={{ display: "flex", gap: 4 }}>
        <input className="nr-text-input" style={{ flex: 1 }} placeholder="Enter a name" value={name} onChange={function(e){setName(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter") predict()}} />
        <button className="cbutn" onClick={predict}>Guess</button>
      </div>
      {result && result.gender && (
        <div style={{ background: "rgba(0,0,0,0.2)", padding: 12, borderRadius: "8px 0", cornerShape: "bevel", textAlign: "center" }}>
          <div style={{ fontSize: 18, textTransform: "capitalize", fontWeight: "bold" }}>{result.gender}</div>
          <div style={{ fontSize: 11, color: "var(--accent)" }}>Probability: {(result.probability * 100).toFixed(0)}%</div>
        </div>
      )}
    </div>
  );
}
```

---

## 44. Agify Name

Predicts age based on a first name.

```jsx
import React, { useState } from "react";

export default function Component() {
  var [name, setName] = useState("");
  var [result, setResult] = useState(null);

  function predict() {
    if (!name.trim()) return;
    fetch("https://api.agify.io?name=" + name.trim())
      .then(function(res) { return res.json(); })
      .then(function(json) { setResult(json); })
      .catch(function() {});
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 12, boxSizing: "border-box" }}>
      <strong style={{ fontSize: 13 }}>Age Guesser</strong>
      <div style={{ display: "flex", gap: 4 }}>
        <input className="nr-text-input" style={{ flex: 1 }} placeholder="Enter a name" value={name} onChange={function(e){setName(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter") predict()}} />
        <button className="cbutn" onClick={predict}>Guess</button>
      </div>
      {result && result.age && (
        <div style={{ background: "rgba(0,0,0,0.2)", padding: 12, borderRadius: "8px 0", cornerShape: "bevel", textAlign: "center" }}>
          <div style={{ fontSize: 11, opacity: 0.7 }}>Predicted Age</div>
          <div style={{ fontSize: 24, fontWeight: "bold", color: "var(--accent)" }}>{result.age} years old</div>
        </div>
      )}
    </div>
  );
}
```

---

## 45. Random Coffee Pictures

Need caffeine? Get a random coffee picture.

```jsx
import React, { useState, useEffect } from "react";

export default function Component() {
  var [img, setImg] = useState("");
  var [loading, setLoading] = useState(false);

  function fetchCoffee() {
    setLoading(true);
    fetch("https://coffee.alexflipnote.dev/random.json")
      .then(function(res) { return res.json(); })
      .then(function(data) {
        setImg(data.file);
        setLoading(false);
      })
      .catch(function() { setLoading(false); });
  }

  useEffect(function() { fetchCoffee(); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 8, gap: 8, boxSizing: "border-box" }}>
      <div style={{ flex: 1, borderRadius: "15px 0", cornerShape: "bevel", overflow: "hidden", background: "var(--code-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {loading ? <span style={{ fontSize: 12 }}>Brewing...</span> : img ? <img src={img} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
      </div>
      <button className="cbutn" style={{ padding: 8 }} onClick={fetchCoffee}>☕ Pour Another</button>
    </div>
  );
}
```

---

## 46. Random Fox Picture

Random foxes from randomfox.ca.

```jsx
import React, { useState, useEffect } from "react";

export default function Component() {
  var [img, setImg] = useState("");
  var [loading, setLoading] = useState(false);

  function fetchFox() {
    setLoading(true);
    fetch("https://randomfox.ca/floof/")
      .then(function(res) { return res.json(); })
      .then(function(data) {
        setImg(data.image);
        setLoading(false);
      })
      .catch(function() { setLoading(false); });
  }

  useEffect(function() { fetchFox(); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 8, gap: 8, boxSizing: "border-box" }}>
      <div style={{ flex: 1, borderRadius: "15px 0", cornerShape: "bevel", overflow: "hidden", background: "var(--code-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {loading ? <span style={{ fontSize: 12 }}>Sneaking...</span> : img ? <img src={img} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
      </div>
      <button className="cbutn" style={{ padding: 8 }} onClick={fetchFox}>🦊 New Fox</button>
    </div>
  );
}
```

---

## 47. Programming Jokes

Fetches single-line programming jokes from JokeAPI.

```jsx
import React, { useState, useEffect } from "react";

export default function Component() {
  var [joke, setJoke] = useState("Loading...");

  function fetchJoke() {
    setJoke("...");
    fetch("https://v2.jokeapi.dev/joke/Programming?type=single")
      .then(function(res) { return res.json(); })
      .then(function(data) { setJoke(data.joke); })
      .catch(function() { setJoke("Error."); });
  }

  useEffect(function() { fetchJoke(); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 16, justifyContent: "center", gap: 16, boxSizing: "border-box", textAlign: "center" }}>
      <strong style={{ fontSize: 12, color: "var(--accent)" }}>{`<Joke />`}</strong>
      <div style={{ fontSize: 14, fontWeight: "500", fontFamily: "monospace" }}>{joke}</div>
      <button className="cbutn" style={{ padding: "6px 12px", alignSelf: "center" }} onClick={fetchJoke}>Next()</button>
    </div>
  );
}
```

---

## 48. Current ISS Location

Where is the International Space Station right now?

```jsx
import React, { useState, useEffect } from "react";

export default function Component() {
  var [pos, setPos] = useState(null);

  function fetchISS() {
    setPos(null);
    fetch("http://api.open-notify.org/iss-now.json")
      .then(function(res) { return res.json(); })
      .then(function(data) { setPos(data.iss_position); })
      .catch(function() {});
  }

  useEffect(function() { fetchISS(); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 16, justifyContent: "center", alignItems: "center", gap: 12, boxSizing: "border-box" }}>
      <strong style={{ fontSize: 14, opacity: 0.7 }}>🛰️ ISS Location</strong>
      {pos ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "rgba(0,0,0,0.2)", padding: "12px 24px", borderRadius: "8px 0", cornerShape: "bevel", textAlign: "center" }}>
          <div><span style={{ fontSize: 11, opacity: 0.6 }}>LAT:</span> <span style={{ fontFamily: "monospace" }}>{pos.latitude}</span></div>
          <div><span style={{ fontSize: 11, opacity: 0.6 }}>LON:</span> <span style={{ fontFamily: "monospace" }}>{pos.longitude}</span></div>
        </div>
      ) : (
        <div style={{ fontSize: 12 }}>Scanning radar...</div>
      )}
      <button className="cbutn" style={{ padding: "4px 12px", fontSize: 11 }} onClick={fetchISS}>Ping Location</button>
    </div>
  );
}
```

---

## 49. Number Math Fact

Enter a number, get a weird math fact about it.

```jsx
import React, { useState } from "react";

export default function Component() {
  var [num, setNum] = useState("");
  var [fact, setFact] = useState("Enter a number above.");

  function fetchFact() {
    if (!num) return;
    setFact("...");
    fetch("http://numbersapi.com/" + num + "/math?json")
      .then(function(res) { return res.json(); })
      .then(function(data) { setFact(data.text); })
      .catch(function() { setFact("Error getting fact."); });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 12, boxSizing: "border-box" }}>
      <div style={{ display: "flex", gap: 4 }}>
        <input type="number" className="nr-text-input" style={{ flex: 1 }} placeholder="#" value={num} onChange={function(e){setNum(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter") fetchFact()}} />
        <button className="cbutn" onClick={fetchFact}>Fact</button>
      </div>
      <div style={{ flex: 1, padding: 8, background: "rgba(0,0,0,0.2)", borderRadius: "8px 0", cornerShape: "bevel", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        {fact}
      </div>
    </div>
  );
}
```

---

## 50. Random Meal Recipe

Fetches a random cooking recipe from TheMealDB.

```jsx
import React, { useState, useEffect } from "react";

export default function Component() {
  var [meal, setMeal] = useState(null);

  function fetchMeal() {
    setMeal(null);
    fetch("https://www.themealdb.com/api/json/v1/1/random.php")
      .then(function(res) { return res.json(); })
      .then(function(data) { setMeal(data.meals[0]); })
      .catch(function() {});
  }

  useEffect(function() { fetchMeal(); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 12, boxSizing: "border-box" }}>
      {meal ? (
        <>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <img src={meal.strMealThumb} style={{ width: 60, height: 60, borderRadius: "8px 0", cornerShape: "bevel" }} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <strong style={{ fontSize: 14 }}>{meal.strMeal}</strong>
              <span style={{ fontSize: 11, color: "var(--accent)" }}>{meal.strArea} • {meal.strCategory}</span>
            </div>
          </div>
          <button className="cbutn" style={{ padding: "8px" }} onClick={function(){ window.__hc.open(meal.strSource || meal.strYoutube) }}>View Recipe</button>
        </>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>Loading menu...</div>
      )}
      <button className="cbutn" style={{ padding: "4px 8px", fontSize: 10, alignSelf: "center", opacity: 0.7 }} onClick={fetchMeal}>Reroll</button>
    </div>
  );
}
```

---

## 51. Random Cocktail Recipe

What to drink tonight? Let TheCocktailDB decide.

```jsx
import React, { useState, useEffect } from "react";

export default function Component() {
  var [drink, setDrink] = useState(null);

  function fetchDrink() {
    setDrink(null);
    fetch("https://www.thecocktaildb.com/api/json/v1/1/random.php")
      .then(function(res) { return res.json(); })
      .then(function(data) { setDrink(data.drinks[0]); })
      .catch(function() {});
  }

  useEffect(function() { fetchDrink(); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 12, boxSizing: "border-box" }}>
      {drink ? (
        <div style={{ display: "flex", gap: 12, alignItems: "center", flex: 1 }}>
          <img src={drink.strDrinkThumb} style={{ width: 60, height: 60, borderRadius: "8px 0", cornerShape: "bevel" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <strong style={{ fontSize: 14 }}>{drink.strDrink}</strong>
            <span style={{ fontSize: 11, color: "var(--accent)" }}>{drink.strAlcoholic}</span>
            <span style={{ fontSize: 11, opacity: 0.6 }}>Glass: {drink.strGlass}</span>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>Mixing...</div>
      )}
      <button className="cbutn" onClick={fetchDrink}>Mix Another 🍸</button>
    </div>
  );
}
```

---

## 52. Pokémon Sprite Fetcher

Enter a Pokémon name to get its game sprite.

```jsx
import React, { useState } from "react";

export default function Component() {
  var [name, setName] = useState("pikachu");
  var [sprite, setSprite] = useState("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png");

  function fetchPoke() {
    if (!name.trim()) return;
    setSprite("");
    fetch("https://pokeapi.co/api/v2/pokemon/" + name.trim().toLowerCase())
      .then(function(res) { return res.json(); })
      .then(function(data) { setSprite(data.sprites.front_default); })
      .catch(function() { setSprite(null); });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 12, boxSizing: "border-box" }}>
      <div style={{ display: "flex", gap: 4 }}>
        <input className="nr-text-input" style={{ flex: 1 }} placeholder="Pokemon Name" value={name} onChange={function(e){setName(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter") fetchPoke()}} />
        <button className="cbutn" onClick={fetchPoke}>Catch</button>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.2)", borderRadius: "8px 0", cornerShape: "bevel" }}>
        {sprite === "" ? <span>...</span> : sprite ? <img src={sprite} style={{ width: 96, height: 96, imageRendering: "pixelated" }} /> : <span style={{ color: "red", fontSize: 12 }}>Not found</span>}
      </div>
    </div>
  );
}
```

---

## 53. Star Wars Character Lookup

Fetches random Star Wars characters.

```jsx
import React, { useState, useEffect } from "react";

export default function Component() {
  var [char, setChar] = useState(null);

  function fetchChar() {
    setChar(null);
    var id = Math.floor(Math.random() * 82) + 1; // 82 characters
    fetch("https://swapi.dev/api/people/" + id + "/")
      .then(function(res) { return res.json(); })
      .then(function(data) { setChar(data); })
      .catch(function() { fetchChar(); }); // retry on 404
  }

  useEffect(function() { fetchChar(); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 16, justifyContent: "center", gap: 12, boxSizing: "border-box", textAlign: "center" }}>
      <strong style={{ fontSize: 14, color: "#ffe81f" }}>STAR WARS</strong>
      {char ? (
        <div style={{ background: "rgba(0,0,0,0.3)", padding: 12, borderRadius: "8px 0", cornerShape: "bevel" }}>
          <div style={{ fontSize: 18, fontWeight: "bold" }}>{char.name}</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Birth Year: {char.birth_year}</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Height: {char.height}cm</div>
        </div>
      ) : (
        <div style={{ fontSize: 12, padding: 12 }}>Jumping to hyperspace...</div>
      )}
      <button className="cbutn" style={{ padding: 8, alignSelf: "center" }} onClick={fetchChar}>Randomize</button>
    </div>
  );
}
```

---

## 54. Rick & Morty Characters

Random characters from Rick and Morty.

```jsx
import React, { useState, useEffect } from "react";

export default function Component() {
  var [char, setChar] = useState(null);

  function fetchChar() {
    setChar(null);
    var id = Math.floor(Math.random() * 826) + 1;
    fetch("https://rickandmortyapi.com/api/character/" + id)
      .then(function(res) { return res.json(); })
      .then(function(data) { setChar(data); })
      .catch(function() {});
  }

  useEffect(function() { fetchChar(); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 12, boxSizing: "border-box" }}>
      {char ? (
        <div style={{ display: "flex", gap: 12, alignItems: "center", flex: 1 }}>
          <img src={char.image} style={{ width: 64, height: 64, borderRadius: "8px 0", cornerShape: "bevel" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <strong style={{ fontSize: 14 }}>{char.name}</strong>
            <span style={{ fontSize: 11, color: char.status === "Alive" ? "#55cc55" : "#cc5555" }}>{char.status} - {char.species}</span>
            <span style={{ fontSize: 11, opacity: 0.6 }}>{char.location.name}</span>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>Opening portal...</div>
      )}
      <button className="cbutn" onClick={fetchChar}>Get Schwifty</button>
    </div>
  );
}
```

---

## 55. Currency Exchange Rates (Base USD)

Live fetch of Euro, GBP, and JPY against the USD.

```jsx
import React, { useState, useEffect } from "react";

export default function Component() {
  var [rates, setRates] = useState(null);

  function fetchRates() {
    setRates(null);
    fetch("https://open.er-api.com/v6/latest/USD")
      .then(function(res) { return res.json(); })
      .then(function(data) { setRates(data.rates); })
      .catch(function() {});
  }

  useEffect(function() { fetchRates(); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 12, boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong style={{ fontSize: 13 }}>$1 USD Equals:</strong>
        <button className="cbutn" style={{ padding: "4px 8px", fontSize: 10 }} onClick={fetchRates}>🔄</button>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {rates ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(0,0,0,0.2)", padding: 8, borderRadius: "8px 0", cornerShape: "bevel" }}>
              <span style={{ fontWeight: "bold" }}>EUR 💶</span>
              <span>€{rates.EUR.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(0,0,0,0.2)", padding: 8, borderRadius: "8px 0", cornerShape: "bevel" }}>
              <span style={{ fontWeight: "bold" }}>GBP 💷</span>
              <span>£{rates.GBP.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(0,0,0,0.2)", padding: 8, borderRadius: "8px 0", cornerShape: "bevel" }}>
              <span style={{ fontWeight: "bold" }}>JPY 💴</span>
              <span>¥{rates.JPY.toFixed(2)}</span>
            </div>
          </>
        ) : (
          <div style={{ fontSize: 12, textAlign: "center", opacity: 0.5, marginTop: 20 }}>Fetching market data...</div>
        )}
      </div>
    </div>
  );
}
```

---

## 56. Anime Waifu Generator

Fetches random SFW anime pictures from waifu.pics.

```jsx
import React, { useState, useEffect } from "react";

export default function Component() {
  var [img, setImg] = useState("");
  var [loading, setLoading] = useState(false);

  function fetchImg() {
    setLoading(true);
    fetch("https://api.waifu.pics/sfw/waifu")
      .then(function(res) { return res.json(); })
      .then(function(data) {
        setImg(data.url);
        setLoading(false);
      })
      .catch(function() { setLoading(false); });
  }

  useEffect(function() { fetchImg(); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 8, gap: 8, boxSizing: "border-box" }}>
      <div style={{ flex: 1, borderRadius: "15px 0", cornerShape: "bevel", overflow: "hidden", background: "var(--code-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {loading ? <span style={{ fontSize: 12 }}>Loading...</span> : img ? <img src={img} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
      </div>
      <button className="cbutn" style={{ padding: 8 }} onClick={fetchImg}>Next Waifu</button>
    </div>
  );
}
```

---

## 57. Random Duck Picture

More animals! Quack.

```jsx
import React, { useState, useEffect } from "react";

export default function Component() {
  var [img, setImg] = useState("");
  var [loading, setLoading] = useState(false);

  function fetchDuck() {
    setLoading(true);
    fetch("https://random-d.uk/api/v2/random")
      .then(function(res) { return res.json(); })
      .then(function(data) {
        setImg(data.url);
        setLoading(false);
      })
      .catch(function() { setLoading(false); });
  }

  useEffect(function() { fetchDuck(); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 8, gap: 8, boxSizing: "border-box" }}>
      <div style={{ flex: 1, borderRadius: "15px 0", cornerShape: "bevel", overflow: "hidden", background: "var(--code-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {loading ? <span style={{ fontSize: 12 }}>Quack...</span> : img ? <img src={img} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
      </div>
      <button className="cbutn" style={{ padding: 8 }} onClick={fetchDuck}>🦆 New Duck</button>
    </div>
  );
}
```

---

## 58. RoboHash Avatar Generator

Type anything to deterministically generate a robot avatar.

```jsx
import React, { useState } from "react";

export default function Component() {
  var [text, setText] = useState("infinite-canvas");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 12, boxSizing: "border-box", alignItems: "center" }}>
      <input className="nr-text-input" style={{ width: "100%" }} placeholder="Type to generate..." value={text} onChange={function(e){setText(e.target.value)}} />
      
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img 
          src={"https://robohash.org/" + encodeURIComponent(text || "empty") + "?set=set1"} 
          style={{ width: 100, height: 100, background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} 
        />
      </div>
      <div style={{ fontSize: 11, opacity: 0.6 }}>RoboHash API</div>
    </div>
  );
}
```

---

## 59. Chuck Norris Facts

Tough jokes.

```jsx
import React, { useState, useEffect } from "react";

export default function Component() {
  var [joke, setJoke] = useState("...");

  function fetchJoke() {
    setJoke("...");
    fetch("https://api.chucknorris.io/jokes/random")
      .then(function(res) { return res.json(); })
      .then(function(data) { setJoke(data.value); })
      .catch(function() {});
  }

  useEffect(function() { fetchJoke(); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 16, justifyContent: "center", gap: 16, boxSizing: "border-box", textAlign: "center" }}>
      <strong style={{ fontSize: 16, color: "#d25a22" }}>🤠 Chuck Norris</strong>
      <div style={{ fontSize: 13, flex: 1, display: "flex", alignItems: "center", fontWeight: "500" }}>"{joke}"</div>
      <button className="cbutn" style={{ padding: "6px 12px", alignSelf: "center" }} onClick={fetchJoke}>Next Fact</button>
    </div>
  );
}
```

---

## 60. GitHub User Repositories Lookup

Fetch a GitHub user's top public repos.

```jsx
import React, { useState } from "react";

export default function Component() {
  var [user, setUser] = useState("facebook");
  var [repos, setRepos] = useState([]);
  var [loading, setLoading] = useState(false);

  function fetchRepos() {
    if (!user.trim()) return;
    setLoading(true);
    fetch("https://api.github.com/users/" + user.trim() + "/repos?sort=updated&per_page=4")
      .then(function(res) { return res.json(); })
      .then(function(data) {
        setRepos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(function() { setLoading(false); });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 12, boxSizing: "border-box" }}>
      <div style={{ display: "flex", gap: 4 }}>
        <input className="nr-text-input" style={{ flex: 1 }} placeholder="GitHub Username" value={user} onChange={function(e){setUser(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter") fetchRepos()}} />
        <button className="cbutn" onClick={fetchRepos}>Search</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
        {loading && <div style={{ textAlign: "center", fontSize: 12 }}>Loading repos...</div>}
        {!loading && repos.length === 0 && <div style={{ textAlign: "center", fontSize: 12, opacity: 0.5 }}>No repos found</div>}
        {repos.map(function(r) { return (
          <div key={r.id} style={{ display: "flex", flexDirection: "column", padding: 8, background: "rgba(0,0,0,0.2)", borderRadius: "8px 0", cornerShape: "bevel" }}>
            <span style={{ fontWeight: "bold", fontSize: 12, color: "var(--accent)", cursor: "pointer" }} onClick={function(){window.__hc.open(r.html_url)}}>{r.name}</span>
            <span style={{ fontSize: 10, opacity: 0.7 }}>⭐ {r.stargazers_count} | 🍴 {r.forks_count}</span>
          </div>
        ); })}
      </div>
    </div>
  );
}
```

---

*(More components can be added as needed. Remember to always use the ES5 `function()` syntax and rely on standard React hooks and the `window.__hc.storage` bridge!)*
