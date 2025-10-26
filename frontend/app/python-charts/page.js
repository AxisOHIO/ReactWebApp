'use client';

import { useState } from 'react';

const PythonChartsPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [timeframe, setTimeframe] = useState(7);
  const [plotType, setPlotType] = useState(true);

  const generateChart = async () => {
    setLoading(true);
    setError(null);

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
      } else {
        const errorData = await res.json();
        setError(errorData.error);
      }
    } catch (err) {
      setError('Failed to generate chart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className={`liquid-glass rounded-2xl p-8 ${loading ? 'loading' : ''}`}>
          <h1 className="text-2xl font-bold mb-4 text-white">Python Generated Charts</h1>
          <p className="text-white/80 mb-6">Generate posture analysis charts using Python processing</p>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Timeframe (days):
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(Number(e.target.value))}
                className="inline-block p-2 bg-black border border-white/30 rounded text-white focus:ring-2 focus:ring-white/50 focus:border-white/50"
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
              <div className="space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={plotType === true}
                    onChange={() => setPlotType(true)}
                    className="form-radio"
                  />
                  <span className="ml-2 text-white">Good/Bad Percentages</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={plotType === false}
                    onChange={() => setPlotType(false)}
                    className="form-radio"
                  />
                  <span className="ml-2 text-white">Bad Cause Analysis</span>
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={generateChart}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Generating Chart...' : 'Generate Python Chart'}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {chartData && (
            <div className="mt-6 text-center">
              <h2 className="text-lg font-semibold mb-3 text-white">Generated Chart:</h2>
              {chartData.image ? (
                <img 
                  src={`data:image/png;base64,${chartData.image}`} 
                  alt="Python Generated Chart"
                  className="w-full border rounded"
                />
              ) : (
                <div className="bg-black/30 border border-white/20 p-4 rounded">
                  <pre className="text-sm overflow-auto text-white">
                    {JSON.stringify(chartData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PythonChartsPage;