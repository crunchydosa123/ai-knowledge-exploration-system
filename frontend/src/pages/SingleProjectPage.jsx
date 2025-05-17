import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const AddResourceModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    url: '',
    text: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Add Resource</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              URL (Optional)
            </label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter resource URL"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
              Text Content (Optional)
            </label>
            <textarea
              id="text"
              name="text"
              value={formData.text}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter resource text content"
              rows="4"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (!formData.url && !formData.text)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SingleProjectPage = () => {
  const { id: projectId } = useParams();
  const { user } = useUser();
  const [view, setView] = useState('resources');
  const [showUpload, setShowUpload] = useState(false);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingResource, setIsAddingResource] = useState(false);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch(`http://localhost:3000/projects/${projectId}/resources`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch resources');
        }

        const data = await response.json();
        setResources(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchResources();
    }
  }, [projectId, user]);

  const handleAddResource = async (formData) => {
    setIsAddingResource(true);
    try {
      const response = await fetch(`http://localhost:3000/projects/${projectId}/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to add resource');
      }

      const newResource = await response.json();
      setResources(prev => [...prev, newResource]);
      setShowUpload(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAddingResource(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading resources...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* NAVBAR */}
      <nav className="bg-white shadow p-4 flex justify-between items-start lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">MyWorkspace</h1>
          <p className="text-sm text-gray-600">Project ID: {projectId}</p>
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
            <div className="bg-white p-4 shadow rounded space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Resources</h2>
                <button
                  onClick={() => setShowUpload(true)}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  + Add Resource
                </button>
              </div>
              {resources.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No resources yet. Add your first resource!</p>
              ) : (
                <ul className="space-y-3">
                  {resources.map((resource) => (
                    <li key={resource.id} className="p-3 bg-gray-100 rounded">
                      {resource.url && (
                        <a 
                          href={resource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline block mb-1"
                        >
                          {resource.url}
                        </a>
                      )}
                      {resource.text && (
                        <p className="text-sm text-gray-700">{resource.text}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Added: {new Date(resource.createdAt).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* CHAT VIEW */}
        {view === 'chat' && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Chat Interface</h2>
            {/* Chat interface will be implemented here */}
          </div>
        )}

        <AddResourceModal
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
          onSubmit={handleAddResource}
          loading={isAddingResource}
        />
      </div>
    </div>
  );
};

export default SingleProjectPage;
