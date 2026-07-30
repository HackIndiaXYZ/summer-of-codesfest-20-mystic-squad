import { useState, useEffect } from 'react';
import { ref, onValue, set, remove, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from './useAuth';

export function useDevice() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!database) {
      setLoading(false);
      setDevices([]);
      return;
    }

    if (!user) {
      // PREVIEW MODE: Find any deviceStatus/devices under any user
      const usersRef = ref(database, 'users');
      const unsubscribe = onValue(usersRef, (snapshot) => {
        if (snapshot.exists()) {
          const usersData = snapshot.val();
          let allDevices = [];
          
          Object.keys(usersData).forEach(uid => {
            const deviceStatus = usersData[uid].deviceStatus;
            if (deviceStatus) {
               // If Firebase delivers a deviceStatus snapshot, the device has been active
               const isRecent = !!deviceStatus.uptime;
               allDevices.push({
                 id: uid,
                 name: `EchoGaze Unit ${uid.slice(-4)}`,
                 status: isRecent ? 'online' : 'offline',
                 lastSeen: Date.now(), // ESP32 sends millis() (uptime), use current time as "last seen"
                 firmwareVersion: deviceStatus.firmware_version || deviceStatus.firmwareVersion || '3.0.0',
                 battery: 100,
                 wifi_rssi: deviceStatus.wifi_rssi,
                 uptime: deviceStatus.uptime,
                 config: { scanSpeed: 50, sensitivity: 50 }
               });
            }
            const userDevices = usersData[uid].devices;
            if (userDevices) {
              Object.keys(userDevices).forEach(devId => {
                allDevices.push({
                  id: devId,
                  ...userDevices[devId]
                });
              });
            }
          });
          
          setDevices(allDevices);
        } else {
          setDevices([]);
        }
        setLoading(false);
      });
      return () => unsubscribe();
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
