import { useState, useEffect, useCallback, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Plus, Minus, X, Check, Trash2, RefreshCw, Edit3, Save, Camera } from "lucide-react";

const STORAGE_KEY = "recalibrate-data";

const QUOTES = [
  { text: "The happiness of your life depends upon the quality of your thoughts.", author: "Marcus Aurelius" },
  { text: "We suffer more often in imagination than in reality.", author: "Seneca" },
  { text: "No man is free who is not master of himself.", author: "Epictetus" },
  { text: "The soul becomes dyed with the colour of its thoughts.", author: "Marcus Aurelius" },
  { text: "It is not that we have a short time to live, but that we waste a great deal of it.", author: "Seneca" },
  { text: "Man is nothing else but what he makes of himself.", author: "Jean-Paul Sartre" },
  { text: "The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion.", author: "Albert Camus" },
  { text: "When we are no longer able to change a situation, we are challenged to change ourselves.", author: "Viktor Frankl" },
  { text: "He who has a why to live can bear almost any how.", author: "Nietzsche" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.", author: "Thich Nhat Hanh" },
  { text: "The only thing that is ultimately real about your journey is the step that you are taking at this moment.", author: "Alan Watts" },
  { text: "Pain is inevitable. Suffering is optional.", author: "Haruki Murakami" },
  { text: "Between stimulus and response there is a space. In that space is our freedom and our power to choose our response.", author: "Viktor Frankl" },
  { text: "You could leave life right now. Let that determine what you do and say and think.", author: "Marcus Aurelius" },
  { text: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius" },
  { text: "Muddy water is best cleared by leaving it alone.", author: "Alan Watts" },
  { text: "To be nobody but yourself in a world which is doing its best to make you everybody else means to fight the hardest battle any human being can fight.", author: "E.E. Cummings" },
  { text: "The mystery of human existence lies not in just staying alive, but in finding something to live for.", author: "Dostoevsky" },
  { text: "Man is condemned to be free; because once thrown into the world, he is responsible for everything he does.", author: "Jean-Paul Sartre" },
  { text: "Drink your tea slowly and reverently, as if it is the axis on which the world earth revolves.", author: "Thich Nhat Hanh" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "The desire for more positive experience is itself a negative experience. Accepting negative experience is itself a positive experience.", author: "Mark Manson" },
  { text: "What we achieve inwardly will change outer reality.", author: "Plutarch" },
  { text: "People do not decide their futures. They decide their habits and their habits decide their futures.", author: "F.M. Alexander" },
  { text: "Until you make the unconscious conscious, it will direct your life and you will call it fate.", author: "Carl Jung" },
  { text: "One must imagine Sisyphus happy.", author: "Albert Camus" },
  { text: "The privilege of a lifetime is to become who you truly are.", author: "Carl Jung" },
  { text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.", author: "Buddha" },
  { text: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius" },
  { text: "A man who procrastinates in his choosing will inevitably have his choice made for him by circumstance.", author: "Hunter S. Thompson" },
  { text: "Life shrinks or expands in proportion to one's courage.", author: "Anaïs Nin" },
  { text: "The wound is the place where the Light enters you.", author: "Rumi" },
  { text: "Freedom is what we do with what is done to us.", author: "Jean-Paul Sartre" },
  { text: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle" },
  { text: "What a man needs is not a tensionless state but the striving and struggling for a worthwhile goal.", author: "Viktor Frankl" },
  { text: "The more you try to control it, the more it controls you.", author: "Alan Watts" },
  { text: "At the centre of your being you have the answer; you know who you are and you know what you want.", author: "Lao Tzu" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "Real generosity toward the future lies in giving all to the present.", author: "Albert Camus" },
  { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
  { text: "If you are depressed you are living in the past. If you are anxious you are living in the future. If you are at peace you are living in the present.", author: "Lao Tzu" },
  { text: "Silence is the sleep that nourishes wisdom.", author: "Francis Bacon" },
  { text: "The best time to plant a tree was twenty years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "To live is the rarest thing in the world. Most people exist, that is all.", author: "Oscar Wilde" },
  { text: "Your task is not to seek for love, but merely to seek and find all the barriers within yourself that you have built against it.", author: "Rumi" },
  { text: "The things you own end up owning you.", author: "Chuck Palahniuk" },
  { text: "Almost everything will work again if you unplug it for a few minutes. Including you.", author: "Anne Lamott" },
  { text: "Be patient toward all that is unsolved in your heart and try to love the questions themselves.", author: "Rainer Maria Rilke" },
];

const HABITS = [
  { key: "coldHeat", label: "Cold / Heat", icon: "🧊", placeholder: "Cold plunge? Sauna? How'd it feel?" },
  { key: "meditation", label: "Meditation", icon: "🧘", placeholder: "What came up? Mental state..." },
  { key: "exercise", label: "Exercise", icon: "💪", placeholder: "What'd you do? Energy, mood..." },
];

const IMPULSES = [
  { key: "boredom", label: "Boredom Escape", sub: "The itch to scroll, numb, check out, escape into knowledge", color: "#f87171" },
  { key: "sexual", label: "Sexualized Thought", sub: "Caught it — logged it", color: "#c084fc" },
];

const localDateStr = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const today = () => localDateStr();
const timeNow = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const emptyDay = () => ({
  impulses: { boredom: [], sexual: [] },
  habits: { coldHeat: [], meditation: [], exercise: [] },
  felt: [],
});
const daysBetween = (a, b) => Math.floor((new Date(b) - new Date(a)) / 86400000);
const getDateRange = (days) => {
  const d = [];
  for (let i = days - 1; i >= 0; i--) {
    const dt = new Date();
    dt.setDate(dt.getDate() - i);
    d.push(localDateStr(dt));
  }
  return d;
};
const getDailyQuote = (ds) => QUOTES[parseInt(ds.split("-").join(""), 10) % QUOTES.length];

const compressImage = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 400;
        let w = img.width,
          h = img.height;
        if (w > MAX) {
          h = h * (MAX / w);
          w = MAX;
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.55));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

const PhotoButton = ({ onPhoto, small }) => {
  const ref = useRef(null);
  const handle = async (e) => {
    const f = e.target.files?.[0];
    if (f) {
      const d = await compressImage(f);
      onPhoto(d);
    }
    e.target.value = "";
  };
  return (
    <>
      <input ref={ref} type="file" accept="image/*" capture="environment" onChange={handle} style={{ display: "none" }} />
      <button
        onClick={() => ref.current?.click()}
        style={{
          background: "none",
          border: "1px solid #222",
          borderRadius: small ? 6 : 8,
          padding: small ? "4px 8px" : "8px 12px",
          color: "#555",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 11,
        }}
      >
        <Camera size={small ? 12 : 14} />
        {!small && " Photo"}
      </button>
    </>
  );
};

const PhotoThumb = ({ src, onRemove, onView }) => (
  <div style={{ position: "relative", display: "inline-block", marginTop: 8, marginRight: 6 }}>
    <img
      src={src}
      onClick={onView}
      style={{
        width: 80,
        height: 60,
        objectFit: "cover",
        borderRadius: 8,
        border: "1px solid #222",
        cursor: "pointer",
      }}
    />
    {onRemove && (
      <button
        onClick={onRemove}
        style={{
          position: "absolute",
          top: -6,
          right: -6,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#222",
          border: "1px solid #333",
          color: "#888",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          padding: 0,
        }}
      >
        <X size={10} />
      </button>
    )}
  </div>
);

const Lightbox = ({ src, onClose }) =>
  src ? (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <img src={src} style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: 12, objectFit: "contain" }} />
    </div>
  ) : null;

// --- localStorage helpers ---
const loadData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.days[today()]) parsed.days[today()] = emptyDay();
      if (!parsed.todos) parsed.todos = [];
      if (!parsed.scratch) parsed.scratch = [];
      const td = parsed.days[today()];
      HABITS.forEach((h) => {
        if (!Array.isArray(td.habits[h.key])) td.habits[h.key] = [];
      });
      IMPULSES.forEach((i) => {
        if (!Array.isArray(td.impulses[i.key])) td.impulses[i.key] = [];
      });
      return parsed;
    }
  } catch (e) {
    console.error("Error loading data:", e);
  }
  return { startDate: today(), days: { [today()]: emptyDay() }, todos: [], scratch: [] };
};

