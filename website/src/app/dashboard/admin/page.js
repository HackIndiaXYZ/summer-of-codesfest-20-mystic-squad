"use client";
import { useState, useEffect } from "react";
import { database } from "@/lib/firebase";
import { ref, set, push, onValue, update } from "firebase/database";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { ShieldAlert, Plus, Users, Link as LinkIcon } from "lucide-react";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);

  // Caretaker form state
  const [caretakerEmail, setCaretakerEmail] = useState("");
  const [caretakerName, setCaretakerName] = useState("");

  // Assignment form state
  const [patientUid, setPatientUid] = useState("");
  const [caretakerUid, setCaretakerUid] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
      return;
    }
    if (user) {
      const roleRef = ref(database, `roles/${user.uid}/role`);
      onValue(roleRef, (snapshot) => {
        if (snapshot.val() === "admin") {
          setIsAdmin(true);
        } else {
          router.push("/dashboard");
        }
        setRoleLoading(false);
      });
    }
  }, [user, authLoading, router]);

  const handleCreateCaretaker = async (e) => {
    e.preventDefault();
    if (!caretakerEmail || !caretakerName) return;
    
    // Mock user creation
    const fakeUid = "caretaker_" + Date.now();
    
    const updates = {};
    updates[`users/${fakeUid}`] = {
      email: caretakerEmail,
      displayName: caretakerName,
      createdAt: Date.now()
    };
    updates[`roles/${fakeUid}`] = { role: "caretaker" };
    
    try {
      await update(ref(database), updates);
      alert("Mock Caretaker Created! UID: " + fakeUid);
      setCaretakerEmail("");
      setCaretakerName("");
    } catch (err) {
      console.error(err);
      alert("Error creating caretaker");
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!patientUid || !caretakerUid) return;
    
    try {
      await set(ref(database, `assignments/${caretakerUid}/${patientUid}`), true);
      alert("Assigned successfully!");
      setPatientUid("");
      setCaretakerUid("");
    } catch (err) {
      console.error(err);
      alert("Error assigning patient");
    }
  };

  if (authLoading || roleLoading) {
    return <div className="min-h-screen bg-echogaze-bg text-white flex items-center justify-center">Loading...</div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex bg-echogaze-bg text-echogaze-text">
      <Sidebar activeTab="admin" setActiveTab={() => {}} isAdmin={isAdmin} />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <ShieldAlert className="text-echogaze-accent" /> Super Admin Panel
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
              <Plus /> Create Mock Caretaker
            </h2>
            <form onSubmit={handleCreateCaretaker} className="space-y-4">
              <div>
                <label className="block text-sm text-echogaze-muted mb-1">Name</label>
                <input 
                  type="text" 
                  value={caretakerName} 
                  onChange={(e) => setCaretakerName(e.target.value)}
                  className="w-full bg-echogaze-surface border border-echogaze-surface-hover rounded-lg px-4 py-2 text-white" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-echogaze-muted mb-1">Email</label>
                <input 
                  type="email" 
                  value={caretakerEmail} 
                  onChange={(e) => setCaretakerEmail(e.target.value)}
                  className="w-full bg-echogaze-surface border border-echogaze-surface-hover rounded-lg px-4 py-2 text-white" 
                  required
                />
              </div>
              <button type="submit" className="w-full bg-echogaze-accent hover:bg-echogaze-mid text-echogaze-bg font-bold py-2 rounded-lg">
                Create Caretaker
              </button>
            </form>
          </div>

          <div className="glass p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
              <LinkIcon /> Assign Patient to Caretaker
            </h2>
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-sm text-echogaze-muted mb-1">Caretaker UID</label>
                <input 
                  type="text" 
                  value={caretakerUid} 
                  onChange={(e) => setCaretakerUid(e.target.value)}
                  className="w-full bg-echogaze-surface border border-echogaze-surface-hover rounded-lg px-4 py-2 text-white" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-echogaze-muted mb-1">Patient UID</label>
                <input 
                  type="text" 
                  value={patientUid} 
                  onChange={(e) => setPatientUid(e.target.value)}
                  className="w-full bg-echogaze-surface border border-echogaze-surface-hover rounded-lg px-4 py-2 text-white" 
                  required
                />
              </div>
              <button type="submit" className="w-full bg-echogaze-accent hover:bg-echogaze-mid text-echogaze-bg font-bold py-2 rounded-lg">
                Assign Patient
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
