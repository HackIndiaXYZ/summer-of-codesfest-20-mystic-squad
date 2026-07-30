import { useState, useEffect } from 'react';
import { ref, onValue, set, remove, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from './useAuth';

export function useDevice() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!database || !user) {
      setLoading(false);
      setDevices([]);
      return;
    }

    const devicesRef = ref(database, `users/${user.uid}/devices`);
    const unsubscribe = onValue(devicesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const formattedDevices = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setDevices(formattedDevices);
      } else {
        setDevices([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const pairDevice = async (hardwareId) => {
    if (!user || !database) return { error: 'Not authenticated' };
    try {
      const deviceRef = ref(database, `users/${user.uid}/devices/${hardwareId}`);
      await set(deviceRef, {
        pairedAt: Date.now(),
        status: 'online',
        lastSeen: Date.now(),
        firmwareVersion: '1.0.0',
        config: {
          scanSpeed: 50,
          sensitivity: 50
        }
      });
      return { success: true };
    } catch (err) {
      return { error: err.message };
    }
  };

  const unpairDevice = async (hardwareId) => {
    if (!user || !database) return { error: 'Not authenticated' };
    try {
      const deviceRef = ref(database, `users/${user.uid}/devices/${hardwareId}`);
      await remove(deviceRef);
      return { success: true };
    } catch (err) {
      return { error: err.message };
    }
  };

  const updateConfig = async (hardwareId, config) => {
    if (!user || !database) return { error: 'Not authenticated' };
    try {
      const configRef = ref(database, `users/${user.uid}/devices/${hardwareId}/config`);
      await update(configRef, config);
      return { success: true };
    } catch (err) {
      return { error: err.message };
    }
  };

  return { devices, loading, pairDevice, unpairDevice, updateConfig };
}
