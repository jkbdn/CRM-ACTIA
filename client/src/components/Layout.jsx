import React from "react";
import { BarChart3, BriefcaseBusiness, CheckSquare, KanbanSquare, Users } from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "contacts", label: "Contactos", icon: Users },
  { id: "opportunities", label: "Oportunidades", icon: BriefcaseBusiness },
  { id: "pipeline", label: "Pipeline", icon: KanbanSquare },
  { id: "tasks", label: "Tareas", icon: CheckSquare }
];

export default function Layout({ currentView, onViewChange, children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">EA</span>
          <div>
            <strong>Estudio CRM</strong>
            <span>Arquitectura</span>
          </div>
        </div>
        <nav className="nav-list" aria-label="Navegación principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={currentView === item.id ? "nav-item active" : "nav-item"}
                onClick={() => onViewChange(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
