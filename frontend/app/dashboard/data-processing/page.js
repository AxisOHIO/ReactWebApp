'use client';

import { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const DataProcessingPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/upload?action=getall');
      
      if (res.ok) {
        const data = await res.json();
        setJsonData(data);
        
        setTimeout(() => {
          createChart(data);
        }, 100);
      } else {
        const errorData = await res.json();
        setError(errorData.error);
      }
    } catch (err) {
      setError('Failed to fetch posture data');
    } finally {
      setLoading(false);
    }
  };

  const createChart = (data) => {
    if (!chartRef.current) {
      console.error('Chart canvas not found');
      return;
    }

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    const sessions = data.sessions;
    
    console.log('Creating chart with data:', sessions);
    
    // Divide sessions into 10 equal groups
    const numGroups = 10;
    const groupSize = Math.ceil(sessions.length / numGroups);
    
    const labels = [];
    const goodData = [];
    const moderateData = [];
    const badData = [];
    
    for (let i = 0; i < numGroups; i++) {
      const start = i * groupSize;
      const end = Math.min(start + groupSize, sessions.length);
      const group = sessions.slice(start, end);
      
      if (group.length === 0) break;
      
      // Create label from first timestamp in group
      const startTime = new Date(group[0].timestamp);
      labels.push(startTime.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }));
      
      // Count statuses in this group
      const goodCount = group.filter(s => s.status === 'good').length;
      const moderateCount = group.filter(s => s.status === 'moderate').length;
      const badCount = group.filter(s => s.status === 'bad').length;
      
      goodData.push(goodCount);
      moderateData.push(moderateCount);
      badData.push(badCount);
    }

    console.log('Chart data:', { labels, goodData, moderateData, badData });

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Good',
            data: goodData,
            backgroundColor: '#10b981',
            borderColor: '#059669',
            borderWidth: 1
          },
          {
            label: 'Moderate',
            data: moderateData,
            backgroundColor: '#f59e0b',
            borderColor: '#d97706',
            borderWidth: 1
          },
          {
            label: 'Bad',
            data: badData,
            backgroundColor: '#ef4444',
            borderColor: '#dc2626',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Posture Status Frequency Over Time'
          },
          legend: {
            position: 'top'
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time'
            },
            ticks: {
              maxRotation: 45,
              minRotation: 0
            },
            grid: {
              display: true,
              color: '#e5e7eb',
              lineWidth: 1
            }
          },
          y: {
            title: {
              display: true,
              text: 'Count'
            },
            beginAtZero: true
          }
        }
      }
    });
  };

  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Access JSON Data from S3</h1>
          <p className="text-gray-700 mb-6">Fetch and combine all JSON files from posture folder</p>
          
          <button
            onClick={fetchData}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Fetching...' : 'Fetch All Posture Data'}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {jsonData && (
            <div className="mt-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-3 text-gray-900">Posture Status Chart:</h2>
                <div className="bg-white p-4 rounded border" style={{ height: '400px' }}>
                  <canvas ref={chartRef}></canvas>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-3 text-gray-900">Raw JSON Data:</h2>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96 text-gray-900">
                  {JSON.stringify(jsonData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataProcessingPage;