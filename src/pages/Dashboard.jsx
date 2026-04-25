import React, { useEffect, useState } from "react";
import {
  FilePenLineIcon,
  PencilIcon,
  PlusIcon,
  UploadCloudIcon,
  UploadCloud,
  TrashIcon,
  XIcon,          
} from "lucide-react";
import { dummyResumeData } from "../assets/assets";
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [allResumes, setAllResumes] = useState([]);
  const [showCreateResume, setCreateResumes] = useState(false);
  const [showUploadResume, setUploadResumes] = useState(false);
  const [title, setTitle] = useState('');
  const [resume, setResume] = useState(null);
  const [editResumeId, setEditResumeId] = useState('');
  const navigate = useNavigate();

  const createResume = async (event) => {
    event.preventDefault();
    setCreateResumes(false);
    navigate(`/app/builder/res123`);
  };

  const uploadResume = async (e) => {  
    e.preventDefault();
    setUploadResumes(false);
    navigate(`/app/builder/res123`);
  };

  const editTitle = async (e) => {
    e.preventDefault();
  };

  const loadAllResumes = async () => {
    setAllResumes(dummyResumeData);
  };

  const deleteResume = async (resumeId)=>{
    const confirm = window.confirm('Are you sure you want to delete this resume?')
    if(comfirm){
      setAllResumes(prev=>prev.filter(resume._id !== resumeId))
    }
  }

  const colors = ["#9333ea", "#d97706", "#dc2626", "#0284c7", "#16a34a"];

  useEffect(() => {
    loadAllResumes();
  }, []);

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-2xl font-medium mb-6 bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent sm:hidden">
          Welcome, Suman
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => setCreateResumes(true)}
            className="w-full bg-white sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-indigo-500 hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <PlusIcon className="size-11 transition-all duration-300 p-2.5 bg-gradient-to-br from-indigo-300 to-indigo-500 text-white rounded-full" />
            <p className="text-sm group-hover:text-indigo-600 transition-all">
              Create Resume
            </p>
          </button>

          <button
            onClick={() => { setUploadResumes(true); }}
            className="w-full bg-white sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-purple-500 hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <UploadCloudIcon className="size-11 transition-all duration-300 p-2.5 bg-gradient-to-br from-purple-300 to-indigo-500 text-white rounded-full" />
            <p className="text-sm group-hover:text-purple-600 transition-all">
              Upload existing Resume
            </p>
          </button>
        </div>

        <hr className="border-slate-300 my-6 sm:w-[305px]" />

        <div className="grid grid-cols-2 sm:flex flex-wrap gap-4">
          {allResumes.map((resume, index) => {
            const basecolor = colors[index % colors.length];

            return (
              <button
                key={index}
                onClick={() => navigate(`/app/builder/${resume._id}`)}
                className="relative w-full sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 border group hover:shadow-lg transition-all duration-300 cursor-pointer"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${basecolor}10, ${basecolor}40)`,
                  borderColor: basecolor + "40",
                }}
              >
                <FilePenLineIcon
                  className="size-7 group-hover:scale-105 transition-all"
                  style={{ color: basecolor }}
                />

                <p
                  className="text-sm group-hover:scale-105 transition-all px-2 text-center"
                  style={{ color: basecolor }}
                >
                  {resume.title}
                </p>

                <p
                  className="absolute bottom-1 text-[11px] group-hover:text-slate-500 transition-all duration-300 px-2 text-center"
                  style={{ color: basecolor + "90" }}
                >
                  Updated on {new Date(resume.updatedAt).toLocaleDateString()}
                </p>

                <div
                  className="absolute top-1 right-1 group-hover:flex items-center hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <TrashIcon className="size-7 p-1.5 hover:bg-white/50 rounded hover:text-slate-700 transition-colors" onClick={()=>{
                    deleteResume(resume._id)
                  }}  />
                  <PencilIcon
                    className="size-7 p-1.5 hover:bg-white/50 rounded hover:text-slate-700 transition-colors"
                    onClick={() => { setEditResumeId(resume._id); setTitle(resume.title); }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {showCreateResume && (
          // ✅ FIX 4: "insert-0" → "inset-0"
          <form onSubmit={createResume} onClick={() => setCreateResumes(false)} className="fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-10 flex items-center justify-center">
            <div onClick={(e) => e.stopPropagation()} className="relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6">
              <h2 className="text-xl font-bold mb-4">Create a Resume</h2>
              <input
                onChange={(e) => { setTitle(e.target.value); }}
                value={title}
                type="text"
                placeholder="Enter resume title"
                className="w-full px-4 py-2 mb-4 focus:border-indigo-600 ring-indigo-600"
                required
              />
              <button className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
                Create Resume
              </button>
              <XIcon
                className="size-6 absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                onClick={() => { setCreateResumes(false); setTitle(''); }}
              />
            </div>
          </form>
        )}

        {showUploadResume && (
          <form onSubmit={uploadResume} onClick={() => setUploadResumes(false)} className="fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-10 flex items-center justify-center">
            <div onClick={(e) => e.stopPropagation()} className="relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6">
              <h2 className="text-xl font-bold mb-4">Upload a Resume</h2>
              <input
                onChange={(e) => { setTitle(e.target.value); }}
                value={title}
                type="text"
                placeholder="Enter resume title"
                className="w-full px-4 py-2 mb-4 focus:border-indigo-600 ring-indigo-600"
                required
              />
              <div>
                <label htmlFor="resume-input" className="block text-sm text-slate-700">
                  Select resume file
                  <div className="flex flex-col items-center justify-center gap-2 border group text-slate-400 border-slate-400 border-dashed rounded-md p-4 py-10 my-4 hover:border-indigo-500 hover:text-indigo-700 cursor-pointer transition-colors">
                    {resume ? (
                      <p className="text-indigo-700">{resume.name}</p>
                    ) : (
                      <>
                        <UploadCloud className="size-14 stroke-1" />
                        <p>Upload resume</p>
                      </>
                    )}
                  </div>
                </label>
                <input
                  type="file"
                  id="resume-input"
                  accept=".pdf"
                  hidden
                  onChange={(e) => setResume(e.target.files[0])}
                />
              </div>
              <button className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
                Upload Resume
              </button>
              <XIcon
                className="size-6 absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                onClick={() => { setUploadResumes(false); setTitle(''); }}
              />
            </div>
          </form>
        )}

        {editResumeId && (
          <form onSubmit={editTitle} onClick={() => setEditResumeId('')} className="fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-10 flex items-center justify-center">
            <div onClick={(e) => e.stopPropagation()} className="relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6">
              <h2 className="text-xl font-bold mb-4">Edit Resume Title</h2>
              <input
                onChange={(e) => { setTitle(e.target.value); }}
                value={title}
                type="text"
                placeholder="Enter resume title"
                className="w-full px-4 py-2 mb-4 focus:border-indigo-600 ring-indigo-600"
                required
              />
              <button className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
                Update
              </button>
              <XIcon
                className="size-6 absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                onClick={() => { setEditResumeId(''); setTitle(''); }} 
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Dashboard;