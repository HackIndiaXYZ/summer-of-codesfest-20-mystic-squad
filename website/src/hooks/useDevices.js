"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ref,
  onValue,
  push,
  remove,
  update,
  serverTimestamp,
} from "firebase/database";
import { database } from "@/lib/firebase";

/**
 * Custom hook for device management.
 * Provides pairDevice, unpairDevice, updateConfig functions.
 * Returns { devices, loading, pairDevice, unpairDevice, updateConfig }.
 */
export function useDevices(uid) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setDevices([]);
      setLoading(false);
      return;
    }

    const devicesRef = ref(database, `users/${uid}/devices`);
    const unsubscribe = onValue(
      devicesRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.entries(data).map(([id, value]) => ({
            id,
            ...value,
          }));
          setDevices(list);
        } else {
          setDevices([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching devices:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  const pairDevice = useCallback(
    async (hardwareId) => {
      if (!uid || !hardwareId) return;
      const devicesRef = ref(database, `users/${uid}/devices`);
      await push(devicesRef, {
        hardwareId: hardwareId.trim(),
        pairedAt: serverTimestamp(),
        status: "online",
        lastSeen: serverTimestamp(),
        firmwareVersion: "1.0.0",
        config: {
          scanSpeed: 50,
          sensitivityThreshold: 70,
        },
      });
    },
    [uid]
  );

  const unpairDevice = useCallback(
    async (deviceId) => {
      if (!uid || !deviceId) return;
      const deviceRef = ref(database, `users/${uid}/devices/${deviceId}`);
      await remove(deviceRef);
    },
    [uid]
  );

  const updateConfig = useCallback(
    async (deviceId, config) => {
      if (!uid || !deviceId) return;
      const configRef = ref(
        database,
        `users/${uid}/devices/${deviceId}/config`
      );
      await update(configRef, config);
    },
    [uid]
  );

  return { devices, loading, pairDevice, unpairDevice, updateConfig };
}
