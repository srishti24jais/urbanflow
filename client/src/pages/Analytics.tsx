import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Analytics: React.FC = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const docSnap = await getDoc(doc(db, 'analytics', 'signals'));
      if (docSnap.exists()) {
        const signals = docSnap.data();
        const formatted = Object.keys(signals).map((signal) => ({
          name: `Signal ${signal}`,
          ...signals[signal],
        }));
        setData(formatted);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📊 Traffic Analytics</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="green" fill="#4caf50" />
          <Bar dataKey="yellow" fill="#ffeb3b" />
          <Bar dataKey="red" fill="#f44336" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Analytics;
