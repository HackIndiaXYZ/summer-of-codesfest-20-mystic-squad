import { useState, useEffect } from 'react';
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from './useAuth';

export function useCommands(assignedPatientIds = [], isAdmin = false) {
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!database) {
      setLoading(false);
      setCommands([]);
      return;
    }

    // If no user or admin, fetch from ALL users (Master View)
    if (!user || isAdmin) {
      const usersRef = ref(database, 'users');
      const unsubscribe = onValue(usersRef, (snapshot) => {
        if (snapshot.exists()) {
          const usersData = snapshot.val();
          let allCommands = [];
          const EPOCH_2020 = 1577836800000;
          
          Object.keys(usersData).forEach(uid => {
            const userCommands = usersData[uid].commands;
            if (userCommands) {
              const formatted = Object.keys(userCommands).map(cmdId => {
                const cmd = userCommands[cmdId];
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

    // Caretaker View: Fetch commands only for assigned patients
    if (assignedPatientIds.length === 0) {
      setCommands([]);
      setLoading(false);
      return;
    }

    const unsubs = [];
    let aggregatedCommands = {};

    assignedPatientIds.forEach(pId => {
      const commandsRef = ref(database, `users/${pId}/commands`);
      const q = query(commandsRef, orderByChild('timestamp'), limitToLast(50));
      
      const unsubscribe = onValue(q, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const formatted = Object.keys(data).map(key => ({
            id: key,
            ...data[key],
            device_id: pId
          }));
          
          aggregatedCommands[pId] = formatted;
        } else {
          aggregatedCommands[pId] = [];
        }
        
        // Merge and sort all assigned patients' commands
        let allCommands = [];
        Object.values(aggregatedCommands).forEach(cmds => {
          allCommands = [...allCommands, ...cmds];
        });
        allCommands.sort((a, b) => b.timestamp - a.timestamp);
        
        setCommands(allCommands);
        setLoading(false);
      });
      unsubs.push(unsubscribe);
    });

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [user, isAdmin, assignedPatientIds.join(',')]);

  return { commands, loading };
}
