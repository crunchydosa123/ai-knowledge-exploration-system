import React from 'react';
import { Link } from 'react-router-dom'; // ✅ Import Link

const projects = [
  { id: '1', title: 'Invoice Processing', description: 'Automate invoice workflows using OCR & NLP' },
  { id: '2', title: 'HR Onboarding Docs', description: 'Streamline employee doc approvals' },
  { id: '3', title: 'Legal Contract Review', description: 'Detect anomalies in legal contracts' },
  { id: '4', title: 'Medical Reports Automation', description: 'Extract key info from lab reports' },
];

const ProjectCard = ({ id, title, description }) => (
  <div className="bg-white p-4 shadow rounded-lg hover:shadow-md transition">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-sm text-gray-600 mb-4">{description}</p>
    <Link
      to={`/project/${id}`}
      className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Open
    </Link>
  </div>
);

const ProjectsPage = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6">
        <h2 className="text-xl font-bold mb-4">Dashboard</h2>
        <nav className="space-y-2">
          <a href="#" className="block hover:bg-gray-800 p-2 rounded">Projects</a>
          <a href="#" className="block hover:bg-gray-800 p-2 rounded">Upload</a>
          <a href="#" className="block hover:bg-gray-800 p-2 rounded">Settings</a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Your Projects</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            + New Project
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <ProjectCard
              key={proj.id}
              id={proj.id}
              title={proj.title}
              description={proj.description}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default ProjectsPage;
