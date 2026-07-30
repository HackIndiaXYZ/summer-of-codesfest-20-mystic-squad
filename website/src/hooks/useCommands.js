import { useState, useEffect } from 'react';
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from './useAuth';

export function useCommands() {
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!database || !user) {
      setLoading(false);
      setCommands([]);
      return;
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
