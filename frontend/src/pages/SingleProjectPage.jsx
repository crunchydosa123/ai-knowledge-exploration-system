import React, { useState } from 'react';

const SingleProjectPage = () => {
  const [view, setView] = useState('resources');
  const [showUpload, setShowUpload] = useState(false);


  const websiteName = 'MyWorkspace';
  const projectName = 'Project Phoenix';

  const uploadedResources = [
    'Invoice_Jan2024.pdf',
    'Contract_HR_Onboarding.docx',
  ];

  const generatedDocuments = [
    'Invoice_Summary_Jan.pdf',
    'HR_JoinForm_Summary.pdf',
  ];

  const latestGeneratedDoc = 'Summary_Invoice_April.pdf';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* NAVBAR */}
      <nav className="bg-white shadow p-4 flex justify-between items-start lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{websiteName}</h1>
          <p className="text-sm text-gray-600">{projectName}</p>
        </div>
        <div className="space-x-4 mt-2 lg:mt-0">
          <button
            onClick={() => setView('resources')}
            className={`px-4 py-2 rounded ${
              view === 'resources' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Resources and Documents
          </button>
          <button
            onClick={() => setView('chat')}
            className={`px-4 py-2 rounded ${
              view === 'chat' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Chat
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="p-6 max-w-7xl mx-auto">
        {/* RESOURCES AND DOCUMENTS VIEW */}
        {view === 'resources' && (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Uploaded Resources + Upload */}
    <div className="bg-white p-4 shadow rounded space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Uploaded Resources</h2>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          + Upload Resource
        </button>
      </div>
      <ul className="space-y-3">
        {uploadedResources.map((res) => (
          <li key={res} className="p-3 bg-gray-100 rounded text-sm">
            {res}
          </li>
        ))}
      </ul>

      {/* Conditionally render Upload Form */}
      {showUpload && (
        <div className="mt-4 border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">Upload Resource</h3>
          <form className="flex flex-col gap-3">
            <input
              type="file"
              className="p-2 border rounded"
              accept=".txt,.pdf,.docx"
            />
            <textarea
              placeholder="Optional notes or extracted text"
              className="p-2 border rounded"
            />
            <button
              type="submit"
              className="self-start bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Upload
            </button>
          </form>
        </div>
      )}
    </div>

    {/* Generated Documents */}
    <div className="space-y-6">
      {/* Latest Generated Document */}
      <div className="bg-white p-4 shadow rounded">
        <h2 className="text-xl font-semibold mb-4">Latest Generated Document</h2>
        <div className="p-3 bg-gray-100 rounded">
          <p className="text-sm">Summary_Invoice_April.pdf</p>
          <button className="text-blue-600 hover:underline mt-2">Download</button>
        </div>
      </div>

      {/* Document History */}
      <div className="bg-white p-4 shadow rounded">
        <h2 className="text-xl font-semibold mb-4">Document History</h2>
        <ul className="space-y-3">
          <li className="flex justify-between bg-gray-100 p-3 rounded">
            <span>Invoice_Summary_Jan.pdf</span>
            <button className="text-blue-600 hover:underline">Download</button>
          </li>
          <li className="flex justify-between bg-gray-100 p-3 rounded">
            <span>HR_JoinForm_Summary.pdf</span>
            <button className="text-blue-600 hover:underline">Download</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
)}


        {/* CHAT VIEW */}
        {view === 'chat' && (
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
    {/* Sidebar: List of Resources + Upload Form */}
    <div className="bg-white p-4 rounded shadow col-span-1 space-y-6">
      {/* Resources List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Resources</h2>
        <ul className="space-y-3">
          {uploadedResources.map((res) => (
            <li
              key={res}
              className="p-2 bg-gray-100 rounded text-sm cursor-pointer hover:bg-gray-200"
              onClick={() => alert(`Selected ${res}`)}
            >
              {res}
            </li>
          ))}
        </ul>
      </div>

      {/* Upload Resource */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Upload Resource</h2>
        <form className="flex flex-col gap-3">
          <input
            type="file"
            className="p-2 border rounded"
            accept=".txt,.pdf,.docx"
          />
          <textarea
            placeholder="Optional notes or extracted text"
            className="p-2 border rounded"
          />
          <button
            type="submit"
            className="self-start bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Upload
          </button>
        </form>
      </div>
    </div>

    {/* Main Chat Area */}
    <div className="col-span-1 lg:col-span-3 bg-white p-6 rounded shadow space-y-8">
      {/* Ask a Question */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Ask a Question</h2>
        <input
          type="text"
          placeholder="Ask about a document..."
          className="w-full p-2 border rounded mb-2"
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4">
          Submit
        </button>
        <div className="p-3 bg-gray-100 rounded text-sm">
          <strong>Answer:</strong> Invoice_Jan2024 has been approved.
        </div>
      </div>
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default SingleProjectPage;
