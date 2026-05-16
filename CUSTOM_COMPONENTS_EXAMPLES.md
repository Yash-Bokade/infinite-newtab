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

*(More components can be added as needed. Remember to always use the ES5 `function()` syntax and rely on standard React hooks and the `window.__hc.storage` bridge!)*
