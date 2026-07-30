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
      setToast({ type: "info", message: `New request: ${latestNormal.phrase || "Patient needs attention"}` });
    }
  }, [patientStatuses]);

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
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pt-10 md:pt-0">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-100 mb-1 tracking-tight">
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
                    return (
                      <div key={pId} className={`p-4 rounded-xl border ${bgColor} flex items-center justify-between`}>
                        <div>
                          <h3 className="font-medium text-zinc-200">Patient UID: {pId.slice(0,6)}...</h3>
                          <p className={`text-sm ${textColor}`}>Status: {statusData.status}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Live Feed */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col max-h-[700px]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-base font-medium text-zinc-200 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Live Request Feed
                  </h2>
                </div>
                <CommandFeed />
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
