'use client';

import { useState } from 'react';

const FileUploadPage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError(null);
    setResult(null);
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
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      
      if (res.ok) {
        setResult(data);
        setFile(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Network error occurred');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">File Upload to S3</h1>
            <p className="text-gray-600">Upload and process your files with AI analysis</p>
          </div>

          <div 
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : file 
                ? 'border-green-400 bg-green-50' 
                : 'border-gray-300 hover:border-gray-400'
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
            
            <div className="space-y-4">
              <div className="text-6xl">
                {file ? '📄' : '📁'}
              </div>
              
              {file ? (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-green-700">{file.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-700">
                    {dragActive ? 'Drop your file here' : 'Choose a file or drag it here'}
                  </p>
                  <p className="text-sm text-gray-500">Maximum file size: 10MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                !file || uploading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {uploading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </div>
              ) : (
                'Upload & Process'
              )}
            </button>
            
            {file && (
              <button
                onClick={() => {
                  setFile(null);
                  setError(null);
                  setResult(null);
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={uploading}
              >
                Clear
              </button>
            )}
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-red-500">❌</span>
                <p className="text-red-700 font-medium">Error</p>
              </div>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-green-500">✅</span>
                <p className="text-green-700 font-medium">Success</p>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-green-600">{result.message}</p>
                {result.filename && (
                  <p className="text-gray-600"><strong>File:</strong> {result.filename}</p>
                )}
                {result.s3Key && (
                  <p className="text-gray-600"><strong>S3 Key:</strong> {result.s3Key}</p>
                )}
                {result.pythonOutput && (
                  <div className="mt-3 p-3 bg-gray-100 rounded border">
                    <p className="font-medium text-gray-700 mb-1">Processing Output:</p>
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap">{result.pythonOutput}</pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploadPage;
