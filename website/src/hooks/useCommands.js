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

    // If no user or admin, fetch from ALL users but use optimized queries
    if (!user || isAdmin) {
      const usersRef = ref(database, 'users');
      const unsubscribe = onValue(usersRef, (snapshot) => {
        if (!snapshot.exists()) {
          setCommands([]);
          setLoading(false);
          return;
        }
        
        const usersData = snapshot.val();
        let allCommands = [];
        
        Object.keys(usersData).forEach(uid => {
          const userCommands = usersData[uid].commands;
          if (userCommands) {
            // Convert to array and take only the last 50 commands per user for performance
            const cmdKeys = Object.keys(userCommands);
            const recentKeys = cmdKeys.slice(-50);
            
            const formatted = recentKeys.map(cmdId => {
              const cmd = userCommands[cmdId];
              // Use 0 for missing timestamps so they stay at the bottom, not Date.now()
              const ts = (cmd.timestamp && cmd.timestamp > 100000) ? cmd.timestamp : 0;
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
        // Only keep the absolute latest 100 commands for the UI
        setCommands(allCommands.slice(0, 100));
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
          const formatted = Object.keys(data).map(key => {
            const cmd = data[key];
            const ts = (cmd.timestamp && cmd.timestamp > 100000) ? cmd.timestamp : 0;
            return {
              id: key,
              ...cmd,
              timestamp: ts,
              device_id: pId
            };
          });
          
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
