"use client";
import { useState, useEffect } from "react";
import { database } from "@/lib/firebase";
import { ref, set, onValue, update } from "firebase/database";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { ShieldAlert, Plus, Users, Link as LinkIcon, AlertCircle, CheckCircle2, UserPlus, FileEdit } from "lucide-react";
import Toast from "@/components/Toast";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);

  // Live Data State
  const [allUsers, setAllUsers] = useState({});
  const [allRoles, setAllRoles] = useState({});
  
  // UI State
  const [toast, setToast] = useState(null);

  // Profile form state
  const [profileEmail, setProfileEmail] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profileRole, setProfileRole] = useState("caretaker");
  const [isCreating, setIsCreating] = useState(false);

  // Assignment form state
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedCaretakerId, setSelectedCaretakerId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      if (user.isAnonymous) {
        setIsAdmin(true);
        setRoleLoading(false);
        return;
      }
      const roleRef = ref(database, `roles/${user.uid}/role`);
      const unsub = onValue(roleRef, (snapshot) => {
        if (snapshot.val() === "admin") {
          setIsAdmin(true);
        } else {
          router.push("/dashboard");
        }
        setRoleLoading(false);
      });
      return () => unsub();
    }
  }, [user, authLoading, router]);

  // Fetch Live Users and Roles
  useEffect(() => {
    if (!database) return;
    const usersRef = ref(database, 'users');
    const rolesRef = ref(database, 'roles');
    
    const unsubUsers = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        setAllUsers(snapshot.val());
      } else {
        setAllUsers({});
      }
    });
    
    const unsubRoles = onValue(rolesRef, (snapshot) => {
      if (snapshot.exists()) {
        setAllRoles(snapshot.val());
      } else {
        setAllRoles({});
      }
    });
    
    return () => {
      unsubUsers();
      unsubRoles();
    };
  }, []);

  const caretakers = Object.entries(allRoles)
    .filter(([uid, data]) => data.role === "caretaker")
    .map(([uid]) => ({ uid, ...allUsers[uid] }));
    
  const patients = Object.entries(allRoles)
    .filter(([uid, data]) => data.role === "patient")
    .map(([uid]) => ({ uid, ...allUsers[uid] }));

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    if (!profileEmail || !profileName) return;
    setIsCreating(true);
    
    // Generate a DB ID if we aren't hooking into Firebase Auth creation directly
    const newUid = profileRole === "patient" ? "pat_" + Date.now() : "care_" + Date.now();
    
    const updates = {};
    updates[`users/${newUid}`] = {
      email: profileEmail,
      displayName: profileName,
      createdAt: Date.now()
    };
    updates[`roles/${newUid}`] = { role: profileRole };
    
    try {
      await update(ref(database), updates);
      setToast({ type: "success", message: `Profile created successfully!` });
      setProfileEmail("");
      setProfileName("");
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Failed to create profile." });
    }
    setIsCreating(false);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedCaretakerId) return;
    setIsAssigning(true);
    
    try {
      await set(ref(database, `assignments/${selectedCaretakerId}/${selectedPatientId}`), true);
      setToast({ type: "success", message: "Patient assigned successfully!" });
      setSelectedPatientId("");
      setSelectedCaretakerId("");
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Failed to assign patient." });
    }
    setIsAssigning(false);
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-zinc-800 border-t-zinc-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex bg-zinc-950 text-zinc-100 font-inter">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      <Sidebar activeTab="admin" setActiveTab={() => {}} isAdmin={isAdmin} />
      
      <main className="flex-1 p-6 md:p-10 overflow-y-auto w-full">
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-up">
          
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pt-10 md:pt-0">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-100 mb-1 tracking-tight flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-blue-400" /> Facility Administration
              </h1>
              <p className="text-zinc-500 text-sm">Manage caretaker assignments and patient profiles securely.</p>
            </div>
          </header>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10"><Users className="w-16 h-16" /></div>
                <div className="text-zinc-400 font-medium text-sm">Total Caretakers</div>
                <div className="text-3xl font-bold text-white">{caretakers.length}</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10"><UserPlus className="w-16 h-16" /></div>
                <div className="text-zinc-400 font-medium text-sm">Total Patients</div>
                <div className="text-3xl font-bold text-white">{patients.length}</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10"><LinkIcon className="w-16 h-16" /></div>
                <div className="text-zinc-400 font-medium text-sm">System Status</div>
                <div className="text-xl font-bold text-green-400 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                    Operational
                </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-8">
            {/* Create Profile Card */}
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
              <h2 className="text-lg font-medium text-zinc-200 flex items-center gap-2 mb-6">
                <FileEdit className="w-5 h-5 text-zinc-400" /> Create DB Profile
              </h2>
              <form onSubmit={handleCreateProfile} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-2">Role Type</label>
                  <select
                    value={profileRole}
                    onChange={(e) => setProfileRole(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-zinc-600 transition-colors"
                  >
                    <option value="caretaker">Caretaker</option>
                    <option value="patient">Patient</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Dr. Smith"
                    value={profileName} 
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="name@facility.com"
                    value={profileEmail} 
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors" 
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isCreating}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 mt-4"
                >
                  {isCreating ? "Creating..." : "Create Profile"}
                </button>
              </form>
            </div>

            {/* Assignment Card */}
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
              <h2 className="text-lg font-medium text-zinc-200 flex items-center gap-2 mb-6">
                <LinkIcon className="w-5 h-5 text-zinc-400" /> Assign Patient to Caretaker
              </h2>
              <form onSubmit={handleAssign} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-2">Select Caretaker</label>
                  <div className="relative">
                    <select
                      value={selectedCaretakerId}
                      onChange={(e) => setSelectedCaretakerId(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 appearance-none focus:outline-none focus:border-zinc-600 transition-colors"
                      required
                    >
                      <option value="" disabled>Choose a Caretaker...</option>
                      {caretakers.map((c) => (
                        <option key={c.uid} value={c.uid}>
                          {c.displayName || c.email} ({c.uid.slice(0,8)}...)
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-2">Select Patient</label>
                  <div className="relative">
                    <select
                      value={selectedPatientId}
                      onChange={(e) => setSelectedPatientId(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 appearance-none focus:outline-none focus:border-zinc-600 transition-colors"
                      required
                    >
                      <option value="" disabled>Choose a Patient...</option>
                      {patients.map((p) => (
                        <option key={p.uid} value={p.uid}>
                          {p.displayName || p.email || "Unknown"} ({p.uid.slice(0,8)}...)
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-2">
                  <p className="text-xs text-blue-400 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    Assigning a patient will allow the caretaker to monitor their assistive commands and SOS requests in real-time.
                  </p>
                </div>

                <button 
                  type="submit" 
                  disabled={isAssigning || !selectedCaretakerId || !selectedPatientId}
                  className="w-full bg-zinc-100 hover:bg-white text-zinc-900 font-medium py-3 rounded-xl transition-colors disabled:opacity-50 mt-4"
                >
                  {isAssigning ? "Assigning..." : "Complete Assignment"}
                </button>
              </form>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-zinc-900 text-center text-xs text-zinc-600">
            EchoGaze Facility Administration System &copy; {new Date().getFullYear()}
          </div>

        </div>
      </main>
    </div>
  );
}
