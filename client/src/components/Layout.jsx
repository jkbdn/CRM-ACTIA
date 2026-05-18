import React from "react";
import { BarChart3, BriefcaseBusiness, CheckSquare, KanbanSquare, Users } from "lucide-react";
import logoActia from "../assets/logo-actia.png";

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
          <img className="brand-logo" src={logoActia} alt="ACTIA" />
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
