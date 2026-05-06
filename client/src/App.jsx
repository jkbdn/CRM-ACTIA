import React, { useEffect, useMemo, useRef, useState } from "react";
import Layout from "./components/Layout.jsx";
import Toast from "./components/Toast.jsx";
import Dashboard from "./views/Dashboard.jsx";
import Contacts from "./views/Contacts.jsx";
import Opportunities from "./views/Opportunities.jsx";
import Pipeline from "./views/Pipeline.jsx";
import Tasks from "./views/Tasks.jsx";
import { FALLBACK_META } from "./constants.js";
import { api } from "./api.js";

const views = {
  dashboard: Dashboard,
  contacts: Contacts,
  opportunities: Opportunities,
  pipeline: Pipeline,
  tasks: Tasks
};

export default function App() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [meta, setMeta] = useState(FALLBACK_META);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    api
      .meta()
      .then(setMeta)
      .catch(() => setMeta(FALLBACK_META));
  }, []);

  const notify = (type, message) => {
    setToast({ type, message });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  };

  const ActiveView = useMemo(() => views[currentView] || Dashboard, [currentView]);

  return (
    <>
      <Layout currentView={currentView} onViewChange={setCurrentView}>
        <ActiveView meta={meta} notify={notify} />
      </Layout>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