const saveData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving data:", e);
  }
};

export default function App() {
  const [data, setData] = useState(null);
  const [view, setView] = useState("today");
  const [feltInput, setFeltInput] = useState("");
  const [feltPhoto, setFeltPhoto] = useState(null);
  const [todoInput, setTodoInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [ripple, setRipple] = useState(null);
  const [habitModal, setHabitModal] = useState(null);
  const [habitNote, setHabitNote] = useState("");
  const [habitPhoto, setHabitPhoto] = useState(null);
  const [insightRange, setInsightRange] = useState(7);
  const [quoteIdx, setQuoteIdx] = useState(null);
  const [scratchInput, setScratchInput] = useState("");
  const [scratchPhoto, setScratchPhoto] = useState(null);
  const [editingScratch, setEditingScratch] = useState(null);
  const [editScratchText, setEditScratchText] = useState("");
  const [lightboxSrc, setLightboxSrc] = useState(null);

  useEffect(() => {
    setData(loadData());
    setLoading(false);
  }, []);

  const save = (d) => {
    setData(d);
    saveData(d);
  };

  const ensureDay = (d, dt) => {
    if (!d.days[dt]) d.days[dt] = emptyDay();
    const day = d.days[dt];
    HABITS.forEach((h) => {
      if (!Array.isArray(day.habits[h.key])) day.habits[h.key] = [];
    });
    IMPULSES.forEach((i) => {
      if (!Array.isArray(day.impulses[i.key])) day.impulses[i.key] = [];
    });
    if (!Array.isArray(day.felt)) day.felt = [];
    return day;
  };

  const todayData = (() => {
    if (!data) return emptyDay();
    const d = data.days[today()];
    if (!d) return emptyDay();
    const s = { ...d, impulses: { ...d.impulses }, habits: { ...d.habits } };
    HABITS.forEach((h) => {
      if (!Array.isArray(s.habits[h.key])) s.habits[h.key] = [];
    });
    IMPULSES.forEach((i) => {
      if (!Array.isArray(s.impulses[i.key])) s.impulses[i.key] = [];
    });
    if (!Array.isArray(s.felt)) s.felt = [];
    return s;
  })();

  const daysIn = data ? daysBetween(data.startDate, today()) + 1 : 1;
  const habitsToday = HABITS.filter((h) => todayData.habits[h.key].length > 0).length;
  const totalImpulsesToday = IMPULSES.reduce((s, i) => s + todayData.impulses[i.key].length, 0);
  const todos = data?.todos || [];
  const scratch = data?.scratch || [];
  const completedCount = todos.filter((t) => t.done).length;
  const dailyQuote = getDailyQuote(today());
  const displayQuote = quoteIdx !== null ? QUOTES[quoteIdx] : dailyQuote;

  const shuffleQuote = () => {
    let n,
      c = quoteIdx !== null ? quoteIdx : QUOTES.indexOf(dailyQuote);
    do {
      n = Math.floor(Math.random() * QUOTES.length);
    } while (n === c && QUOTES.length > 1);
    setQuoteIdx(n);
  };

  const logImpulse = (k) => {
    const d = JSON.parse(JSON.stringify(data));
    ensureDay(d, today());
    d.days[today()].impulses[k].push({ time: timeNow() });
    save(d);
    setRipple(k);
    setTimeout(() => setRipple(null), 600);
  };
  const undoImpulse = (k) => {
    const d = JSON.parse(JSON.stringify(data));
    ensureDay(d, today());
    if (d.days[today()].impulses[k].length > 0) {
      d.days[today()].impulses[k].pop();
      save(d);
    }
  };

  const openHabitLog = (k) => {
    setHabitModal(k);
    setHabitNote("");
    setHabitPhoto(null);
  };
  const logHabit = () => {
    if (!habitModal) return;
    const d = JSON.parse(JSON.stringify(data));
    ensureDay(d, today());
    d.days[today()].habits[habitModal].push({
      note: habitNote.trim(),
      time: timeNow(),
      photo: habitPhoto || null,
    });
    save(d);
    setHabitModal(null);
    setHabitNote("");
    setHabitPhoto(null);
  };
  const removeHabitEntry = (k, idx) => {
    const d = JSON.parse(JSON.stringify(data));
    ensureDay(d, today());
    d.days[today()].habits[k].splice(idx, 1);
    save(d);
  };

  const addFelt = () => {
    if (!feltInput.trim() && !feltPhoto) return;
    const d = JSON.parse(JSON.stringify(data));
    ensureDay(d, today());
    d.days[today()].felt.push({
      text: feltInput.trim(),
      time: timeNow(),
      photo: feltPhoto || null,
    });
    save(d);
    setFeltInput("");
    setFeltPhoto(null);
  };
  const removeFelt = (idx) => {
    const d = JSON.parse(JSON.stringify(data));
    d.days[today()].felt.splice(idx, 1);
    save(d);
  };

  const addTodo = () => {
    if (!todoInput.trim()) return;
    const d = JSON.parse(JSON.stringify(data));
    if (!d.todos) d.todos = [];
    d.todos.push({ id: Date.now(), text: todoInput.trim(), done: false });
    save(d);
    setTodoInput("");
  };
  const toggleTodo = (id) => {
    const d = JSON.parse(JSON.stringify(data));
    const t = d.todos.find((x) => x.id === id);
    if (t) t.done = !t.done;
    save(d);
  };
  const deleteTodo = (id) => {
    const d = JSON.parse(JSON.stringify(data));
    d.todos = d.todos.filter((x) => x.id !== id);
    save(d);
  };
  const clearCompleted = () => {
    const d = JSON.parse(JSON.stringify(data));
    d.todos = d.todos.filter((x) => !x.done);
    save(d);
  };

  const addScratch = () => {
    if (!scratchInput.trim() && !scratchPhoto) return;
    const d = JSON.parse(JSON.stringify(data));
    if (!d.scratch) d.scratch = [];
    d.scratch.unshift({
      id: Date.now(),
      text: scratchInput.trim(),
      date: today(),
      time: timeNow(),
      updated: null,
      photo: scratchPhoto || null,
    });
    save(d);
    setScratchInput("");
    setScratchPhoto(null);
  };
  const startEditScratch = (item) => {
    setEditingScratch(item.id);
    setEditScratchText(item.text);
  };
  const saveEditScratch = () => {
    const d = JSON.parse(JSON.stringify(data));
    const item = d.scratch.find((x) => x.id === editingScratch);
    if (item) {
      item.text = editScratchText.trim();
      item.updated = today();
    }
    save(d);
    setEditingScratch(null);
    setEditScratchText("");
  };
  const deleteScratch = (id) => {
    const d = JSON.parse(JSON.stringify(data));
    d.scratch = d.scratch.filter((x) => x.id !== id);
    save(d);
  };

  const getSafeDay = (dt) => {
    const day = data?.days?.[dt];
    if (!day) return emptyDay();
    const s = { impulses: {}, habits: {}, felt: day.felt || [] };
    IMPULSES.forEach((i) => {
      s.impulses[i.key] = Array.isArray(day.impulses?.[i.key]) ? day.impulses[i.key] : [];
    });
    HABITS.forEach((h) => {
      s.habits[h.key] = Array.isArray(day.habits?.[h.key])
        ? day.habits[h.key]
        : day.habits?.[h.key]
        ? [{ note: "", time: "" }]
        : [];
    });
    return s;
  };

  const chartData = getDateRange(insightRange).map((dt) => {
    const day = getSafeDay(dt);
    const label =
      insightRange <= 14
        ? new Date(dt + "T12:00:00").toLocaleDateString([], { weekday: "short" })
        : new Date(dt + "T12:00:00").toLocaleDateString([], { month: "short", day: "numeric" });
    return {
      label,
      impulses: IMPULSES.reduce((s, i) => s + day.impulses[i.key].length, 0),
      habits: HABITS.filter((h) => day.habits[h.key].length > 0).length,
      felt: day.felt.length,
    };
  });
  const impulseBreakdown = getDateRange(insightRange).map((dt) => {
    const day = getSafeDay(dt);
    const label =
      insightRange <= 14
        ? new Date(dt + "T12:00:00").toLocaleDateString([], { weekday: "short" })
        : new Date(dt + "T12:00:00").toLocaleDateString([], { month: "short", day: "numeric" });
    return { label, boredom: day.impulses.boredom.length, sexual: day.impulses.sexual.length };
  });

  const calcStreak = () => {
    let streak = 0;
    const d = new Date();
    while (true) {
      const k = localDateStr(d);
      if (!data?.days?.[k]) break;
      if (HABITS.filter((h) => getSafeDay(k).habits[h.key].length > 0).length >= 2) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else if (k === today()) {
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return streak;
  };

  const allFelt = () => {
    if (!data) return [];
    const e = [];
    Object.keys(data.days)
      .sort()
      .reverse()
      .forEach((dt) => {
        const day = data.days[dt];
        if (day.felt?.length) day.felt.forEach((f) => e.push({ ...f, date: dt }));
      });
    return e;
  };

  const presenceScore = () => {
    let h = 0,
      i = 0,
      f = 0;
    getDateRange(7).forEach((dt) => {
      const d = getSafeDay(dt);
      h += HABITS.filter((x) => d.habits[x.key].length > 0).length;
      i += IMPULSES.reduce((s, x) => s + d.impulses[x.key].length, 0);
      f += d.felt.length;
    });
    return Math.max(0, Math.min(1, (h / 21) * 0.4 + Math.min(f / 14, 1) * 0.4 - Math.min(i / 50, 1) * 0.2));
  };

  if (loading)
    return (
      <div
        style={{
          background: "#0a0a0f",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "#555", fontSize: 14, letterSpacing: 2 }}>LOADING...</div>
      </div>
    );

  const ps = presenceScore();
  const glowColor = `rgba(${Math.round(120 + ps * 80)}, ${Math.round(160 + ps * 60)}, ${Math.round(
    200 + ps * 55
  )}, ${0.15 + ps * 0.25})`;
  const currentHabitData = HABITS.find((h) => h.key === habitModal);
  const VIEWS = ["today", "tasks", "scratch", "insights", "journal"];

  return (
    <div
      style={{
        background: "#0a0a0f",
        minHeight: "100vh",
        color: "#e0e0e0",
        fontFamily: "'Inter', -apple-system, sans-serif",
        paddingBottom: 40,
      }}
    >
      <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />

      {habitModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setHabitModal(null)}
        >
          <div
            style={{
              background: "#111118",
              borderRadius: 16,
              padding: 24,
              width: "100%",
              maxWidth: 400,
              border: "1px solid #2a2a3a",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, color: "#eee" }}>
                {currentHabitData?.icon} {currentHabitData?.label}
              </div>
              <button
                onClick={() => setHabitModal(null)}
                style={{ background: "none", border: "none", color: "#444", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>
            <textarea
              value={habitNote}
              onChange={(e) => setHabitNote(e.target.value)}
              placeholder={currentHabitData?.placeholder}
              autoFocus
              style={{
                width: "100%",
                background: "#0a0a0f",
                border: "1px solid #222",
                borderRadius: 10,
                padding: 12,
                color: "#ddd",
                fontSize: 13,
                outline: "none",
                resize: "vertical",
                minHeight: 80,
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
              <PhotoButton onPhoto={setHabitPhoto} small />
              {habitPhoto && (
                <PhotoThumb
                  src={habitPhoto}
                  onRemove={() => setHabitPhoto(null)}
                  onView={() => setLightboxSrc(habitPhoto)}
                />
              )}
            </div>
            <button
              onClick={logHabit}
              style={{
                width: "100%",
                marginTop: 12,
                padding: "12px 0",
                background: "#1a1a2e",
                border: "1px solid #2a2a3a",
                borderRadius: 10,
                color: "#aaa",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Log it
            </button>
          </div>
        </div>
      )}

      <div style={{ padding: "28px 20px 0", maxWidth: 480, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: -0.5, color: "#f0f0f0" }}>
              Recalibrate
            </h1>
            <p
              style={{
                fontSize: 12,
                color: "#555",
                margin: "4px 0 0",
                letterSpacing: 1.5,
                textTransform: "uppercase",
              }}
            >
              Day {daysIn} · {calcStreak() > 0 ? `${calcStreak()} day streak` : "Begin"}
            </p>
          </div>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${glowColor}, transparent 70%)`,
              border: `1px solid rgba(255,255,255,${0.05 + ps * 0.1})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              color: "#888",
              fontWeight: 600,
              transition: "all 1s ease",
            }}
          >
            {Math.round(ps * 100)}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 0,
            marginTop: 20,
            borderBottom: "1px solid #1a1a24",
            overflowX: "auto",
          }}
        >
          {VIEWS.map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                flex: "1 0 auto",
                padding: "10px 8px",
                background: "none",
                border: "none",
                color: view === v ? "#f0f0f0" : "#444",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 1,
                textTransform: "uppercase",
                cursor: "pointer",
                borderBottom: view === v ? "2px solid #888" : "2px solid transparent",
                whiteSpace: "nowrap",
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px" }}>
        {view === "today" && (
          <div>
            <div
              style={{
                marginTop: 24,
                background: "#0e0e18",
                borderRadius: 14,
                padding: "22px 20px",
                border: "1px solid #1a1a28",
              }}
            >
              <div style={{ fontSize: 14, color: "#999", lineHeight: 1.7, fontStyle: "italic" }}>
                "{displayQuote.text}"
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 12,
                }}
              >
                <div style={{ fontSize: 11, color: "#555", fontWeight: 600 }}>— {displayQuote.author}</div>
                <button
                  onClick={shuffleQuote}
                  style={{
                    background: "none",
                    border: "1px solid #1a1a24",
                    borderRadius: 6,
                    padding: "4px 8px",
                    color: "#444",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 10,
                  }}
                >
                  <RefreshCw size={10} /> another
                </button>
              </div>
            </div>

            <div style={{ marginTop: 28 }}>
              <p
                style={{
                  fontSize: 10,
                  letterSpacing: 2,
                  color: "#555",
                  textTransform: "uppercase",
                  marginBottom: 14,
                  fontWeight: 600,
                }}
              >
                Impulse Awareness
              </p>
              {IMPULSES.map((imp) => {
                const count = todayData.impulses[imp.key].length;
                const lastTime = count > 0 ? todayData.impulses[imp.key][count - 1]?.time : null;
                return (
                  <div
                    key={imp.key}
                    style={{
                      background: "#111118",
                      borderRadius: 12,
                      padding: "16px 18px",
                      marginBottom: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      border: `1px solid ${ripple === imp.key ? imp.color + "40" : "#1a1a24"}`,
                      transition: "border-color 0.6s ease",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#ddd" }}>{imp.label}</div>
                      <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{imp.sub}</div>
                      {lastTime && (
                        <div style={{ fontSize: 10, color: "#444", marginTop: 4 }}>Last: {lastTime}</div>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <button
                        onClick={() => undoImpulse(imp.key)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          border: "1px solid #222",
                          background: "none",
                          color: "#444",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: count > 0 ? 1 : 0.3,
                        }}
                      >
                        <Minus size={12} />
                      </button>
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 700,
                          color: count > 0 ? imp.color : "#333",
                          minWidth: 32,
                          textAlign: "center",
                          transition: "color 0.3s",
                        }}
                      >
                        {count}
                      </div>
                      <button
                        onClick={() => logImpulse(imp.key)}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          border: `1px solid ${imp.color}40`,
                          background: `${imp.color}10`,
                          color: imp.color,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 28 }}>
              <p
                style={{
                  fontSize: 10,
                  letterSpacing: 2,
                  color: "#555",
                  textTransform: "uppercase",
                  marginBottom: 14,
                  fontWeight: 600,
                }}
              >
                Recalibration — {habitsToday}/{HABITS.length} active
              </p>
              {HABITS.map((h) => {
                const entries = todayData.habits[h.key];
                const active = entries.length > 0;
                return (
                  <div
                    key={h.key}
                    style={{
                      background: "#111118",
                      borderRadius: 12,
                      border: `1px solid ${active ? "#1e1e30" : "#1a1a24"}`,
                      marginBottom: 8,
                      overflow: "hidden",
                    }}
                  >
                    <button
                      onClick={() => openHabitLog(h.key)}
                      style={{
                        width: "100%",
                        padding: "14px 16px",
                        background: "none",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{h.icon}</span>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: active ? "#ccc" : "#555" }}>
                        {h.label}
                      </span>
                      <span style={{ fontSize: 12, color: active ? "#34d399" : "#333", fontWeight: 700 }}>
                        {entries.length > 0 ? entries.length : "—"}
                      </span>
                      <Plus size={14} style={{ color: "#444" }} />
                    </button>
                    {entries.length > 0 && (
                      <div style={{ padding: "0 16px 12px" }}>
                        {entries.map((e, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              padding: "6px 0",
                              borderTop: "1px solid #1a1a24",
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              {e.note ? (
                                <span style={{ fontSize: 12, color: "#888", lineHeight: 1.4 }}>{e.note}</span>
                              ) : (
                                <span style={{ fontSize: 12, color: "#444", fontStyle: "italic" }}>No note</span>
                              )}
                              <span style={{ fontSize: 10, color: "#333", marginLeft: 8 }}>{e.time}</span>
                              {e.photo && (
                                <div>
                                  <PhotoThumb src={e.photo} onView={() => setLightboxSrc(e.photo)} />
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => removeHabitEntry(h.key, i)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#2a2a3a",
                                cursor: "pointer",
                                padding: "2px 4px",
                                flexShrink: 0,
                              }}
                            >
                              <X size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 28 }}>
              <p
                style={{
                  fontSize: 10,
                  letterSpacing: 2,
                  color: "#555",
                  textTransform: "uppercase",
                  marginBottom: 14,
                  fontWeight: 600,
                }}
              >
                Felt Something — {todayData.felt.length}
              </p>
              <div
                style={{
                  background: "#111118",
                  borderRadius: 12,
                  padding: 14,
                  border: "1px solid #1a1a24",
                }}
              >
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={feltInput}
                    onChange={(e) => setFeltInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addFelt()}
                    placeholder="What did you actually feel?"
                    style={{
                      flex: 1,
                      background: "#0a0a0f",
                      border: "1px solid #222",
                      borderRadius: 8,
                      padding: "10px 12px",
                      color: "#ddd",
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                  <PhotoButton onPhoto={setFeltPhoto} small />
                  <button
                    onClick={addFelt}
                    style={{
                      background: "#1a1a2a",
                      border: "1px solid #2a2a3a",
                      borderRadius: 8,
                      padding: "0 16px",
                      color: "#888",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Log
                  </button>
                </div>
                {feltPhoto && (
                  <div style={{ marginTop: 8 }}>
                    <PhotoThumb
                      src={feltPhoto}
                      onRemove={() => setFeltPhoto(null)}
                      onView={() => setLightboxSrc(feltPhoto)}
                    />
                  </div>
                )}
                {todayData.felt.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    {todayData.felt.map((f, i) => (
                      <div key={i} style={{ padding: "8px 0", borderTop: i > 0 ? "1px solid #1a1a24" : "none" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <span style={{ fontSize: 13, color: "#aab" }}>{f.text}</span>
                            <span style={{ fontSize: 10, color: "#444", marginLeft: 8 }}>{f.time}</span>
                          </div>
                          <button
                            onClick={() => removeFelt(i)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#333",
                              cursor: "pointer",
                              padding: 4,
                            }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                        {f.photo && <PhotoThumb src={f.photo} onView={() => setLightboxSrc(f.photo)} />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p style={{ fontSize: 11, color: "#333", marginTop: 8, fontStyle: "italic" }}>
                Noticed the wind. Tasted your coffee. Felt something in a conversation.
              </p>
            </div>
          </div>
        )}

        {view === "tasks" && (
          <div style={{ marginTop: 28 }}>
            <p
              style={{
                fontSize: 10,
                letterSpacing: 2,
                color: "#555",
                textTransform: "uppercase",
                marginBottom: 14,
                fontWeight: 600,
              }}
            >
              To Do — {todos.length - completedCount} remaining
            </p>
            <div
              style={{
                background: "#111118",
                borderRadius: 12,
                padding: 14,
                border: "1px solid #1a1a24",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={todoInput}
                  onChange={(e) => setTodoInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTodo()}
                  placeholder="Add a task..."
                  style={{
                    flex: 1,
                    background: "#0a0a0f",
                    border: "1px solid #222",
                    borderRadius: 8,
                    padding: "10px 12px",
                    color: "#ddd",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
                <button
                  onClick={addTodo}
                  style={{
                    background: "#1a1a2a",
                    border: "1px solid #2a2a3a",
                    borderRadius: 8,
                    padding: "0 16px",
                    color: "#888",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Add
                </button>
              </div>
            </div>
            {todos
              .filter((t) => !t.done)
              .map((t) => (
                <div
                  key={t.id}
                  style={{
                    background: "#111118",
                    borderRadius: 10,
                    padding: "12px 14px",
                    border: "1px solid #1a1a24",
                    marginBottom: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <button
                    onClick={() => toggleTodo(t.id)}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      border: "1.5px solid #333",
                      background: "none",
                      cursor: "pointer",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  />
                  <span style={{ flex: 1, fontSize: 13, color: "#ccc", lineHeight: 1.4 }}>{t.text}</span>
                  <button
                    onClick={() => deleteTodo(t.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#2a2a3a",
                      cursor: "pointer",
                      padding: 4,
                      flexShrink: 0,
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            {completedCount > 0 && (
              <div style={{ marginTop: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <p
                    style={{
                      fontSize: 10,
                      letterSpacing: 2,
                      color: "#444",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      margin: 0,
                    }}
                  >
                    Done — {completedCount}
                  </p>
                  <button
                    onClick={clearCompleted}
                    style={{
                      background: "none",
                      border: "1px solid #1a1a24",
                      borderRadius: 6,
                      padding: "4px 10px",
                      color: "#444",
                      cursor: "pointer",
                      fontSize: 10,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                    }}
                  >
                    Clear
                  </button>
                </div>
                {todos
                  .filter((t) => t.done)
                  .map((t) => (
                    <div
                      key={t.id}
                      style={{
                        background: "#0d0d14",
                        borderRadius: 10,
                        padding: "12px 14px",
                        border: "1px solid #151520",
                        marginBottom: 6,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        opacity: 0.5,
                      }}
                    >
                      <button
                        onClick={() => toggleTodo(t.id)}
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          border: "1.5px solid #34d399",
                          background: "#34d39915",
                          cursor: "pointer",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#34d399",
                        }}
                      >
                        <Check size={12} />
                      </button>
                      <span
                        style={{
                          flex: 1,
                          fontSize: 13,
                          color: "#555",
                          lineHeight: 1.4,
                          textDecoration: "line-through",
                        }}
                      >
                        {t.text}
                      </span>
                      <button
                        onClick={() => deleteTodo(t.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#222",
                          cursor: "pointer",
                          padding: 4,
                          flexShrink: 0,
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
              </div>
            )}
            {todos.length === 0 && (
              <div
                style={{
                  background: "#111118",
                  borderRadius: 12,
                  padding: 40,
                  border: "1px solid #1a1a24",
                  textAlign: "center",
                }}
              >
                <p style={{ color: "#333", fontSize: 13 }}>No tasks yet.</p>
                <p style={{ color: "#2a2a3a", fontSize: 12, marginTop: 8 }}>What needs doing?</p>
              </div>
            )}
          </div>
        )}

        {view === "scratch" && (
          <div style={{ marginTop: 28 }}>
            <p
              style={{
                fontSize: 10,
                letterSpacing: 2,
                color: "#555",
                textTransform: "uppercase",
                marginBottom: 6,
                fontWeight: 600,
              }}
            >
              Scratch Board
            </p>
            <p style={{ fontSize: 11, color: "#333", marginBottom: 18, fontStyle: "italic" }}>
              Long-term goals, emerging insights, things you're figuring out.
            </p>
            <div
              style={{
                background: "#111118",
                borderRadius: 12,
                padding: 14,
                border: "1px solid #1a1a24",
                marginBottom: 20,
              }}
            >
              <textarea
                value={scratchInput}
                onChange={(e) => setScratchInput(e.target.value)}
                placeholder="A goal forming, an insight landing, something you're starting to see..."
                style={{
                  width: "100%",
                  background: "#0a0a0f",
                  border: "1px solid #222",
                  borderRadius: 8,
                  padding: "10px 12px",
                  color: "#ddd",
                  fontSize: 13,
                  outline: "none",
                  resize: "vertical",
                  minHeight: 60,
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <PhotoButton onPhoto={setScratchPhoto} small />
                {scratchPhoto && (
                  <PhotoThumb
                    src={scratchPhoto}
                    onRemove={() => setScratchPhoto(null)}
                    onView={() => setLightboxSrc(scratchPhoto)}
                  />
                )}
              </div>
              <button
                onClick={addScratch}
                style={{
                  width: "100%",
                  marginTop: 8,
                  padding: "10px 0",
                  background: "#1a1a2e",
                  border: "1px solid #2a2a3a",
                  borderRadius: 8,
                  color: "#888",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Add to board
              </button>
            </div>
            {scratch.length === 0 ? (
              <div
                style={{
                  background: "#111118",
                  borderRadius: 12,
                  padding: 40,
                  border: "1px solid #1a1a24",
                  textAlign: "center",
                }}
              >
                <p style={{ color: "#333", fontSize: 13 }}>Board is empty.</p>
                <p style={{ color: "#2a2a3a", fontSize: 12, marginTop: 8 }}>What's the bigger picture?</p>
              </div>
            ) : (
              scratch.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: "#111118",
                    borderRadius: 12,
                    padding: "16px 18px",
                    border: "1px solid #1a1a24",
                    marginBottom: 10,
                  }}
                >
                  {editingScratch === item.id ? (
                    <div>
                      <textarea
                        value={editScratchText}
                        onChange={(e) => setEditScratchText(e.target.value)}
                        autoFocus
                        style={{
                          width: "100%",
                          background: "#0a0a0f",
                          border: "1px solid #2a2a3a",
                          borderRadius: 8,
                          padding: "10px 12px",
                          color: "#ddd",
                          fontSize: 13,
                          outline: "none",
                          resize: "vertical",
                          minHeight: 60,
                          fontFamily: "inherit",
                          boxSizing: "border-box",
                        }}
                      />
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button
                          onClick={saveEditScratch}
                          style={{
                            flex: 1,
                            padding: "8px 0",
                            background: "#1a1a2e",
                            border: "1px solid #2a2a3a",
                            borderRadius: 6,
                            color: "#aaa",
                            cursor: "pointer",
                            fontSize: 11,
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 4,
                          }}
                        >
                          <Save size={11} /> Save
                        </button>
                        <button
                          onClick={() => setEditingScratch(null)}
                          style={{
                            padding: "8px 16px",
                            background: "none",
                            border: "1px solid #1a1a24",
                            borderRadius: 6,
                            color: "#444",
                            cursor: "pointer",
                            fontSize: 11,
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 13, color: "#bbc", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                        {item.text}
                      </div>
                      {item.photo && (
                        <PhotoThumb src={item.photo} onView={() => setLightboxSrc(item.photo)} />
                      )}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: 12,
                          paddingTop: 10,
                          borderTop: "1px solid #1a1a24",
                        }}
                      >
                        <div style={{ fontSize: 10, color: "#333" }}>
                          {new Date(item.date + "T12:00:00").toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}
                          {item.updated && (
                            <span>
                              {" "}
                              · edited{" "}
                              {new Date(item.updated + "T12:00:00").toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => startEditScratch(item)}
                            style={{
                              background: "none",
                              border: "1px solid #1a1a24",
                              borderRadius: 5,
                              padding: "3px 8px",
                              color: "#444",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 3,
                              fontSize: 10,
                            }}
                          >
                            <Edit3 size={10} /> edit
                          </button>
                          <button
                            onClick={() => deleteScratch(item.id)}
                            style={{
                              background: "none",
                              border: "1px solid #1a1a24",
                              borderRadius: 5,
                              padding: "3px 8px",
                              color: "#333",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 3,
                              fontSize: 10,
                            }}
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {view === "insights" && (
          <div style={{ marginTop: 28 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
              {[
                { n: 7, l: "7D" },
                { n: 14, l: "2W" },
                { n: 30, l: "1M" },
                { n: 90, l: "3M" },
              ].map((r) => (
                <button
                  key={r.n}
                  onClick={() => setInsightRange(r.n)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    background: insightRange === r.n ? "#1a1a2e" : "none",
                    border: `1px solid ${insightRange === r.n ? "#2a2a3a" : "#1a1a24"}`,
                    borderRadius: 8,
                    color: insightRange === r.n ? "#ccc" : "#444",
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: 1,
                  }}
                >
                  {r.l}
                </button>
              ))}
            </div>
            <p
              style={{
                fontSize: 10,
                letterSpacing: 2,
                color: "#555",
                textTransform: "uppercase",
                marginBottom: 18,
                fontWeight: 600,
              }}
            >
              Impulse Breakdown
            </p>
            <div
              style={{
                background: "#111118",
                borderRadius: 12,
                padding: "20px 10px 10px",
                border: "1px solid #1a1a24",
                marginBottom: 24,
              }}
            >
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={impulseBreakdown} barGap={1}>
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#444", fontSize: insightRange > 14 ? 9 : 11 }}
                    axisLine={false}
                    tickLine={false}
                    interval={
                      insightRange > 30
                        ? Math.floor(insightRange / 10)
                        : insightRange > 14
                        ? 1
                        : 0
                    }
                  />
                  <YAxis
                    tick={{ fill: "#333", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={24}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1a1a24",
                      border: "1px solid #2a2a3a",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "#888" }}
                  />
                  <Bar dataKey="boredom" stackId="a" fill="#f87171" name="Boredom" />
                  <Bar dataKey="sexual" stackId="a" fill="#c084fc" radius={[3, 3, 0, 0]} name="Sexual" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p
              style={{
                fontSize: 10,
                letterSpacing: 2,
                color: "#555",
                textTransform: "uppercase",
                marginBottom: 18,
                fontWeight: 600,
              }}
            >
              Habits vs Impulses vs Feeling
            </p>
            <div
              style={{
                background: "#111118",
                borderRadius: 12,
                padding: "20px 10px 10px",
                border: "1px solid #1a1a24",
                marginBottom: 24,
              }}
            >
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#444", fontSize: insightRange > 14 ? 9 : 11 }}
                    axisLine={false}
                    tickLine={false}
                    interval={
                      insightRange > 30
                        ? Math.floor(insightRange / 10)
                        : insightRange > 14
                        ? 1
                        : 0
                    }
                  />
                  <YAxis
                    tick={{ fill: "#333", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={24}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1a1a24",
                      border: "1px solid #2a2a3a",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "#888" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="habits"
                    stroke="#34d399"
                    strokeWidth={2}
                    dot={insightRange <= 14}
                    name="Habits"
                  />
                  <Line
                    type="monotone"
                    dataKey="impulses"
                    stroke="#f87171"
                    strokeWidth={2}
                    dot={insightRange <= 14}
                    name="Impulses"
                  />
                  <Line
                    type="monotone"
                    dataKey="felt"
                    stroke="#fbbf24"
                    strokeWidth={2}
                    dot={insightRange <= 14}
                    name="Felt"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 24 }}>
              {[
                {
                  label: "Total Impulses",
                  value: Object.values(data?.days || {}).reduce(
                    (s, d) =>
                      s +
                      IMPULSES.reduce(
                        (ss, i) => ss + (Array.isArray(d.impulses?.[i.key]) ? d.impulses[i.key].length : 0),
                        0
                      ),
                    0
                  ),
                  color: "#f87171",
                },
                {
                  label: "Habits Logged",
                  value: Object.values(data?.days || {}).reduce(
                    (s, d) =>
                      s +
                      HABITS.reduce(
                        (ss, h) =>
                          ss +
                          (Array.isArray(d.habits?.[h.key])
                            ? d.habits[h.key].length
                            : d.habits?.[h.key]
                            ? 1
                            : 0),
                        0
                      ),
                    0
                  ),
                  color: "#34d399",
                },
                {
                  label: "Moments Felt",
                  value: Object.values(data?.days || {}).reduce((s, d) => s + (d.felt?.length || 0), 0),
                  color: "#fbbf24",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    background: "#111118",
                    borderRadius: 12,
                    padding: "16px 12px",
                    border: "1px solid #1a1a24",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div
                    style={{
                      fontSize: 9,
                      color: "#555",
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      marginTop: 4,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                background: "#111118",
                borderRadius: 12,
                padding: 18,
                border: "1px solid #1a1a24",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "#555",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                The story so far
              </div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7 }}>
                {daysIn === 1
                  ? "Day one. Everything starts here."
                  : totalImpulsesToday === 0 && habitsToday >= 2
                  ? "Clean day building. The quiet is working."
                  : habitsToday >= 2
                  ? "Habits are stacking. Impulses are just noise — you're catching them."
                  : daysIn < 7
                  ? "Still early. Stay with the discomfort. It's telling you something."
                  : "Keep going. The data doesn't lie — look for the trends."}
              </div>
            </div>
          </div>
        )}

        {view === "journal" && (
          <div style={{ marginTop: 28 }}>
            <p
              style={{
                fontSize: 10,
                letterSpacing: 2,
                color: "#555",
                textTransform: "uppercase",
                marginBottom: 18,
                fontWeight: 600,
              }}
            >
              Moments You Were Here
            </p>
            {allFelt().length === 0 ? (
              <div
                style={{
                  background: "#111118",
                  borderRadius: 12,
                  padding: 40,
                  border: "1px solid #1a1a24",
                  textAlign: "center",
                }}
              >
                <p style={{ color: "#333", fontSize: 13 }}>Nothing logged yet.</p>
                <p style={{ color: "#2a2a3a", fontSize: 12, marginTop: 8 }}>
                  When something mundane actually lands — log it.
                </p>
              </div>
            ) : (
              allFelt().map((f, i) => {
                const af = allFelt();
                const showDate = f.date !== (i > 0 ? af[i - 1].date : null);
                return (
                  <div key={i}>
                    {showDate && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "#444",
                          fontWeight: 600,
                          marginTop: i > 0 ? 20 : 0,
                          marginBottom: 8,
                          letterSpacing: 0.5,
                        }}
                      >
                        {new Date(f.date + "T12:00:00").toLocaleDateString([], {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    )}
                    <div
                      style={{
                        background: "#111118",
                        borderRadius: 10,
                        padding: "12px 16px",
                        border: "1px solid #1a1a24",
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: 13, color: "#aab", lineHeight: 1.5 }}>{f.text}</span>
                        <span style={{ fontSize: 10, color: "#333", marginLeft: 12, whiteSpace: "nowrap" }}>
                          {f.time}
                        </span>
                      </div>
                      {f.photo && <PhotoThumb src={f.photo} onView={() => setLightboxSrc(f.photo)} />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
