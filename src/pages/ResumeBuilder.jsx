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
  EyeOff,
  Download,
  Check,
} from "lucide-react";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";

import PersonalInfoForm from "../components/PersonalInfoForm";
import { dummyResumeData } from "../assets/assets.js";
import ResumePreview from "../components/ResumePreview";
import TemplateSelector from "../components/TemplateSelector";
import ColorPicker from "../components/ColorPicker";
import ProfessionalSummary from "../components/ProfessionalSummary";
import ExperienceForm from "../components/ExperienceForm";
import EducationForm from "../components/EducationForm";
import ProjectForm from "../components/ProjectForm";
import SkillsForm from "../components/SkillsForm";

function ResumeBuilder() {
  const { resumeId } = useParams();

  const [resumeData, setResumeData] = useState({
    _id: "",
    title: "",
    personal_info: {},
    professional_summary: "",
    experience: [],
    education: [],
    projects: [],
    skills: [],
    template: "classic",
    accent_color: "#3B82F6",
    public: false,
  });

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [visibilityLoading, setVisibilityLoading] = useState(false);

  const loadExistingResume = () => {
    if (typeof dummyResumeData !== "undefined") {
      const resume = dummyResumeData.find((r) => r._id === resumeId);
      if (resume) {
        setResumeData({
          ...resume,
          projects: resume.projects || [],
          experience: resume.experience || [],
          education: resume.education || [],
          skills: resume.skills || [],
        });
        document.title = resume.title;
      }
    }
  };

  useEffect(() => {
    loadExistingResume();
  }, [resumeId]);

  const sections = [
    { id: "personal", name: "Personal Info", icon: User },
    { id: "summary", name: "Summary", icon: FileText },
    { id: "experience", name: "Experience", icon: Briefcase },
    { id: "education", name: "Education", icon: GraduationCap },
    { id: "projects", name: "Projects", icon: FolderIcon },
    { id: "skills", name: "Skills", icon: Sparkle },
  ];

  const activeSection = sections[activeSectionIndex];

  // ─── SAVE CHANGES ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      // Replace with your actual API endpoint
      await fetch(`/api/resumes/${resumeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resumeData),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error("Failed to save resume:", err);
      alert("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── VISIBILITY TOGGLE ───────────────────────────────────────────────────────
  const resumeVisibility = async () => {
    const newPublic = !resumeData.public;
    setResumeData((prev) => ({ ...prev, public: newPublic }));
    setVisibilityLoading(true);

    try {
      // Replace with your actual API endpoint
      await fetch(`/api/resumes/${resumeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public: newPublic }),
      });
    } catch (err) {
      console.error("Failed to update visibility:", err);
      // Revert on failure
      setResumeData((prev) => ({ ...prev, public: !newPublic }));
    } finally {
      setVisibilityLoading(false);
    }
  };

  // ─── SHARE ───────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    const frontendUrl = window.location.href.split("/app/")[0];
    const resumeUrl = `${frontendUrl}/view/${resumeId}`;

    // Try native share API first (works on mobile & HTTPS desktop)
    if (navigator.share) {
      try {
        await navigator.share({ title: resumeData.title || "My Resume", url: resumeUrl });
        return;
      } catch (err) {
        // User cancelled or share failed — fall through to clipboard
        if (err.name === "AbortError") return;
      }
    }

    // Clipboard API (modern browsers)
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(resumeUrl);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2500);
        return;
      } catch (err) {
        console.warn("Clipboard API failed:", err);
      }
    }

    // Legacy fallback
    try {
      const input = document.createElement("input");
      input.value = resumeUrl;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.focus();
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch (err) {
      alert(`Copy this link manually:\n${resumeUrl}`);
    }
  };

  // ─── DOWNLOAD (open new window with only resume content, then print) ─────────
  const downloadResume = useCallback(() => {
    const previewEl = document.getElementById("resume-preview-wrapper");
    if (!previewEl) {
      alert("Resume preview not found. Please try again.");
      return;
    }

    // Clone the resume HTML so we don't touch the live DOM
    const resumeHTML = previewEl.innerHTML;

    // Collect all stylesheets from the current page
    const styleSheets = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          // Inline <style> tags
          if (!sheet.href) {
            const rules = Array.from(sheet.cssRules || [])
              .map((r) => r.cssText)
              .join("\n");
            return `<style>${rules}</style>`;
          }
          // External <link> stylesheets
          return `<link rel="stylesheet" href="${sheet.href}" />`;
        } catch {
          // Cross-origin sheets can't be read — link them by href if available
          return sheet.href
            ? `<link rel="stylesheet" href="${sheet.href}" />`
            : "";
        }
      })
      .join("\n");

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      alert("Popup blocked. Please allow popups for this site and try again.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>${resumeData.title || "Resume"}</title>
          ${styleSheets}
          <style>
            @page { margin: 0; }
            body {
              margin: 0;
              padding: 0;
              background: white;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          </style>
        </head>
        <body>
          <div id="resume-preview-wrapper">
            ${resumeHTML}
          </div>
          <script>
            // Wait for all stylesheets to load, then print
            window.onload = function () {
              setTimeout(function () {
                window.print();
                window.onafterprint = function () { window.close(); };
              }, 500);
            };
          <\/script>
        </body>
      </html>
    `);

    printWindow.document.close();
  }, [resumeData.title]);

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link
          to="/app"
          className="inline-flex gap-2 items-center text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid lg:grid-cols-12 gap-8">

          {/* ── LEFT SIDE ── */}
          <div className="lg:col-span-5 bg-white rounded-lg shadow-sm border p-6">

            {/* Template + Color */}
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <TemplateSelector
                selectedTemplate={resumeData.template}
                onChange={(template) =>
                  setResumeData((prev) => ({ ...prev, template }))
                }
              />
              <ColorPicker
                selectedColor={resumeData.accent_color}
                onChange={(color) =>
                  setResumeData((prev) => ({ ...prev, accent_color: color }))
                }
              />
            </div>

            {/* Section Nav */}
            <div className="flex justify-between items-center mb-4">
              {activeSectionIndex > 0 ? (
                <button
                  onClick={() =>
                    setActiveSectionIndex((p) => Math.max(p - 1, 0))
                  }
                  className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
              ) : (
                <span />
              )}

              <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                {activeSectionIndex + 1} / {sections.length} —{" "}
                {activeSection.name}
              </span>

              {activeSectionIndex < sections.length - 1 ? (
                <button
                  onClick={() =>
                    setActiveSectionIndex((p) =>
                      Math.min(p + 1, sections.length - 1)
                    )
                  }
                  className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <span />
              )}
            </div>

            {/* Forms */}
            <div className="space-y-6">
              {activeSection.id === "personal" && (
                <PersonalInfoForm
                  data={resumeData.personal_info || {}}
                  onChange={(data) =>
                    setResumeData((prev) => ({ ...prev, personal_info: data }))
                  }
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
                />
              )}
              {activeSection.id === "experience" && (
                <ExperienceForm
                  data={resumeData.experience}
                  onChange={(data) =>
                    setResumeData((prev) => ({ ...prev, experience: data }))
                  }
                />
              )}
              {activeSection.id === "education" && (
                <EducationForm
                  data={resumeData.education}
                  onChange={(data) =>
                    setResumeData((prev) => ({ ...prev, education: data }))
                  }
                />
              )}
              {activeSection.id === "projects" && (
                <ProjectForm
                  data={resumeData.projects}
                  onChange={(data) =>
                    setResumeData((prev) => ({ ...prev, projects: data }))
                  }
                />
              )}
              {activeSection.id === "skills" && (
                <SkillsForm
                  data={resumeData.skills}
                  onChange={(data) =>
                    setResumeData((prev) => ({ ...prev, skills: data }))
                  }
                />
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`mt-6 px-6 py-2 text-sm rounded flex items-center gap-2 transition-colors ${
                saveSuccess
                  ? "bg-green-500 text-white"
                  : "bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-60"
              }`}
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Saved!
                </>
              ) : isSaving ? (
                "Saving..."
              ) : (
                "Save Changes"
              )}
            </button>
          </div>

          {/* ── RIGHT SIDE ── */}
          <div className="lg:col-span-7 relative">

            {/* Action Buttons */}
            <div className="absolute bottom-3 right-0 flex gap-2 z-10">

              {/* Share — only visible when public */}
              {resumeData.public && (
                <button
                  onClick={handleShare}
                  className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                    copySuccess
                      ? "bg-green-100 text-green-600"
                      : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  }`}
                >
                  {copySuccess ? (
                    <>
                      <Check className="w-4 h-4" /> Copied!
                    </>
                  ) : (
                    <>
                      <Share2Icon className="w-4 h-4" /> Share
                    </>
                  )}
                </button>
              )}

              {/* Public / Private toggle */}
              <button
                onClick={resumeVisibility}
                disabled={visibilityLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-100 text-purple-600 hover:bg-purple-200 rounded-lg disabled:opacity-60 transition-colors"
              >
                {resumeData.public ? (
                  <>
                    <Eye className="w-4 h-4" /> Public
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" /> Private
                  </>
                )}
              </button>

              {/* Download */}
              <button
                onClick={downloadResume}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-100 text-purple-600 hover:bg-purple-200 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </div>

            {/* Resume Preview — wrapped with id for print targeting */}
            <div id="resume-preview-wrapper">
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