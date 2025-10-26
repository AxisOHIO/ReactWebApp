'use client';

import { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import Header from '../../components/header';

Chart.register(...registerables);

const DataProcessingPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [availableUserIds, setAvailableUserIds] = useState([]);
  const [chartType, setChartType] = useState('individual');
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/upload?action=getall');
      
      if (res.ok) {
        const response = await res.json();
        
        // Extract unique userIds
        const userIds = [...new Set(response.files.map(file => file.userId).filter(Boolean))];
        setAvailableUserIds(userIds);
        
        // Set default userId if not selected
        const defaultUserId = selectedUserId || userIds[0];
        if (!selectedUserId && userIds.length > 0) {
          setSelectedUserId(defaultUserId);
        }
        
        const filteredData = filterDataByUserId(response.files, defaultUserId);
        setJsonData({ files: response.files, filtered: filteredData });
        
        if (chartType === 'individual' && filteredData.sessions && filteredData.sessions.length > 0) {
          setTimeout(() => {
            const chartData = generateChartData(filteredData.sessions);
            createChart(chartData);
          }, 100);
        } else if (chartType === 'multiuser') {
          setTimeout(() => {
            const chartData = generateMultiUserChartData(response.files);
            createMultiUserChart(chartData);
          }, 100);
        }
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

  const handleUserIdChange = (userId) => {
    setSelectedUserId(userId);
    if (jsonData) {
      const filteredData = filterDataByUserId(jsonData.files, userId);
      setJsonData({ ...jsonData, filtered: filteredData });
      
      if (chartType === 'individual') {
        if (filteredData.sessions && filteredData.sessions.length > 0) {
          setTimeout(() => {
            const chartData = generateChartData(filteredData.sessions);
            createChart(chartData);
          }, 100);
        } else {
          if (chartInstance.current) {
            chartInstance.current.destroy();
            chartInstance.current = null;
          }
        }
      }
    }
  };

  const filterDataByUserId = (files, targetUserId) => {
    // Find files that match the target userId
    const matchingFiles = files.filter(file => file.userId === targetUserId);
    
    if (matchingFiles.length === 0) {
      return { userId: targetUserId, sessions: [] };
    }
    
    // Combine sessions from matching files
    const allSessions = [];
    matchingFiles.forEach(file => {
      if (file.sessions) {
        allSessions.push(...file.sessions);
      }
    });
    
    // Sort combined sessions by timestamp
    allSessions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    return { userId: targetUserId, sessions: allSessions };
  };

  const generateChartData = (sessions) => {
    const numGroups = 10;
    const groupSize = Math.ceil(sessions.length / numGroups);
    
    const labels = [];
    const goodData = [];
    const badData = [];
    
    for (let i = 0; i < numGroups; i++) {
      const start = i * groupSize;
      const end = Math.min(start + groupSize, sessions.length);
      const group = sessions.slice(start, end);
      
      if (group.length === 0) break;
      
      const startTime = new Date(group[0].timestamp);
      labels.push(startTime.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }));
      
      const goodCount = group.filter(s => s.status === 'good').length;
      const badCount = group.filter(s => s.status === 'bad' || s.status === 'moderate').length;
      const total = goodCount + badCount;
      
      const goodPercentage = total > 0 ? (goodCount / total) * 100 : 0;
      const badPercentage = total > 0 ? (badCount / total) * 100 : 0;
      
      goodData.push(goodPercentage);
      badData.push(badPercentage);
    }
    
    return { labels, goodData, badData };
  };

  const generateMultiUserChartData = (files) => {
    const userDataMap = {};
    
    // Group sessions by userId
    files.forEach(file => {
      if (file.userId && file.sessions) {
        if (!userDataMap[file.userId]) {
          userDataMap[file.userId] = [];
        }
        userDataMap[file.userId].push(...file.sessions);
      }
    });
    
    const numGroups = 10;
    const labels = [];
    const datasets = [];
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];
    
    // Generate time labels based on first user's data
    const firstUserId = Object.keys(userDataMap)[0];
    if (firstUserId) {
      const sessions = userDataMap[firstUserId].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      const groupSize = Math.ceil(sessions.length / numGroups);
      
      for (let i = 0; i < numGroups; i++) {
        const start = i * groupSize;
        const group = sessions.slice(start, start + groupSize);
        if (group.length > 0) {
          const startTime = new Date(group[0].timestamp);
          labels.push(startTime.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          }));
        }
      }
    }
    
    // Generate dataset for each user
    Object.keys(userDataMap).forEach((userId, index) => {
      const sessions = userDataMap[userId].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      const groupSize = Math.ceil(sessions.length / numGroups);
      const goodData = [];
      
      for (let i = 0; i < numGroups; i++) {
        const start = i * groupSize;
        const end = Math.min(start + groupSize, sessions.length);
        const group = sessions.slice(start, end);
        const goodCount = group.filter(s => s.status === 'good').length;
        const badCount = group.filter(s => s.status === 'bad' || s.status === 'moderate').length;
        const total = goodCount + badCount;
        
        const goodPercentage = total > 0 ? (goodCount / total) * 100 : 0;
        goodData.push(goodPercentage);
      }
      
      datasets.push({
        label: userId,
        data: goodData,
        borderColor: colors[index % colors.length],
        backgroundColor: `${colors[index % colors.length]}20`,
        borderWidth: 2,
        fill: false,
        tension: 0.1
      });
    });
    
    return { labels, datasets };
  };

  const createChart = (chartData) => {
    if (!chartRef.current) {
      console.error('Chart canvas not found');
      return;
    }

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Good',
            data: chartData.goodData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.1
          },
          {
            label: 'Bad',
            data: chartData.badData,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Posture Status Frequency Over Time',
            color: 'white'
          },
          legend: {
            position: 'top',
            labels: {
              color: 'white'
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time',
              color: 'white'
            },
            ticks: {
              maxRotation: 45,
              minRotation: 0,
              color: 'white'
            },
            grid: {
              display: true,
              color: 'rgba(255, 255, 255, 0.2)',
              lineWidth: 1
            }
          },
          y: {
            title: {
              display: true,
              text: 'Percentage (%)',
              color: 'white'
            },
            ticks: {
              color: 'white'
            },
            beginAtZero: true,
            max: 100,
            grid: {
              color: 'rgba(255, 255, 255, 0.2)'
            }
          }
        }
      }
    });
  };

  const createMultiUserChart = (chartData) => {
    if (!chartRef.current) {
      console.error('Chart canvas not found');
      return;
    }

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: chartData.datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Good Posture Comparison Across Users',
            color: 'white'
          },
          legend: {
            position: 'top',
            labels: {
              color: 'white'
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time',
              color: 'white'
            },
            ticks: {
              maxRotation: 45,
              minRotation: 0,
              color: 'white'
            },
            grid: {
              display: true,
              color: 'rgba(255, 255, 255, 0.2)',
              lineWidth: 1
            }
          },
          y: {
            title: {
              display: true,
              text: 'Good Posture (%)',
              color: 'white'
            },
            ticks: {
              color: 'white'
            },
            beginAtZero: true,
            max: 100,
            grid: {
              color: 'rgba(255, 255, 255, 0.2)'
            }
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
    <div className="min-h-screen bg-black">
      <Header />
      <div className="p-6 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className={`liquid-glass rounded-2xl p-8 ${loading ? 'loading' : ''}`}>
          <h1 className="text-2xl font-bold mb-4 text-white">Access JSON Data from S3</h1>
          <p className="text-white/80 mb-6 italic">find your <span className="italic">balance</span></p>
          
          <button
            onClick={fetchData}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center"
          >
            {loading && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading ? 'Fetching...' : 'Fetch All Posture Data'}
          </button>

          {availableUserIds.length > 0 && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Chart Type:
                </label>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  className="inline-block p-2 bg-black border border-white/30 rounded text-white focus:ring-2 focus:ring-white/50 focus:border-white/50 mr-4"
                >
                  <option value="individual">Individual User</option>
                  <option value="multiuser">All Users (Good Posture)</option>
                </select>
              </div>
              
              {chartType === 'individual' && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Select User ID:
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => handleUserIdChange(e.target.value)}
                    className="inline-block p-2 bg-black border border-white/30 rounded text-white focus:ring-2 focus:ring-white/50 focus:border-white/50"
                  >
                    {availableUserIds.map(userId => (
                      <option key={userId} value={userId}>{userId}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {jsonData && (
            <div className="mt-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-3 text-white">Posture Status Chart:</h2>
                <div className="bg-black/30 border border-white/20 p-4 rounded" style={{ height: '400px' }}>
                  <canvas ref={chartRef}></canvas>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-3 text-white">Raw JSON Data:</h2>
                <pre className="bg-black/30 border border-white/20 p-4 rounded text-sm overflow-auto max-h-96 text-white">
                  {JSON.stringify(jsonData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default DataProcessingPage;