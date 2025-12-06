import React from "react";

export default function ThingsToDo({ todos = [], onToggleDone = () => {}, onRemove = () => {} }) {
  return (
    <div>
      {Array.isArray(todos) && todos.length > 0 ? (
        <ul className="space-y-2">
          {todos.map((t, i) => (
            <li key={t.xid || t.title || i} className="flex items-center justify-between p-3 bg-white rounded shadow">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={!!t.done}
                  onChange={() => onToggleDone(t)}
                  className="w-4 h-4"
                />
                <div>
                  <div className="font-medium">{t.title}</div>
                  {t.kinds && <div className="text-xs text-gray-500">{t.kinds}</div>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onRemove(t)} className="text-sm text-red-600">Remove</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-gray-500">No items in this itinerary yet.</div>
      )}
    </div>
  );
}
