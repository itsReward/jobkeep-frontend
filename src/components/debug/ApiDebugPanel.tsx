// src/components/debug/ApiDebugPanel.tsx
import React, { useState, useEffect } from 'react'
import { apiLogger, APILogEntry } from '@/services/api/logger'
import { productDebugUtils } from '@/services/api/base'

interface ApiDebugPanelProps {
    isVisible?: boolean
    onClose?: () => void
}

export const ApiDebugPanel: React.FC<ApiDebugPanelProps> = ({
                                                                isVisible = false,
                                                                onClose
                                                            }) => {
    const [logs, setLogs] = useState<APILogEntry[]>([])
    const [filter, setFilter] = useState<'all' | 'products' | 'vehicles' | 'errors'>('all')
    const [autoRefresh, setAutoRefresh] = useState(true)

    // Refresh logs
    const refreshLogs = () => {
        let filteredLogs: APILogEntry[] = []

        switch (filter) {
            case 'products':
                filteredLogs = apiLogger.getProductLogs()
                break
            case 'vehicles':
                filteredLogs = apiLogger.getVehicleCompatibilityLogs()
                break
            case 'errors':
                filteredLogs = apiLogger.getErrorLogs()
                break
            default:
                filteredLogs = apiLogger.getLogs()
        }

        setLogs(filteredLogs.slice(-20)) // Show last 20 logs
    }

    // Auto-refresh every 2 seconds
    useEffect(() => {
        if (!autoRefresh) return

        const interval = setInterval(refreshLogs, 2000)
        return () => clearInterval(interval)
    }, [filter, autoRefresh])

    // Initial load
    useEffect(() => {
        refreshLogs()
    }, [filter])

    const getStatusColor = (status?: number) => {
        if (!status) return 'text-gray-500'
        if (status < 300) return 'text-green-600'
        if (status < 400) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getMethodColor = (method: string) => {
        switch (method.toUpperCase()) {
            case 'GET': return 'bg-blue-100 text-blue-800'
            case 'POST': return 'bg-green-100 text-green-800'
            case 'PUT': return 'bg-yellow-100 text-yellow-800'
            case 'DELETE': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const exportLogs = () => {
        const logsJson = apiLogger.exportLogs()
        const blob = new Blob([logsJson], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `api-logs-${new Date().toISOString().slice(0, 19)}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    if (!isVisible) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-3/4 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
    <h2 className="text-xl font-semibold">API Debug Panel</h2>
    <div className="flex items-center gap-4">
    <label className="flex items-center gap-2">
    <input
        type="checkbox"
    checked={autoRefresh}
    onChange={(e) => setAutoRefresh(e.target.checked)}
    className="rounded"
    />
    <span className="text-sm">Auto-refresh</span>
        </label>
        <button
    onClick={onClose}
    className="text-gray-500 hover:text-gray-700 text-xl"
        >
              ✕
            </button>
            </div>
            </div>

    {/* Controls */}
    <div className="p-4 border-b bg-gray-50">
    <div className="flex items-center gap-4 mb-3">
    <div className="flex gap-2">
        {(['all', 'products', 'vehicles', 'errors'] as const).map((filterType) => (
            <button
                key={filterType}
    onClick={() => setFilter(filterType)}
    className={`px-3 py-1 rounded text-sm capitalize ${
        filter === filterType
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    }`}
>
    {filterType}
    </button>
))}
    </div>

    <button
    onClick={refreshLogs}
    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
        >
        Refresh
        </button>

        <button
    onClick={() => {
        apiLogger.clearLogs()
        refreshLogs()
    }}
    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
        >
        Clear
        </button>

        <button
    onClick={exportLogs}
    className="px-3 py-1 bg-indigo-500 text-white rounded text-sm hover:bg-indigo-600"
        >
        Export
        </button>
        </div>

    {/* Quick Actions */}
    <div className="flex gap-2 flex-wrap">
    <button
        onClick={() => productDebugUtils.testProductEndpoints()}
    className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
        >
        Test Product Endpoints
    </button>

    <button
    onClick={() => productDebugUtils.checkApiConnection()}
    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
        Check API Connection
    </button>

    <button
    onClick={() => productDebugUtils.analyzeProductErrors()}
    className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
        >
        Analyze Errors
    </button>

    <button
    onClick={() => apiLogger.printSummary()}
    className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
        >
        Print Summary
    </button>
    </div>
    </div>

    {/* Logs */}
    <div className="flex-1 overflow-auto p-4">
        {logs.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                <div className="text-lg mb-2">📡</div>
    <div>No logs found for filter: <strong>{filter}</strong></div>
    <div className="text-sm mt-2">Try making some API requests or change the filter.</div>
    </div>
) : (
        <div className="space-y-2">
            {logs.map((log, index) => (
                    <div
                        key={`${log.id}-${log.timestamp}-${index}`}
    className={`border rounded-lg p-3 ${
        log.type === 'error' || (log.status && log.status >= 400)
            ? 'bg-red-50 border-red-200'
            : log.status && log.status >= 300
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-gray-50 border-gray-200'
    }`}
>
    <div className="flex items-center justify-between mb-2">
    <div className="flex items-center gap-3">
    <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(log.method)}`}>
    {log.method}
    </span>
    <span className="text-sm font-mono break-all">{log.url}</span>
    {log.status && (
        <span className={`text-sm font-medium ${getStatusColor(log.status)}`}>
        {log.status}
        </span>
    )}
    {log.duration && (
        <span className={`text-xs px-2 py-1 rounded ${
            log.duration > 2000 ? 'bg-red-100 text-red-700' :
                log.duration > 1000 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
        }`}>
        {log.duration}ms
    </span>
    )}
    <span className={`text-xs px-2 py-1 rounded ${
        log.type === 'error' ? 'bg-red-100 text-red-700' :
            log.type === 'response' ? 'bg-green-100 text-green-700' :
                'bg-blue-100 text-blue-700'
    }`}>
    {log.type}
    </span>
    </div>
    <span className="text-xs text-gray-500">
        {new Date(log.timestamp).toLocaleTimeString()}
        </span>
        </div>

    {log.error && (
        <div className="mb-2 p-2 bg-red-100 rounded">
        <span className="text-red-600 text-sm font-medium">Error: </span>
    <span className="text-red-600 text-sm">{log.error}</span>
        </div>
    )}

    {(log.requestData || log.responseData || log.requestHeaders || log.responseHeaders) && (
        <details className="mt-2">
        <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 font-medium">
            View Details
    </summary>
    <div className="mt-2 space-y-3 text-xs">
        {log.requestHeaders && (
                <div>
                    <strong className="text-gray-700">Request Headers:</strong>
                <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32 text-xs">
                {JSON.stringify(log.requestHeaders, null, 2)}
                </pre>
                </div>
    )}

        {log.requestData && (
            <div>
                <strong className="text-gray-700">Request Data:</strong>
        <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32 text-xs">
            {typeof log.requestData === 'string'
                    ? log.requestData
                    : JSON.stringify(log.requestData, null, 2)}
            </pre>
            </div>
        )}

        {log.responseHeaders && (
            <div>
                <strong className="text-gray-700">Response Headers:</strong>
        <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32 text-xs">
            {JSON.stringify(log.responseHeaders, null, 2)}
            </pre>
            </div>
        )}

        {log.responseData && (
            <div>
                <strong className="text-gray-700">Response Data:</strong>
        <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32 text-xs">
            {typeof log.responseData === 'string'
                    ? log.responseData
                    : JSON.stringify(log.responseData, null, 2)}
            </pre>
            </div>
        )}
        </div>
        </details>
    )}
    </div>
))}
    </div>
)}
    </div>

    {/* Footer with stats */}
    <div className="p-4 border-t bg-gray-50">
    <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
            Showing {logs.length} of {apiLogger.getLogs().length} total logs
    {filter !== 'all' && ` (filtered by ${filter})`}
    </div>
    <div className="flex gap-4">
        <span>Errors: {apiLogger.getErrorLogs().length}</span>
    <span>Slow (&gt;2s): {apiLogger.getSlowRequests().length}</span>
    </div>
    </div>
    </div>
    </div>
    </div>
)
}

// Hook to easily toggle the debug panel
export const useApiDebugPanel = () => {
    const [isVisible, setIsVisible] = useState(false)

    // Enable keyboard shortcut (Ctrl/Cmd + Shift + D) to toggle
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
                event.preventDefault()
                setIsVisible(prev => !prev)
            }
        }

        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [])

    return {
        isVisible,
        show: () => setIsVisible(true),
        hide: () => setIsVisible(false),
        toggle: () => setIsVisible(prev => !prev)
    }
}

// Debug Panel Trigger Component - for easy integration
export const ApiDebugTrigger: React.FC = () => {
    const debugPanel = useApiDebugPanel()

    // Only show in development
    if (!import.meta.env.DEV) return null

    return (
        <>
            {/* Debug Panel */}
        <ApiDebugPanel
    isVisible={debugPanel.isVisible}
    onClose={debugPanel.hide}
    />

    {/* Debug Trigger Button */}
    <button
        onClick={debugPanel.toggle}
    className="fixed bottom-4 right-4 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full z-40 shadow-lg transition-all duration-200 hover:scale-110"
    title="Toggle API Debug Panel (Ctrl+Shift+D)"
        >
        🐛
      </button>
      </>
)
}