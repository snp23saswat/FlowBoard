import { useState, useRef } from "react";
import "./App.css";

const INITIAL_DATA = {
  columns: {
    backlog: {
      id: "backlog",
      title: "Backlog",
      icon: "◉",
      color: "#6b7280",
      cards: [
        { id: "c1", title: "Research competitor UX", tag: "Research", priority: "low", assignee: "AS" },
        { id: "c2", title: "Set up CI/CD pipeline", tag: "DevOps", priority: "medium", assignee: "RK" },
        { id: "c3", title: "Write API documentation", tag: "Docs", priority: "low", assignee: "PM" },
      ],
    },
    todo: {
      id: "todo",
      title: "To Do",
      icon: "◈",
      color: "#3b82f6",
      cards: [
        { id: "c4", title: "Design new onboarding flow", tag: "Design", priority: "high", assignee: "LM" },
        { id: "c5", title: "Fix auth token expiry bug", tag: "Bug", priority: "urgent", assignee: "AS" },
        { id: "c6", title: "Implement dark mode toggle", tag: "Feature", priority: "medium", assignee: "RK" },
      ],
    },
    inprogress: {
      id: "inprogress",
      title: "In Progress",
      icon: "◐",
      color: "#f59e0b",
      cards: [
        { id: "c7", title: "Refactor payment module", tag: "Backend", priority: "high", assignee: "PM" },
        { id: "c8", title: "A/B test landing page", tag: "Growth", priority: "medium", assignee: "LM" },
      ],
    },
    review: {
      id: "review",
      title: "In Review",
      icon: "◑",
      color: "#8b5cf6",
      cards: [
        { id: "c9", title: "Mobile responsive redesign", tag: "Design", priority: "high", assignee: "AS" },
      ],
    },
    done: {
      id: "done",
      title: "Done",
      icon: "◉",
      color: "#10b981",
      cards: [
        { id: "c10", title: "Update privacy policy", tag: "Legal", priority: "medium", assignee: "PM" },
        { id: "c11", title: "Migrate to PostgreSQL", tag: "Backend", priority: "high", assignee: "RK" },
      ],
    },
  },
  columnOrder: ["backlog", "todo", "inprogress", "review", "done"],
};

const PRIORITY_CONFIG = {
  urgent: { label: "Urgent", color: "#ef4444" },
  high: { label: "High", color: "#f97316" },
  medium: { label: "Medium", color: "#eab308" },
  low: { label: "Low", color: "#22c55e" },
};

const TAG_COLORS = {
  Research: "#0ea5e9",
  DevOps: "#6366f1",
  Docs: "#64748b",
  Design: "#ec4899",
  Bug: "#ef4444",
  Feature: "#8b5cf6",
  Backend: "#f97316",
  Growth: "#10b981",
  Legal: "#6b7280",
};

function Avatar({ initials, size = 28 }) {
  const colors = ["#6366f1", "#ec4899", "#f97316", "#10b981", "#3b82f6", "#8b5cf6"];
  const color = colors[initials.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color: "#fff", flexShrink: 0, letterSpacing: "0.02em",
    }}>
      {initials}
    </div>
  );
}

function Card({ card, columnId, onDragStart, onDelete, onEdit }) {
  const [hovered, setHovered] = useState(false);
  const prio = PRIORITY_CONFIG[card.priority];
  const tagColor = TAG_COLORS[card.tag] || "#6b7280";

  return (
    <div
      className="card"
      draggable
      onDragStart={(e) => onDragStart(e, card.id, columnId)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ "--prio-color": prio.color }}
    >
      <div className="card-priority-bar" />
      <div className="card-body">
        <div className="card-top-row">
          <span className="card-tag" style={{ background: tagColor + "22", color: tagColor }}>{card.tag}</span>
          {hovered && (
            <div className="card-actions">
              <button className="card-btn" onClick={() => onEdit(card, columnId)}>✎</button>
              <button className="card-btn danger" onClick={() => onDelete(card.id, columnId)}>✕</button>
            </div>
          )}
        </div>
        <p className="card-title">{card.title}</p>
        <div className="card-footer">
          <span className="card-prio-dot" style={{ background: prio.color }} />
          <span className="card-prio-label">{prio.label}</span>
          <div style={{ flex: 1 }} />
          <Avatar initials={card.assignee} />
        </div>
      </div>
    </div>
  );
}

function Column({ column, onDragStart, onDrop, onDragOver, onDelete, onEdit, onAddCard }) {
  const [isOver, setIsOver] = useState(false);
  return (
    <div
      className={`column ${isOver ? "column-over" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); onDragOver(e); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => { setIsOver(false); onDrop(e, column.id); }}
    >
      <div className="column-header">
        <div className="column-title-group">
          <span className="column-icon" style={{ color: column.color }}>{column.icon}</span>
          <span className="column-title">{column.title}</span>
          <span className="column-count" style={{ background: column.color + "22", color: column.color }}>{column.cards.length}</span>
        </div>
        <button className="add-card-btn" onClick={() => onAddCard(column.id)}>+</button>
      </div>
      <div className="column-drop-zone">
        {column.cards.map((card) => (
          <Card key={card.id} card={card} columnId={column.id} onDragStart={onDragStart} onDelete={onDelete} onEdit={onEdit} />
        ))}
        {column.cards.length === 0 && <div className="empty-column">Drop cards here</div>}
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function CardForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { title: "", tag: "Feature", priority: "medium", assignee: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="card-form">
      <label>Title</label>
      <input className="form-input" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Card title..." />
      <div className="form-row">
        <div>
          <label>Tag</label>
          <select className="form-input" value={form.tag} onChange={(e) => set("tag", e.target.value)}>
            {Object.keys(TAG_COLORS).map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label>Priority</label>
          <select className="form-input" value={form.priority} onChange={(e) => set("priority", e.target.value)}>
            {Object.keys(PRIORITY_CONFIG).map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>
      <label>Assignee Initials</label>
      <input className="form-input" value={form.assignee} onChange={(e) => set("assignee", e.target.value.toUpperCase().slice(0, 2))} placeholder="e.g. AS" maxLength={2} />
      <div className="form-actions">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={() => form.title.trim() && form.assignee.trim() && onSave(form)} disabled={!form.title.trim() || !form.assignee.trim()}>Save</button>
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(INITIAL_DATA);
  const [dragCard, setDragCard] = useState(null);
  const [modal, setModal] = useState(null);
  const idRef = useRef(100);

  const handleDragStart = (e, cardId, columnId) => {
    setDragCard({ cardId, columnId });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e, targetColumnId) => {
    if (!dragCard) return;
    const { cardId, columnId: sourceColumnId } = dragCard;
    if (cardId && sourceColumnId !== targetColumnId) {
      setData((prev) => {
        const srcCards = [...prev.columns[sourceColumnId].cards];
        const cardIndex = srcCards.findIndex((c) => c.id === cardId);
        const [moved] = srcCards.splice(cardIndex, 1);
        const dstCards = [...prev.columns[targetColumnId].cards, moved];
        return {
          ...prev,
          columns: {
            ...prev.columns,
            [sourceColumnId]: { ...prev.columns[sourceColumnId], cards: srcCards },
            [targetColumnId]: { ...prev.columns[targetColumnId], cards: dstCards },
          },
        };
      });
    }
    setDragCard(null);
  };

  const handleDelete = (cardId, columnId) => {
    setData((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [columnId]: { ...prev.columns[columnId], cards: prev.columns[columnId].cards.filter((c) => c.id !== cardId) },
      },
    }));
  };

  const handleSave = (form) => {
    if (modal.type === "add") {
      const newCard = { ...form, id: `c${++idRef.current}` };
      setData((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [modal.columnId]: { ...prev.columns[modal.columnId], cards: [...prev.columns[modal.columnId].cards, newCard] },
        },
      }));
    } else {
      setData((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [modal.columnId]: {
            ...prev.columns[modal.columnId],
            cards: prev.columns[modal.columnId].cards.map((c) => c.id === modal.card.id ? { ...c, ...form } : c),
          },
        },
      }));
    }
    setModal(null);
  };

  const totalCards = Object.values(data.columns).reduce((acc, col) => acc + col.cards.length, 0);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <div className="logo">⬡</div>
          <div>
            <h1 className="app-title">FlowBoard</h1>
            <p className="app-sub">Project Workspace</p>
          </div>
        </div>
        <div className="header-stats">
          {data.columnOrder.map((id) => {
            const col = data.columns[id];
            return (
              <div key={id} className="stat-pill" style={{ "--col": col.color }}>
                <span className="stat-dot" style={{ background: col.color }} />
                <span>{col.title}</span>
                <strong>{col.cards.length}</strong>
              </div>
            );
          })}
        </div>
        <div className="header-right">
          <span className="total-badge">{totalCards} tasks</span>
        </div>
      </header>
      <main className="board">
        {data.columnOrder.map((colId) => (
          <Column
            key={colId}
            column={data.columns[colId]}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onDelete={handleDelete}
            onEdit={(card, colId) => setModal({ type: "edit", columnId: colId, card })}
            onAddCard={(colId) => setModal({ type: "add", columnId: colId })}
          />
        ))}
      </main>
      {modal && (
        <Modal
          title={modal.type === "add" ? `Add to ${data.columns[modal.columnId].title}` : "Edit Card"}
          onClose={() => setModal(null)}
        >
          <CardForm initial={modal.card} onSave={handleSave} onClose={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}
