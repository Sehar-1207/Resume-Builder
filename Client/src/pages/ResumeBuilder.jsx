import {
  ArrowLeft,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  FileText,
  FolderIcon,
  GraduationCap,
  Sparkle,
  User,
  Share2Icon,
  Eye,
  EyeClosed,
  Download,
} from "lucide-react";

import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from 'react-redux';
import { toast } from "react-hot-toast"; 

import PersonalInfoForm from "../components/PersonalInfoForm";
import ResumePreview from "../components/ResumePreview";
import TemplateSelector from "../components/TemplateSelector";
import ColorPicker from "../components/ColorPicker";
import ProfessionalSummary from "../components/ProfessionalSummary";
import ExperienceForm from "../components/ExperienceForm";
import EducationForm from "../components/EducationForm";
import ProjectForm from "../components/ProjectForm";
import SkillsForm from "../components/SkillsForm";

import api from '../configs/api';

function ResumeBuilder() {
  const { resumeId } = useParams();
  const { token } = useSelector(state => state.auth);
  
  const resumePrintRef = useRef(null); 

  const [resumeData, setResumeData] = useState({
    _id: "",
    title: "",
    personal_info: {},
    professional_summary: "",
    experience: [],
    education: [],
    project: [],
    skills: [],
    template: "classic",
    accent_color: "#3B82F6",
    public: false,
  });

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [removeBackground, setRemoveBackground] = useState(false);

  const sections = [
    { id: "personal", name: "Personal Info", icon: User },
    { id: "summary", name: "Summary", icon: FileText },
    { id: "experience", name: "Experience", icon: Briefcase },
    { id: "education", name: "Education", icon: GraduationCap },
    { id: "project", name: "Project", icon: FolderIcon },
    { id: "skills", name: "Skills", icon: Sparkle },
  ];

  const activeSection = sections[activeSectionIndex];

  const loadExistingResume = async () => {
    if (!resumeId) return;
    try {
      const { data } = await api.get('/api/resumes/get/' + resumeId, { headers: { Authorization: token } });
      if (data.resume) {
        // Safe mapping to ensure project state bridges plural differences safely
        const normalizedData = {
          ...data.resume,
          project: data.resume.project || data.resume.projects || [],
          projects: data.resume.projects || data.resume.project || []
        };
        setResumeData(normalizedData);
        document.title = normalizedData.title || "Resume Builder";
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    loadExistingResume();
  }, [resumeId]);

  const resumeVisibility = async () => {
    try {
      const nextVisibilityState = !resumeData.public;
      
      const { data } = await api.put('/api/resumes/update-visibility', {
        resumeId,
        public: nextVisibilityState
      }, { 
        headers: { 
          Authorization: token,
          'Content-Type': 'application/json' 
        } 
      });

      if (data.resume) {
        setResumeData((prev) => ({
          ...prev,
          ...data.resume,
          project: data.resume.project || data.resume.projects || [],
          projects: data.resume.projects || data.resume.project || []
        }));
        toast.success(data.message || "Visibility updated successfully");
      }
    } catch (error) {
      console.error("Visibility toggle error:", error);
      toast.error(error.response?.data?.message || "Error updating visibility");
    }
  };

  const handleShare = () => {
    const frontendUrl = window.location.origin;
    const resumeUrl = `${frontendUrl}/view/${resumeId}`;

    if (navigator.share) {
      navigator.share({
        title: resumeData.title || "My Resume",
        url: resumeUrl,
      });
    } else {
      navigator.clipboard.writeText(resumeUrl);
      toast.success("Resume link copied to clipboard");
    }
  };

  // FIXED: Implemented the missing local HTML printing engine 
  const handleDownload = () => {
    const targetElement = resumePrintRef.current;
    if (!targetElement) return;

    const styleSheets = Array.from(document.styleSheets);
    let cssStyles = "";
    try {
      styleSheets.forEach((sheet) => {
        const rules = Array.from(sheet.cssRules || sheet.rules);
        rules.forEach((rule) => {
          cssStyles += rule.cssText;
        });
      });
    } catch (e) {
      cssStyles = ""; 
    }

    const completeHtmlDoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${resumeData.title || "Resume"}</title>
          <style>
            ${cssStyles}
            body { background: white; margin: 0; padding: 20px; }
          </style>
        </head>
        <body>
          <div>${targetElement.innerHTML}</div>
        </body>
      </html>
    `;

    const fileBlob = new Blob([completeHtmlDoc], { type: "text/html" });
    const localDownloadUrl = URL.createObjectURL(fileBlob);
    
    const temporaryLink = document.createElement("a");
    temporaryLink.href = localDownloadUrl;
    temporaryLink.download = `${resumeData.title || "Resume"}.html`;
    
    document.body.appendChild(temporaryLink);
    temporaryLink.click();
    
    document.body.removeChild(temporaryLink);
    URL.revokeObjectURL(localDownloadUrl);
    
    toast.success("File downloaded successfully!");
  };

  const saveResume = async () => {
    try {
      let updatedResumeData = structuredClone(resumeData);
      if (typeof resumeData.personal_info?.image === 'object') {
        delete updatedResumeData.personal_info.image;
      }

      // Sync plural/singular arrays explicitly before sending
      if (updatedResumeData.project) {
        updatedResumeData.projects = updatedResumeData.project;
      }

      const formData = new FormData();
      formData.append("resumeId", resumeId);

      Object.keys(updatedResumeData).forEach((key) => {
        if (key === "_id" && !updatedResumeData[key]) return;

        if (typeof updatedResumeData[key] === "object") {
          formData.append(key, JSON.stringify(updatedResumeData[key]));
        } else {
          formData.append(key, updatedResumeData[key]);
        }
      });

      if (removeBackground) formData.append("removeBackground", "yes");

      if (typeof resumeData.personal_info?.image === 'object' && resumeData.personal_info.image !== null) {
        formData.append("image", resumeData.personal_info.image);
      }

      const { data } = await api.put('/api/resumes/update', formData, {
        headers: {
          Authorization: token,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (data.resume) {
        setResumeData((prev) => ({
          ...prev,
          ...data.resume,
          project: data.resume.project || data.resume.projects || [],
          projects: data.resume.projects || data.resume.project || []
        }));
      }
      toast.success(data.message || "Changes saved successfully");
    } catch (error) {
      console.error("Server validation response error:", error.response?.data);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link
          to={"/app"}
          className="inline-flex gap-2 items-center text-slate-500 hover:text-slate-700 transition-all"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* LEFT SIDE */}
          <div className="relative lg:col-span-5 rounded-lg overflow-hidden">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 pt-1">
              <hr className="absolute top-0 left-0 right-0 border-2 border-gray-200" />

              <hr
                className="absolute top-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600 border-none transition-all duration-1000"
                style={{
                  width: `${(activeSectionIndex * 100) / (sections.length - 1)}%`,
                }}
              />

              {/* Header */}
              <div className="flex justify-between items-center mb-6 border-b border-gray-300 py-1">
                <div className="flex items-center gap-2">
                  <TemplateSelector
                    selectedTemplate={resumeData.template}
                    onChange={(template) =>
                      setResumeData((prev) => ({ ...prev, template }))
                    }
                  />

                  <ColorPicker
                    selectedColor={resumeData.accent_color}
                    onChange={(color) =>
                      setResumeData((prev) => ({
                        ...prev,
                        accent_color: color,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center">
                  {activeSectionIndex !== 0 && (
                    <button
                      onClick={() =>
                        setActiveSectionIndex((prev) => Math.max(prev - 1, 0))
                      }
                      className="flex items-center gap-1 p-3 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                      <ChevronLeft className="size-4" />
                      Previous
                    </button>
                  )}

                  {activeSectionIndex !== sections.length - 1 && (
                    <button
                      onClick={() =>
                        setActiveSectionIndex((prev) =>
                          Math.min(prev + 1, sections.length - 1)
                        )
                      }
                      className="flex items-center gap-1 p-3 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                      Next
                      <ChevronRight className="size-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* FORMS */}
              <div className="space-y-6">
                {activeSection.id === "personal" && (
                  <PersonalInfoForm
                    data={resumeData.personal_info || {}}
                    onChange={(data) =>
                      setResumeData((prev) => ({
                        ...prev,
                        personal_info: data,
                      }))
                    }
                    removeBackground={removeBackground}
                    setRemoveBackground={setRemoveBackground}
                  />
                )}

                {activeSection.id === "summary" && (
                  <ProfessionalSummary
                    data={resumeData.professional_summary}
                    onChange={(data) =>
                      setResumeData((prev) => ({
                        ...prev,
                        professional_summary: data,
                      }))
                    }
                    setResumeData={setResumeData}
                  />
                )}

                {activeSection.id === "experience" && (
                  <ExperienceForm
                    data={resumeData.experience || []}
                    onChange={(data) =>
                      setResumeData((prev) => ({
                        ...prev,
                        experience: data,
                      }))
                    }
                  />
                )}

                {activeSection.id === "education" && (
                  <EducationForm
                    data={resumeData.education || []}
                    onChange={(data) =>
                      setResumeData((prev) => ({
                        ...prev,
                        education: data,
                      }))
                    }
                  />
                )}

                {activeSection.id === "project" && (
                  <ProjectForm
                    data={resumeData.project || []}
                    onChange={(data) =>
                      setResumeData((prev) => ({
                        ...prev,
                        project: data,
                      }))
                    }
                  />
                )}

                {activeSection.id === "skills" && (
                  <SkillsForm
                    data={resumeData.skills || []}
                    onChange={(data) =>
                      setResumeData((prev) => ({
                        ...prev,
                        skills: data,
                      }))
                    }
                  />
                )}
              </div>

              <button
                onClick={saveResume}
                className="bg-gradient-to-br from-indigo-200 to-indigo-300 text-indigo-700 hover:ring rounded-md px-6 py-2 mt-6 text-sm"
              >
                Save Changes
              </button>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:col-span-7 max-lg:mt-6">
            <div className="flex justify-end gap-2 mb-4">
              {resumeData.public && (
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                >
                  <Share2Icon size={16} />
                  Share
                </button>
              )}

              <button
                onClick={resumeVisibility}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
              >
                {resumeData.public ? (
                  <Eye size={16} />
                ) : (
                  <EyeClosed size={16} />
                )}
                {resumeData.public ? "Public" : "Private"}
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition"
              >
                <Download size={16} />
                Download
              </button>
            </div>

            <div ref={resumePrintRef}>
              <ResumePreview
                data={resumeData}
                template={resumeData.template}
                accentColor={resumeData.accent_color}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeBuilder;