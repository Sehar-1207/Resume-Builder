import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import ResumePreview from "../components/ResumePreview";
import Loader from "../components/Loader";
import { ArrowLeftIcon, Download } from "lucide-react";
import api from "../configs/api"; 
import { toast } from "react-hot-toast";

function Review() {
  const { resumeId } = useParams();
  
  const resumePrintRef = useRef(null);

  const [resumeData, setResumeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadResume = async () => {
    try {
      const { data } = await api.get(`/api/resumes/public/${resumeId}`);
      
      if (data.resume) {
        // Normalization Bridge: Ensure both 'project' and 'projects' exist 
        // to prevent frontend components from breaking due to schema mismatches
        const normalizedResume = {
          ...data.resume,
          project: data.resume.project || data.resume.projects || [],
          projects: data.resume.projects || data.resume.project || []
        };
        setResumeData(normalizedResume);
      }
    } catch (error) {
      console.error("Public fetch error:", error);
      const errMsg = error.response?.data?.message || "Failed to load public resume.";
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResume();
  }, [resumeId]);

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

  if (isLoading) {
    return <Loader />;
  }

  if (!resumeData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-center text-4xl text-slate-400 font-medium">
          No resume found
        </p>
        <p className="text-slate-500 mt-2 text-sm">
          Please verify that this resume has been toggled to "Public" and saved in the dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen pb-10">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <span className="text-slate-700 font-medium text-sm truncate max-w-[200px] sm:max-w-xs">
            {resumeData.title || "Viewing Resume"}
          </span>

          <button
            onClick={handleDownload}
            className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg px-4 h-9 flex items-center text-sm font-medium shadow-sm transition-colors"
          >
            <Download className="mr-2 size-4" />
            Download Resume
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto mt-6 px-4">
        <div ref={resumePrintRef} className="bg-white shadow-md rounded-sm overflow-hidden">
          <ResumePreview
            data={resumeData}
            template={resumeData.template}
            accentColor={resumeData.accent_color}
            classes="py-4 bg-white"
          />
        </div>
      </div>
    </div>
  );
}

export default Review;