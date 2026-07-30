import { useState, useEffect } from 'react';
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from './useAuth';

export function useCommands() {
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!database) {
      setLoading(false);
      setCommands([]);
      return;
    }

    if (!user) {
      // PREVIEW MODE: Listen to ALL users' commands
      const usersRef = ref(database, 'users');
      const unsubscribe = onValue(usersRef, (snapshot) => {
        if (snapshot.exists()) {
          const usersData = snapshot.val();
          let allCommands = [];
          const EPOCH_2020 = 1577836800000; // Jan 1, 2020 in ms
          
          Object.keys(usersData).forEach(uid => {
            const userCommands = usersData[uid].commands;
            if (userCommands) {
              const formatted = Object.keys(userCommands).map(cmdId => {
                const cmd = userCommands[cmdId];
                // ESP32 sends millis() (uptime), not epoch. Fix timestamps.
                const ts = cmd.timestamp && cmd.timestamp > EPOCH_2020 ? cmd.timestamp : Date.now();
                return {
                  id: cmdId,
                  ...cmd,
                  timestamp: ts,
                  device_id: cmd.device_id || uid
                };
              });
              allCommands = [...allCommands, ...formatted];
            }
          });
          
          allCommands.sort((a, b) => b.timestamp - a.timestamp);
          setCommands(allCommands);
        } else {
          setCommands([]);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }

    const commandsRef = ref(database, `users/${user.uid}/commands`);
    const q = query(commandsRef, orderByChild('timestamp'), limitToLast(50));

    const unsubscribe = onValue(q, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const formattedCommands = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => b.timestamp - a.timestamp); // newest first
        setCommands(formattedCommands);
      } else {
        setCommands([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { commands, loading };
}
