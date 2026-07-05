import React, { useEffect, useState } from "react";
import {
  FilePenLineIcon,
  PencilIcon,
  PlusIcon,
  UploadCloudIcon,
  UploadCloud,
  TrashIcon,
  XIcon,
  LoaderCircleIcon,
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import pdfToText from 'react-pdftotext';
import api from '../configs/api.js';

function Dashboard() {
  const { user, token } = useSelector(state => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [allResumes, setAllResumes] = useState([]);
  const [showCreateResume, setShowCreateResume] = useState(false);
  const [showUploadResume, setUploadResumes] = useState(false);
  const [title, setTitle] = useState('');
  const [resume, setResume] = useState(null);
  const [editResumeId, setEditResumeId] = useState('');
  const navigate = useNavigate();

  const createResume = async (event) => {
    try {
      event.preventDefault();
      const { data } = await api.post('/api/resumes/create', { title }, { headers: { Authorization: token } });
      setAllResumes([...allResumes, data.resume]);
      setTitle('');
      setShowCreateResume(false);
      navigate(`/app/builder/${data.resume._id}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const uploadResume = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const resumeText = await pdfToText(resume);
      const { data } = await api.post(
        '/api/ai/uploadResume',
        { title, resumeText },
        { headers: { Authorization: token } }
      );

      setTitle('');
      setResume(null);
      setUploadResumes(false);

      // Navigates using data.resumeId directly to match your backend response structure
      if (data?.resumeId) {
        navigate(`/app/builder/${data.resumeId}`);
      } else if (data?.resume?._id) {
        navigate(`/app/builder/${data.resume._id}`);
      } else {
        toast.error("Resume processed, but navigation identifier was missing.");
      }

    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
    setIsLoading(false);
  };

  const editTitle = async (e) => {
    try {
      e.preventDefault();
      const { data } = await api.put(`/api/resumes/update`, { resumeId: editResumeId, resumeData: { title } }, { headers: { Authorization: token } });
      setAllResumes(allResumes.map(resume => resume._id === editResumeId ? { ...resume, title } : resume));
      setEditResumeId('');
      setTitle('');
      toast.success(data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const loadAllResumes = async () => {
    try {
      const { data } = await api.get('/api/users/resumes', { headers: { Authorization: token } });
      setAllResumes(data.resumes || data.resume || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const deleteResume = async (resumeId) => {
    try {
      const isConfirmed = window.confirm('Are you sure you want to delete this resume?');
      if (isConfirmed) {
        const { data } = await api.delete(`/api/resumes/delete/${resumeId}`, { headers: { Authorization: token } });
        setAllResumes(allResumes.filter(res => res._id !== resumeId));
        toast.success(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const colors = ["#9333ea", "#d97706", "#dc2626", "#0284c7", "#16a34a"];


  useEffect(() => {
    if (token) {
      loadAllResumes();
    } else {
      console.log("No token available in Redux state yet!");
    }
  }, [token]);

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-2xl font-medium mb-6 bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent sm:block">
          Welcome, {user?.name || "Suman"}
        </p>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setShowCreateResume(true)} 
            className="w-full bg-white sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-indigo-500 hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <PlusIcon className="size-11 transition-all duration-300 p-2.5 bg-gradient-to-br from-indigo-300 to-indigo-500 text-white rounded-full" />
            <p className="text-sm group-hover:text-indigo-600 transition-all">
              Create Resume
            </p>
          </button>

          <button
            type="button"
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
              <div
                key={resume._id || index}
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
                  className="text-sm group-hover:scale-105 transition-all px-2 text-center line-clamp-2"
                  style={{ color: basecolor }}
                >
                  {resume.title}
                </p>

                {resume.updatedAt && (
                  <p
                    className="absolute bottom-1 text-[11px] group-hover:text-slate-500 transition-all duration-300 px-2 text-center"
                    style={{ color: basecolor + "90" }}
                  >
                    Updated on {new Date(resume.updatedAt).toLocaleDateString()}
                  </p>
                )}

                <div
                  className="absolute top-1 right-1 group-hover:flex items-center hidden gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <TrashIcon
                    className="size-7 p-1.5 hover:bg-white/50 rounded hover:text-red-600 text-slate-500 transition-colors cursor-pointer"
                    onClick={() => deleteResume(resume._id)}
                  />
                  <PencilIcon
                    className="size-7 p-1.5 hover:bg-white/50 rounded hover:text-slate-700 text-slate-500 transition-colors cursor-pointer"
                    onClick={() => { setEditResumeId(resume._id); setTitle(resume.title); }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {showCreateResume && (
          <div onClick={() => { setShowCreateResume(false); setTitle(''); }} className="fixed inset-0 bg-black/70 backdrop-blur z-50 flex items-center justify-center">
            <form onSubmit={createResume} onClick={(e) => e.stopPropagation()} className="relative bg-white border shadow-md rounded-lg w-full max-w-sm p-6">
              <h2 className="text-xl font-bold mb-4">Create a Resume</h2>
              <input
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                type="text"
                placeholder="Enter resume title"
                className="w-full px-4 py-2 mb-4 border border-slate-300 rounded focus:outline-indigo-600"
                required
              />
              <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
                Create Resume
              </button>
              <XIcon
                className="size-6 absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                onClick={() => { setShowCreateResume(false); setTitle(''); }} // Updated function call
              />
            </form>
          </div>
        )}

        {showUploadResume && (
          <div onClick={() => { setUploadResumes(false); setTitle(''); setResume(null); }} className="fixed inset-0 bg-black/70 backdrop-blur z-50 flex items-center justify-center">
            <form onSubmit={uploadResume} onClick={(e) => e.stopPropagation()} className="relative bg-white border shadow-md rounded-lg w-full max-w-sm p-6">
              <h2 className="text-xl font-bold mb-4">Upload a Resume</h2>
              <input
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                type="text"
                placeholder="Enter resume title"
                className="w-full px-4 py-2 mb-4 border border-slate-300 rounded focus:outline-indigo-600"
                required
              />
              <div>
                <label htmlFor="resume-input" className="block text-sm text-slate-700">
                  Select resume file
                  <div className="flex flex-col items-center justify-center gap-2 border group text-slate-400 border-slate-400 border-dashed rounded-md p-4 py-10 my-4 hover:border-indigo-500 hover:text-indigo-700 cursor-pointer transition-colors">
                    {resume ? (
                      <p className="text-indigo-700 font-medium break-all">{resume.name}</p>
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
                  required
                />
              </div>
              <button disabled={isLoading} type="submit" disabled={isLoading} className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                {isLoading && <LoaderCircleIcon className='animate-spin size-4 text-white' />}
                {isLoading ? 'Uploading...' : 'Upload Resume'}
              </button>
              <XIcon
                className="size-6 absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                onClick={() => { setUploadResumes(false); setTitle(''); setResume(null); }}
              />
            </form>
          </div>
        )}

        {editResumeId && (
          <div onClick={() => { setEditResumeId(''); setTitle(''); }} className="fixed inset-0 bg-black/70 backdrop-blur z-50 flex items-center justify-center">
            <form onSubmit={editTitle} onClick={(e) => e.stopPropagation()} className="relative bg-white border shadow-md rounded-lg w-full max-w-sm p-6">
              <h2 className="text-xl font-bold mb-4">Edit Resume Title</h2>
              <input
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                type="text"
                placeholder="Enter resume title"
                className="w-full px-4 py-2 mb-4 border border-slate-300 rounded focus:outline-indigo-600"
                required
              />
              <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
                Update
              </button>
              <XIcon
                className="size-6 absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                onClick={() => { setEditResumeId(''); setTitle(''); }}
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;