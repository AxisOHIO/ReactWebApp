'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '../components/header';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const DashboardPage = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [showBackButton, setShowBackButton] = useState(false);
  
  // File Upload State
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  
  // Data Processing State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [availableUserIds, setAvailableUserIds] = useState([]);
  const [chartType, setChartType] = useState('individual');
  const [initialLoading, setInitialLoading] = useState(true);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  
  // Separate chart references for modal and left panel
  const modalChartRef = useRef(null);
  const modalChartInstance = useRef(null);
  
  // Left panel chart for generated charts
  const leftPanelChartRef = useRef(null);
  const leftPanelChartInstance = useRef(null);
  
  // Python Charts State
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [timeframe, setTimeframe] = useState(14);
  const [plotType, setPlotType] = useState(false); // Default to bad cause analysis

  // Navigation functions
  const navigateToSection = (section) => {
    setActiveSection(section);
    setShowBackButton(section !== 'overview');
  };

  const goBack = () => {
    setActiveSection('overview');
    setShowBackButton(false);
  };

  // File Upload Functions
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setUploadError(null);
    setUploadResult(null);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setUploadError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError('Please select a file');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      
      if (res.ok) {
        setUploadResult(data);
        setFile(null);
      } else {
        setUploadError(data.error);
      }
    } catch (err) {
      setUploadError('Network error occurred');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Data Processing Functions
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/upload?action=getall');
      
      if (res.ok) {
        const response = await res.json();
        
        const userIds = [...new Set(response.files.map(file => file.userId).filter(Boolean))];
        setAvailableUserIds(userIds);
        
        const defaultUserId = selectedUserId || userIds[0];
        if (!selectedUserId && userIds.length > 0) {
          setSelectedUserId(defaultUserId);
        }
        
        const filteredData = filterDataByUserId(response.files, defaultUserId);
        setJsonData({ files: response.files, filtered: filteredData });
        
        if (chartType === 'individual' && filteredData.sessions && filteredData.sessions.length > 0) {
          setTimeout(() => {
            const chartData = generateChartData(filteredData.sessions);
            createChart(chartData, false); // Main dashboard chart
            // Also update the left panel chart
            setTimeout(() => {
              createChart(chartData, false);
            }, 200);
          }, 100);
        } else if (chartType === 'multiuser') {
          setTimeout(() => {
            const chartData = generateMultiUserChartData(response.files);
            createMultiUserChart(chartData, false); // Main dashboard chart
            // Also update the left panel chart
            setTimeout(() => {
              createMultiUserChart(chartData, false);
            }, 200);
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
      setInitialLoading(false);
    }
  };

  const filterDataByUserId = (files, targetUserId) => {
    const matchingFiles = files.filter(file => file.userId === targetUserId);
    
    if (matchingFiles.length === 0) {
      return { userId: targetUserId, sessions: [] };
    }
    
    const allSessions = [];
    matchingFiles.forEach(file => {
      if (file.sessions) {
        allSessions.push(...file.sessions);
      }
    });
    
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

  const createChart = (chartData, isModal = false, isLeftPanel = false) => {
    let targetRef, targetInstance;
    if (isLeftPanel) {
      targetRef = leftPanelChartRef;
      targetInstance = leftPanelChartInstance;
    } else if (isModal) {
      targetRef = modalChartRef;
      targetInstance = modalChartInstance;
    } else {
      targetRef = chartRef;
      targetInstance = chartInstance;
    }
    
    if (!targetRef.current) {
      console.error('Chart canvas not found');
      return;
    }

    if (targetInstance.current) {
      targetInstance.current.destroy();
    }

    const ctx = targetRef.current.getContext('2d');
    
    targetInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Good Posture %',
            data: chartData.goodData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Good Posture Percentage Over Time',
            color: 'white',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            position: 'top',
            labels: {
              color: 'white',
              font: {
                size: 12
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time',
              color: 'white',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            ticks: {
              maxRotation: 45,
              minRotation: 0,
              color: 'white'
            },
            grid: {
              display: true,
              color: 'rgba(255, 255, 255, 0.1)',
              lineWidth: 1
            }
          },
          y: {
            title: {
              display: true,
              text: 'Good Posture (%)',
              color: 'white',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            ticks: {
              color: 'white',
              callback: function(value) {
                return value + '%';
              }
            },
            beginAtZero: true,
            max: 100,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        }
      }
    });
  };

  const createMultiUserChart = (chartData, isModal = false, isLeftPanel = false) => {
    let targetRef, targetInstance;
    if (isLeftPanel) {
      targetRef = leftPanelChartRef;
      targetInstance = leftPanelChartInstance;
    } else if (isModal) {
      targetRef = modalChartRef;
      targetInstance = modalChartInstance;
    } else {
      targetRef = chartRef;
      targetInstance = chartInstance;
    }
    
    if (!targetRef.current) {
      console.error('Chart canvas not found');
      return;
    }

    if (targetInstance.current) {
      targetInstance.current.destroy();
    }

    const ctx = targetRef.current.getContext('2d');
    
    targetInstance.current = new Chart(ctx, {
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
            color: 'white',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            position: 'top',
            labels: {
              color: 'white',
              font: {
                size: 12
              }
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
              color: 'white',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            ticks: {
              color: 'white',
              callback: function(value) {
                return value + '%';
              }
            },
            beginAtZero: true,
            max: 100,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        }
      }
    });
  };

  // Python Charts Functions
  const generateChart = async () => {
    setChartLoading(true);
    setChartError(null);

    try {
      const res = await fetch('/api/python-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timeframe, plotType }),
      });

      if (res.ok) {
        const data = await res.json();
        setChartData(data);
        // Clear any existing analysis chart in left panel
        if (leftPanelChartInstance.current) {
          leftPanelChartInstance.current.destroy();
          leftPanelChartInstance.current = null;
        }
      } else {
        const errorData = await res.json();
        setChartError(errorData.error);
      }
    } catch (err) {
      setChartError('Failed to generate chart');
    } finally {
      setChartLoading(false);
    }
  };

  // Auto-load data on component mount
  useEffect(() => {
    fetchData();
    // Auto-generate Python chart with default settings
    generateChart();
  }, []);

  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      if (modalChartInstance.current) {
        modalChartInstance.current.destroy();
      }
      if (leftPanelChartInstance.current) {
        leftPanelChartInstance.current.destroy();
      }
    };
  }, []);

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="text-center mb-12">
        <h1 className="font-serif text-5xl md:text-7xl tracking-tight text-white mb-4">
          Dashboard
        </h1>
        <p className="text-white/60 text-sm font-mono uppercase tracking-wider italic">
          find your <span className="italic">balance</span>
        </p>
      </div>

      {/* Auto-loaded Data Visualization */}
      {jsonData && (
        <div className="space-y-6">
          <h2 className="text-white text-xl font-semibold text-center mb-6">Your Posture Analysis</h2>
          
          {/* Main Analysis Container */}
          <div className="liquid-glass rounded-xl p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Side - Action Buttons and Generated Charts */}
              <div className="space-y-4 flex flex-col h-full">
                {/* Action Buttons Row */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navigateToSection('processing')}
                    className="bg-white/10 text-white py-3 px-3 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-2 border border-white/20"
                  >
                    <span className="text-xl">📊</span>
                    <span className="text-sm">Analyze Data</span>
                  </button>
                  
                  <button
                    onClick={() => navigateToSection('charts')}
                    className="bg-white/10 text-white py-3 px-3 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-2 border border-white/20"
                  >
                    <span className="text-xl">📈</span>
                    <span className="text-sm">Generate Charts</span>
                  </button>
                </div>

                {/* Generated Charts Display - Shows newest chart */}
                <div className="mt-6 flex-1 flex flex-col">
                  {/* Loading State for Charts */}
                  {(chartLoading || (initialLoading && !jsonData && !chartData)) && (
                    <div className="flex-1 flex flex-col justify-center items-center">
                      <div className="bg-black/30 border border-white/20 p-6 rounded-lg flex-1 flex flex-col justify-center items-center">
                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-white/60 text-sm">Generating chart...</p>
                      </div>
                    </div>
                  )}

                  {/* Python Generated Chart - Takes priority */}
                  {chartData && !chartLoading && (
                    <div className="flex-1 flex flex-col">
                      <div className="bg-black/30 border border-white/20 p-3 rounded-lg flex-1 flex flex-col">
                        {chartData.image ? (
                          <img 
                            src={`data:image/png;base64,${chartData.image}`} 
                            alt="Python Generated Chart"
                            className="w-full rounded flex-1 object-contain"
                          />
                        ) : (
                          <div className="text-white text-sm flex-1 overflow-auto">
                            <pre className="text-xs">
                              {JSON.stringify(chartData, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Data Analysis Chart - Shows if no Python chart */}
                  {!chartData && !chartLoading && jsonData && (
                    <div className="flex-1 flex flex-col">
                      <div className="bg-black/30 border border-white/20 p-3 rounded-lg flex-1 flex flex-col">
                        <canvas ref={leftPanelChartRef} className="flex-1"></canvas>
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {!jsonData && !chartData && !chartLoading && !initialLoading && (
                    <div className="text-center py-8 flex-1 flex flex-col justify-center">
                      <div className="text-4xl mb-3">📊</div>
                      <p className="text-white/60 text-sm">Generated charts will appear here</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Chart and Data */}
              <div className="lg:col-span-2 space-y-4">
                {/* Chart */}
                <div>
                  <div className="bg-black/30 border border-white/20 p-4 rounded" style={{ height: '300px' }}>
                    <canvas ref={chartRef}></canvas>
                  </div>
                </div>

                {/* Data Points */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">{jsonData.files?.length || 0}</div>
                    <div className="text-white/60 text-xs">Files</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">{jsonData.filtered?.sessions?.length || 0}</div>
                    <div className="text-white/60 text-xs">Data Points</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">
                      {jsonData.filtered?.sessions ? 
                        Math.round((jsonData.filtered.sessions.filter(s => s.status === 'good').length / jsonData.filtered.sessions.length) * 100) : 0}%
                    </div>
                    <div className="text-white/60 text-xs">Good Posture</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {initialLoading && (
        <div className="flex justify-center">
          <div className="liquid-glass rounded-xl p-8 max-w-md">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-white text-xl font-semibold mb-3">Loading Dashboard</h3>
              <p className="text-white/60 text-sm">Fetching your data...</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Card - Only show when no data exists and not loading */}
      {!jsonData && !initialLoading && (
        <div className="flex justify-center">
          <div 
            className="liquid-glass rounded-xl p-8 hover:bg-white/10 transition-all duration-300 cursor-pointer group max-w-md"
            onClick={() => navigateToSection('upload')}
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-400 text-3xl">📁</span>
              </div>
              <h3 className="text-white text-xl font-semibold mb-3">Upload Data</h3>
              <p className="text-white/60 text-sm mb-4">Add your first posture data file to get started</p>
              <div className="text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                Click to upload →
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );

  const renderFileUpload = () => (
    <div className={`${uploading ? 'loading' : ''}`}>
      <div 
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
          dragActive 
            ? 'border-blue-400 bg-blue-500/10' 
            : file 
            ? 'border-green-400 bg-green-500/10' 
            : 'border-white/20 hover:border-white/40'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        <div className="space-y-3">
          <div className="text-4xl">
            {file ? '📄' : '📁'}
          </div>
          
          {file ? (
            <div className="space-y-1">
              <p className="text-white font-medium">{file.name}</p>
              <p className="text-white/60 text-sm">{formatFileSize(file.size)}</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-white font-medium">
                {dragActive ? 'Drop your file here' : 'Choose a file or drag it here'}
              </p>
              <p className="text-white/60 text-sm">Max 10MB</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
            !file || uploading
              ? 'bg-white/10 text-white/40 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Uploading...
            </div>
          ) : (
            'Upload'
          )}
        </button>
        
        {file && (
          <button
            onClick={() => {
              setFile(null);
              setUploadError(null);
              setUploadResult(null);
            }}
            className="px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors"
            disabled={uploading}
          >
            Clear
          </button>
        )}
      </div>

      {uploadError && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-red-500">❌</span>
            <p className="text-red-700 font-medium">Error</p>
          </div>
          <p className="text-red-600 mt-1">{uploadError}</p>
        </div>
      )}

      {uploadResult && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-green-500">✅</span>
            <p className="text-green-700 font-medium">Success</p>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-green-600">{uploadResult.message}</p>
            {uploadResult.filename && (
              <p className="text-gray-600"><strong>File:</strong> {uploadResult.filename}</p>
            )}
            {uploadResult.s3Key && (
              <p className="text-gray-600"><strong>S3 Key:</strong> {uploadResult.s3Key}</p>
            )}
            {uploadResult.pythonOutput && (
              <div className="mt-3 p-3 bg-gray-100 rounded border">
                <p className="font-medium text-gray-700 mb-1">Processing Output:</p>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap">{uploadResult.pythonOutput}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderDataProcessing = () => (
    <div className={`${loading ? 'loading' : ''}`}>
      {/* Auto-refresh button */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-lg font-semibold">Data Analysis</h3>
        <button
          onClick={fetchData}
          disabled={loading}
          className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-white/10 flex items-center gap-2"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Chart Controls */}
      {availableUserIds.length > 0 && (
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Chart Type:
              </label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="w-full p-2 bg-black/50 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="individual">Individual User</option>
                <option value="multiuser">All Users Comparison</option>
              </select>
            </div>
            
            {chartType === 'individual' && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Select User:
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full p-2 bg-black/50 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {availableUserIds.map(userId => (
                    <option key={userId} value={userId}>{userId}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {jsonData && (
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Posture Analysis Chart</h3>
          <div className="bg-black/30 border border-white/20 p-4 rounded-lg" style={{ height: '400px' }}>
            <canvas ref={modalChartRef}></canvas>
          </div>
          {(() => {
            // Create modal chart when data is available
            if (jsonData.filtered?.sessions && jsonData.filtered.sessions.length > 0) {
              setTimeout(() => {
                if (chartType === 'individual') {
                  const chartData = generateChartData(jsonData.filtered.sessions);
                  createChart(chartData, true); // Modal chart
                  // Clear Python chart and show analysis chart in left panel
                  setChartData(null);
                  setTimeout(() => {
                    createChart(chartData, false, true); // Left panel chart
                  }, 100);
                } else if (chartType === 'multiuser') {
                  const chartData = generateMultiUserChartData(jsonData.files);
                  createMultiUserChart(chartData, true); // Modal chart
                  // Clear Python chart and show analysis chart in left panel
                  setChartData(null);
                  setTimeout(() => {
                    createMultiUserChart(chartData, false, true); // Left panel chart
                  }, 100);
                }
              }, 100);
            }
            return null;
          })()}
        </div>
      )}

      {!jsonData && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-white text-xl font-semibold mb-2">No Data Available</h3>
          <p className="text-white/60 mb-6">Upload some posture data files first</p>
          <button
            onClick={() => navigateToSection('upload')}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upload Data
          </button>
        </div>
      )}
    </div>
  );

  const renderPythonCharts = () => (
    <div className={`${chartLoading ? 'loading' : ''}`}>
      {/* Chart Settings */}
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Timeframe:
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(Number(e.target.value))}
              className="w-full p-2 bg-black/50 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Chart Type:
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={plotType === true}
                  onChange={() => setPlotType(true)}
                  className="mr-2"
                />
                <span className="text-white text-sm">Good/Bad Percentages</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={plotType === false}
                  onChange={() => setPlotType(false)}
                  className="mr-2"
                />
                <span className="text-white text-sm">Bad Cause Analysis</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={generateChart}
            disabled={chartLoading}
            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-white/10 flex items-center justify-center gap-2"
          >
            {chartLoading && (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {chartLoading ? 'Generating...' : 'Generate Chart'}
          </button>
        </div>
      </div>

      {chartError && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-300">{chartError}</p>
        </div>
      )}

      {chartData && (
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Python Generated Chart</h3>
          {chartData.image ? (
            <div className="bg-black/30 border border-white/20 p-4 rounded-lg">
              <img 
                src={`data:image/png;base64,${chartData.image}`} 
                alt="Python Generated Chart"
                className="w-full rounded"
              />
            </div>
          ) : (
            <div className="bg-black/30 border border-white/20 p-4 rounded-lg">
              <pre className="text-sm overflow-auto text-white">
                {JSON.stringify(chartData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-black">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
        {/* Main Dashboard */}
        {renderOverview()}

        {/* Modal Overlay */}
        {activeSection !== 'overview' && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={goBack}
          >
            <div 
              className="relative w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">
                  {activeSection === 'upload' && 'Upload Data'}
                  {activeSection === 'processing' && 'Data Analysis'}
                  {activeSection === 'charts' && 'Generate Charts'}
                </h2>
                <button
                  onClick={goBack}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="liquid-glass rounded-xl p-6">
                {activeSection === 'upload' && renderFileUpload()}
                {activeSection === 'processing' && renderDataProcessing()}
                {activeSection === 'charts' && renderPythonCharts()}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default DashboardPage;