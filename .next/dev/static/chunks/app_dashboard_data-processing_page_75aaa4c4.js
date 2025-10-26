(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/dashboard/data-processing/page.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/chart.js/dist/chart.js [app-client] (ecmascript) <locals>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Chart"].register(...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["registerables"]);
const DataProcessingPage = ()=>{
    _s();
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [jsonData, setJsonData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedUserId, setSelectedUserId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [availableUserIds, setAvailableUserIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [chartType, setChartType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('individual');
    const chartRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const chartInstance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const fetchData = async ()=>{
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/upload?action=getall');
            if (res.ok) {
                const response = await res.json();
                // Extract unique userIds
                const userIds = [
                    ...new Set(response.files.map((file)=>file.userId).filter(Boolean))
                ];
                setAvailableUserIds(userIds);
                // Set default userId if not selected
                const defaultUserId = selectedUserId || userIds[0];
                if (!selectedUserId && userIds.length > 0) {
                    setSelectedUserId(defaultUserId);
                }
                const filteredData = filterDataByUserId(response.files, defaultUserId);
                setJsonData({
                    files: response.files,
                    filtered: filteredData
                });
                if (chartType === 'individual' && filteredData.sessions && filteredData.sessions.length > 0) {
                    setTimeout(()=>{
                        const chartData = generateChartData(filteredData.sessions);
                        createChart(chartData);
                    }, 100);
                } else if (chartType === 'multiuser') {
                    setTimeout(()=>{
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
        } finally{
            setLoading(false);
        }
    };
    const handleUserIdChange = (userId)=>{
        setSelectedUserId(userId);
        if (jsonData) {
            const filteredData = filterDataByUserId(jsonData.files, userId);
            setJsonData({
                ...jsonData,
                filtered: filteredData
            });
            if (chartType === 'individual') {
                if (filteredData.sessions && filteredData.sessions.length > 0) {
                    setTimeout(()=>{
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
    const filterDataByUserId = (files, targetUserId)=>{
        // Find files that match the target userId
        const matchingFiles = files.filter((file)=>file.userId === targetUserId);
        if (matchingFiles.length === 0) {
            return {
                userId: targetUserId,
                sessions: []
            };
        }
        // Combine sessions from matching files
        const allSessions = [];
        matchingFiles.forEach((file)=>{
            if (file.sessions) {
                allSessions.push(...file.sessions);
            }
        });
        // Sort combined sessions by timestamp
        allSessions.sort((a, b)=>new Date(a.timestamp) - new Date(b.timestamp));
        return {
            userId: targetUserId,
            sessions: allSessions
        };
    };
    const generateChartData = (sessions)=>{
        const numGroups = 10;
        const groupSize = Math.ceil(sessions.length / numGroups);
        const labels = [];
        const goodData = [];
        const badData = [];
        for(let i = 0; i < numGroups; i++){
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
            const goodCount = group.filter((s)=>s.status === 'good').length;
            const badCount = group.filter((s)=>s.status === 'bad' || s.status === 'moderate').length;
            const total = goodCount + badCount;
            const goodPercentage = total > 0 ? goodCount / total * 100 : 0;
            const badPercentage = total > 0 ? badCount / total * 100 : 0;
            goodData.push(goodPercentage);
            badData.push(badPercentage);
        }
        return {
            labels,
            goodData,
            badData
        };
    };
    const generateMultiUserChartData = (files)=>{
        const userDataMap = {};
        // Group sessions by userId
        files.forEach((file)=>{
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
        const colors = [
            '#10b981',
            '#3b82f6',
            '#f59e0b',
            '#ef4444',
            '#8b5cf6',
            '#06b6d4',
            '#f97316',
            '#84cc16'
        ];
        // Generate time labels based on first user's data
        const firstUserId = Object.keys(userDataMap)[0];
        if (firstUserId) {
            const sessions = userDataMap[firstUserId].sort((a, b)=>new Date(a.timestamp) - new Date(b.timestamp));
            const groupSize = Math.ceil(sessions.length / numGroups);
            for(let i = 0; i < numGroups; i++){
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
        Object.keys(userDataMap).forEach((userId, index)=>{
            const sessions = userDataMap[userId].sort((a, b)=>new Date(a.timestamp) - new Date(b.timestamp));
            const groupSize = Math.ceil(sessions.length / numGroups);
            const goodData = [];
            for(let i = 0; i < numGroups; i++){
                const start = i * groupSize;
                const end = Math.min(start + groupSize, sessions.length);
                const group = sessions.slice(start, end);
                const goodCount = group.filter((s)=>s.status === 'good').length;
                const badCount = group.filter((s)=>s.status === 'bad' || s.status === 'moderate').length;
                const total = goodCount + badCount;
                const goodPercentage = total > 0 ? goodCount / total * 100 : 0;
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
        return {
            labels,
            datasets
        };
    };
    const createChart = (chartData)=>{
        if (!chartRef.current) {
            console.error('Chart canvas not found');
            return;
        }
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }
        const ctx = chartRef.current.getContext('2d');
        chartInstance.current = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Chart"](ctx, {
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
    const createMultiUserChart = (chartData)=>{
        if (!chartRef.current) {
            console.error('Chart canvas not found');
            return;
        }
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }
        const ctx = chartRef.current.getContext('2d');
        chartInstance.current = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Chart"](ctx, {
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DataProcessingPage.useEffect": ()=>{
            return ({
                "DataProcessingPage.useEffect": ()=>{
                    if (chartInstance.current) {
                        chartInstance.current.destroy();
                    }
                }
            })["DataProcessingPage.useEffect"];
        }
    }["DataProcessingPage.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen p-6 pt-24",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-4xl mx-auto",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `liquid-glass rounded-2xl p-8 ${loading ? 'loading' : ''}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-2xl font-bold mb-4 text-white",
                        children: "Access JSON Data from S3"
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/data-processing/page.js",
                        lineNumber: 390,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-white/80 mb-6",
                        children: "Fetch and combine all JSON files from posture folder"
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/data-processing/page.js",
                        lineNumber: 391,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: fetchData,
                        disabled: loading,
                        className: "w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center",
                        children: [
                            loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "animate-spin -ml-1 mr-3 h-5 w-5 text-white",
                                xmlns: "http://www.w3.org/2000/svg",
                                fill: "none",
                                viewBox: "0 0 24 24",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                        className: "opacity-25",
                                        cx: "12",
                                        cy: "12",
                                        r: "10",
                                        stroke: "currentColor",
                                        strokeWidth: "4"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/data-processing/page.js",
                                        lineNumber: 400,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        className: "opacity-75",
                                        fill: "currentColor",
                                        d: "m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/data-processing/page.js",
                                        lineNumber: 401,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/data-processing/page.js",
                                lineNumber: 399,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            loading ? 'Fetching...' : 'Fetch All Posture Data'
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/data-processing/page.js",
                        lineNumber: 393,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    availableUserIds.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-4 space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium text-white mb-2",
                                        children: "Chart Type:"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/data-processing/page.js",
                                        lineNumber: 410,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: chartType,
                                        onChange: (e)=>setChartType(e.target.value),
                                        className: "inline-block p-2 bg-black border border-white/30 rounded text-white focus:ring-2 focus:ring-white/50 focus:border-white/50 mr-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "individual",
                                                children: "Individual User"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/data-processing/page.js",
                                                lineNumber: 418,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "multiuser",
                                                children: "All Users (Good Posture)"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/data-processing/page.js",
                                                lineNumber: 419,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/data-processing/page.js",
                                        lineNumber: 413,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/data-processing/page.js",
                                lineNumber: 409,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            chartType === 'individual' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium text-white mb-2",
                                        children: "Select User ID:"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/data-processing/page.js",
                                        lineNumber: 425,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: selectedUserId,
                                        onChange: (e)=>handleUserIdChange(e.target.value),
                                        className: "inline-block p-2 bg-black border border-white/30 rounded text-white focus:ring-2 focus:ring-white/50 focus:border-white/50",
                                        children: availableUserIds.map((userId)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: userId,
                                                children: userId
                                            }, userId, false, {
                                                fileName: "[project]/app/dashboard/data-processing/page.js",
                                                lineNumber: 434,
                                                columnNumber: 23
                                            }, ("TURBOPACK compile-time value", void 0)))
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/data-processing/page.js",
                                        lineNumber: 428,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/data-processing/page.js",
                                lineNumber: 424,
                                columnNumber: 17
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/data-processing/page.js",
                        lineNumber: 408,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0)),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-4 p-3 bg-red-50 border border-red-200 rounded",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-red-700",
                            children: error
                        }, void 0, false, {
                            fileName: "[project]/app/dashboard/data-processing/page.js",
                            lineNumber: 444,
                            columnNumber: 15
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/data-processing/page.js",
                        lineNumber: 443,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0)),
                    jsonData && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-6 space-y-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-lg font-semibold mb-3 text-white",
                                        children: "Posture Status Chart:"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/data-processing/page.js",
                                        lineNumber: 451,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-black/30 border border-white/20 p-4 rounded",
                                        style: {
                                            height: '400px'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                                            ref: chartRef
                                        }, void 0, false, {
                                            fileName: "[project]/app/dashboard/data-processing/page.js",
                                            lineNumber: 453,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/data-processing/page.js",
                                        lineNumber: 452,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/data-processing/page.js",
                                lineNumber: 450,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-lg font-semibold mb-3 text-white",
                                        children: "Raw JSON Data:"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/data-processing/page.js",
                                        lineNumber: 458,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                        className: "bg-black/30 border border-white/20 p-4 rounded text-sm overflow-auto max-h-96 text-white",
                                        children: JSON.stringify(jsonData, null, 2)
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/data-processing/page.js",
                                        lineNumber: 459,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/data-processing/page.js",
                                lineNumber: 457,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/data-processing/page.js",
                        lineNumber: 449,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/data-processing/page.js",
                lineNumber: 389,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/app/dashboard/data-processing/page.js",
            lineNumber: 388,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/app/dashboard/data-processing/page.js",
        lineNumber: 387,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(DataProcessingPage, "D/gCfae1l4wFsBpg+jrpI2wF3qY=");
_c = DataProcessingPage;
const __TURBOPACK__default__export__ = DataProcessingPage;
var _c;
__turbopack_context__.k.register(_c, "DataProcessingPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_dashboard_data-processing_page_75aaa4c4.js.map