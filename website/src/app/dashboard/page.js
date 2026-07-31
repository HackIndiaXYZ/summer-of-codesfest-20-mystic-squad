"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, ShieldAlert } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import CommandFeed from "@/components/CommandFeed";
import CommandHistoryTable from "@/components/CommandHistoryTable";
import PatientProfileHeader from "@/components/PatientProfileHeader";
import EmergencyAlertBanner from "@/components/EmergencyAlertBanner";

import { useAuth } from "@/hooks/useAuth";
import { useCommands } from "@/hooks/useCommands";
import { useDevice } from "@/hooks/useDevice";
import Toast from "@/components/Toast";
import { format } from "date-fns";
import { ref, onValue, query, limitToLast } from "firebase/database";
import { database } from "@/lib/firebase";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [toast, setToast] = useState(null);

  // Active Emergency State
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [patientStatuses, setPatientStatuses] = useState({});
  const [lastSeenNormalId, setLastSeenNormalId] = useState(null);

  const { commands } = useCommands(assignedPatients, isAdmin);

  // --- PREVIEW MOCK MODE ---
  const activeUser = user || {
    uid: "mock-123",
    email: "dr.vance@echogaze.org",
    displayName: "Guest (Preview Mode)",
  };

  useEffect(() => {
    if (!database) return;
    if (!user || user.isAnonymous) {
      setIsAdmin(true); // Mock admin for preview
      return;
    }
    const roleRef = ref(database, `roles/${user.uid}/role`);
    const unsubscribe = onValue(roleRef, (snapshot) => {
      setIsAdmin(snapshot.val() === "admin");
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!database) return;
    if (!user || user.isAnonymous) {
      // For preview mode, show all users in the DB
      const usersRef = ref(database, 'users');
      const unsub = onValue(usersRef, (snapshot) => {
        if (snapshot.exists()) {
           setAssignedPatients(Object.keys(snapshot.val()));
        } else {
           setAssignedPatients(["ECHO-001"]); // Fallback mock
        }
      });
      return () => unsub();
    }
    const assignmentsRef = ref(database, `assignments/${user.uid}`);
    const unsubscribe = onValue(assignmentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const pIds = Object.keys(data).filter(k => data[k] === true);
        setAssignedPatients(pIds);
      } else {
        setAssignedPatients([]);
      }
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!database || assignedPatients.length === 0) return;
    const unsubs = [];
    
    assignedPatients.forEach(pId => {
      const pCommandsRef = query(ref(database, `users/${pId}/commands`), limitToLast(1));
      const u = onValue(pCommandsRef, (snapshot) => {
        let status = "Stable";
        let latestCmd = null;
        if (snapshot.exists()) {
          const data = snapshot.val();
          const keys = Object.keys(data);
          latestCmd = data[keys[0]];
          
          if (latestCmd && Date.now() - latestCmd.timestamp < 300000) {
            if (latestCmd.status === "EMERGENCY" || latestCmd.category === "Emergency") {
              status = "Emergency";
            } else {
              status = "Normal Request";
            }
          }
        }
        
        setPatientStatuses(prev => ({
          ...prev,
          [pId]: { status, latestCmd }
        }));
      });
      unsubs.push(u);
    });

    return () => unsubs.forEach(u => u());
  }, [assignedPatients]);

  useEffect(() => {
    const emergencyPatients = Object.values(patientStatuses).filter(p => p.status === "Emergency");
    if (emergencyPatients.length > 0) {
      setActiveEmergency(emergencyPatients[0].latestCmd);
    } else {
      setActiveEmergency(null);
    }
    
    const normalPatients = Object.values(patientStatuses).filter(p => p.status === "Normal Request");
    if (normalPatients.length > 0) {
      const latestNormal = normalPatients.sort((a,b) => b.latestCmd.timestamp - a.latestCmd.timestamp)[0].latestCmd;
      
      // Use Firebase Push ID native chronological sorting to avoid timestamp bugs
      if (latestNormal.id !== lastSeenNormalId) {
        setLastSeenNormalId(latestNormal.id);
        
        const rawPhrase = latestNormal.phrase || "assistance";
        const patientId = latestNormal.device_id || "Unknown";
        
        setToast({ 
          type: "info", 
          message: `Patient ${patientId.substring(0, 8)} in Room 302 requested: "${rawPhrase}"` 
        });
      }
    }
  }, [patientStatuses, lastSeenNormalId]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-zinc-800 border-t-zinc-400 rounded-full animate-spin" />
      </div>
    );
  }


  return (
    <div className="min-h-screen flex bg-zinc-950 text-zinc-100 font-inter relative overflow-hidden">
      <div className="relative z-10 w-full flex">
        {/* Emergency Siren Alert Banner */}
        <EmergencyAlertBanner
          emergencyData={activeEmergency}
          onAcknowledge={() => setActiveEmergency(null)}
        />

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={isAdmin} />

      <main className="flex-1 overflow-y-auto w-full md:w-auto">
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-up">
          
          {/* Dashboard Header */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pt-10 md:pt-0 pb-4 border-b border-white/5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none"></div>
              <h1 className="relative text-3xl font-bold text-zinc-100 mb-1 tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
                {activeTab === "overview" && "Patient Monitoring & Admin Dashboard"}
                {activeTab === "analytics" && "AI Intent & Clinical Vitals"}
                {activeTab === "devices" && "Connected Devices & Hardware"}
                {activeTab === "history" && "Command History & Audit Logs"}
                {activeTab === "settings" && "Account & Facility Settings"}
              </h1>
              <p className="text-zinc-500 text-sm">
                {format(new Date(), "EEEE, MMMM do, yyyy")} • GSSoC AAC Caregiver Console
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <div className="text-sm font-medium text-zinc-200">{activeUser.displayName || activeUser.email}</div>
                <div className="text-xs text-zinc-500">Attending Caregiver</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 font-medium shadow-sm">
                {(activeUser.displayName || activeUser.email || "U").charAt(0).toUpperCase()}
              </div>
            </div>
          </header>

          {/* Patient Profile Header */}
          <PatientProfileHeader user={activeUser} emergencyCount={activeEmergency ? 1 : 0} />

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {assignedPatients.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {assignedPatients.map(pId => {
                    const statusData = patientStatuses[pId] || { status: "Stable" };
                    const bgColor = statusData.status === "Emergency" ? "bg-red-500/20 border-red-500/50" : 
                                    statusData.status === "Normal Request" ? "bg-yellow-500/20 border-yellow-500/50" : 
                                    "bg-green-500/10 border-green-500/30";
                    const textColor = statusData.status === "Emergency" ? "text-red-400" : 
                                      statusData.status === "Normal Request" ? "text-yellow-400" : 
                                      "text-green-400";
                    const glow = statusData.status === "Emergency" ? "group-hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]" : 
                                 statusData.status === "Normal Request" ? "group-hover:shadow-[0_0_20px_rgba(234,179,8,0.2)]" : 
                                 "group-hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]";

                    return (
                      <div key={pId} className={`group p-5 rounded-2xl border ${bgColor} ${glow} flex flex-col justify-between transition-all duration-500 hover:-translate-y-1 hover:bg-opacity-30 relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-zinc-100 text-lg">Patient: {pId.slice(0,6)}</h3>
                          <div className={`w-2 h-2 rounded-full ${statusData.status === "Emergency" ? "bg-red-500 animate-pulse" : statusData.status === "Normal Request" ? "bg-yellow-500" : "bg-green-500"}`}></div>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <p className={`text-sm font-medium ${textColor} px-2 py-1 bg-black/20 rounded-md backdrop-blur-sm inline-block`}>{statusData.status}</p>
                          <span className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">View Details &rarr;</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Live Feed */}
              <div className="group bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl p-6 md:p-8 flex flex-col max-h-[700px] transition-colors duration-500 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent pointer-events-none group-hover:via-blue-500/40 transition-all duration-700"></div>
                <div className="flex justify-between items-center mb-6 relative z-10">
                  <h2 className="text-base font-medium text-zinc-200 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Live Request Feed
                  </h2>
                </div>
                <CommandFeed commands={commands} loading={!commands} />
              </div>
            </div>
          )}



          {/* HISTORY TAB */}
          {activeTab === "history" && (
            <div className="animate-fade-up">
              <CommandHistoryTable commands={commands} />
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="max-w-2xl space-y-6 animate-fade-up">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                <h2 className="text-base font-medium text-zinc-200 mb-6">Caregiver & Facility Profile</h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-2">Caretaker Email</label>
                    <div className="text-zinc-200 bg-zinc-950 px-4 py-3 rounded-xl border border-zinc-800">
                      {activeUser.email}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-2">Caregiver Name</label>
                    <div className="text-zinc-200 bg-zinc-950 px-4 py-3 rounded-xl border border-zinc-800">
                      {activeUser.displayName || "Guest (Preview Mode)"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 relative overflow-hidden">
                <h2 className="text-base font-medium text-red-400 mb-2 relative z-10">Facility Danger Zone</h2>
                <p className="text-sm text-zinc-400 mb-6 relative z-10">Resetting patient profile or unpairing devices is permanent.</p>
                <button className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-6 py-2.5 rounded-lg font-medium transition-colors relative z-10 text-sm">
                  Unpair Hardware Device
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      </div>
    </div>
  );
}
