import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

const AddResourceModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    title: "",
    file: null,
  });
  const [fileUrl, setFileUrl] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setFormData((prev) => ({
        ...prev,
        file: files[0],
      }));
      // Reset extracted text when new file is selected
      setExtractedText("");
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const extractText = async (file) => {
    setIsExtracting(true);
    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const response = await fetch("http://localhost:3000/pdf/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to extract text");
      }

      const data = await response.json();
      setExtractedText(
        data.text || "No text could be extracted from the file."
      );
    } catch (error) {
      console.error("Error extracting text:", error);
      setExtractedText("Error extracting text from file.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create FormData object for file upload
    const formDataToSend = new FormData();
    formDataToSend.append("file", formData.file);

    // Pass both the FormData and extracted text to the parent
    onSubmit(formDataToSend, extractedText);
  };

  // Extract text when file is selected
  useEffect(() => {
    if (formData.file) {
      extractText(formData.file);
    }
  }, [formData.file]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-semibold mb-4">Add Resource</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter resource title"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="file"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Attach File
            </label>
            <input
              type="file"
              id="file"
              name="file"
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              accept=".pdf,.doc,.docx,.txt"
            />
          </div>

          {/* Extracted Text Display */}
          {isExtracting ? (
            <div className="mb-4 p-4 bg-gray-50 rounded">
              <p className="text-gray-600">Extracting text from file...</p>
            </div>
          ) : (
            extractedText && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Extracted Text:
                </h3>
                <div className="p-4 bg-gray-50 rounded max-h-60 overflow-y-auto">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {extractedText}
                  </p>
                </div>
              </div>
            )
          )}

          {fileUrl && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">File URL:</p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {fileUrl}
              </a>
            </div>
          )}
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
              disabled={loading || !formData.title || !formData.file}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Upload Resource"}
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
  const [view, setView] = useState("resources");
  const [showUpload, setShowUpload] = useState(false);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [currentExtractedText, setCurrentExtractedText] = useState("");

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/projects/${projectId}/resources`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch resources");
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

  const handleAddResource = async (formData, extractedText) => {
    setIsAddingResource(true);
    try {
      // First upload the file
      const uploadResponse = await fetch(
        `http://localhost:3000/upload/project/${projectId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      const uploadData = await uploadResponse.json();
      console.log("File upload successful:", uploadData);

      // Clean the extracted text - remove any HTML tags and extra whitespace
      const cleanText = extractedText
        .replace(/<[^>]*>/g, "") // Remove HTML tags
        .replace(/\s+/g, " ") // Replace multiple spaces with single space
        .trim(); // Remove leading/trailing whitespace

      console.log(
        "Sending text for embedding:",
        cleanText.substring(0, 100) + "..."
      );

      // Generate embeddings for the extracted text
      const embeddingResponse = await fetch(
        "http://localhost:3000/embeddings/getEmbedding",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ text: cleanText }),
        }
      );

      // Log the raw response for debugging
      const responseText = await embeddingResponse.text();
      console.log("Raw embedding response:", responseText);

      if (!embeddingResponse.ok) {
        throw new Error(`Failed to generate embeddings: ${responseText}`);
      }

      // Parse the response as JSON
      let embeddingData;
      try {
        embeddingData = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse embedding response:", e);
        throw new Error("Invalid response from embedding service");
      }

      console.log("Generated embeddings:", embeddingData);

      // Upload embeddings to Pinecone
      const pineconeResponse = await fetch(
        "http://localhost:3000/pinecone/upload",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            vector: {
              id: `resource_${Date.now()}`, // Generate a unique ID
              values: embeddingData.embedding,
              metadata: {
                text: cleanText,
                url: uploadData.url,
                projectId: projectId,
              },
            },
            namespace: `project_${projectId}`, // Use project ID as namespace
          }),
        }
      );

      if (!pineconeResponse.ok) {
        const errorData = await pineconeResponse.json();
        throw new Error(
          `Failed to upload to Pinecone: ${
            errorData.error || errorData.details || "Unknown error"
          }`
        );
      }

      const pineconeData = await pineconeResponse.json();
      console.log("Pinecone upload response:", pineconeData);

      // Then save the resource with URL and extracted text
      const resourceResponse = await fetch(
        `http://localhost:3000/projects/${projectId}/resources`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            url: uploadData.url,
            text: cleanText,
          }),
        }
      );

      if (!resourceResponse.ok) {
        throw new Error("Failed to save resource");
      }

      const newResource = await resourceResponse.json();
      setResources((prev) => [...prev, newResource]);
      setShowUpload(false);
    } catch (err) {
      console.error("Error in handleAddResource:", err);
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
            onClick={() => setView("resources")}
            className={`px-4 py-2 rounded ${
              view === "resources"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Resources and Documents
          </button>
          <button
            onClick={() => setView("chat")}
            className={`px-4 py-2 rounded ${
              view === "chat"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Chat
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="p-6 max-w-7xl mx-auto">
        {/* RESOURCES AND DOCUMENTS VIEW */}
        {view === "resources" && (
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
                <p className="text-gray-600 text-center py-4">
                  No resources yet. Add your first resource!
                </p>
              ) : (
                <ul className="space-y-3">
                  {resources.map((resource) => (
                    <li key={resource.id} className="p-3 bg-gray-100 rounded">
                      <h3 className="font-medium text-gray-800">
                        {resource.title}
                      </h3>
                      {resource.url && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline block mb-1"
                        >
                          View File
                        </a>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Added:{" "}
                        {new Date(resource.createdAt).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* CHAT VIEW */}
        {view === "chat" && (
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
