import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface AnalyticsEntry {
  id: string;
  signal: string;
  state: string;
  timestamp: string;
  user: string;
}

const AnalyticsDashboard: React.FC = () => {
  const [entries, setEntries] = useState<AnalyticsEntry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, 'analytics'));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AnalyticsEntry[];

      setEntries(data.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>📊 Traffic Analytics</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Signal</th>
            <th>State</th>
            <th>Timestamp</th>
            <th>User</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.signal}</td>
              <td>{entry.state}</td>
              <td>{new Date(entry.timestamp).toLocaleString()}</td>
              <td>{entry.user}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AnalyticsDashboard;
