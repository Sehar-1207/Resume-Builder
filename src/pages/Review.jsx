import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { dummyResumeData } from "../assets/assets.js";
import ResumePreview from "../components/ResumePreview.jsx";
import Loader from "../components/Loader.jsx";
import { ArrowLeftIcon } from "lucide-react";

function Review() {
  const { resumeId } = useParams();

  const [resumeData, setResumeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadResume = () => {
    const resume = dummyResumeData.find(
      (resume) => resume._id === resumeId
    );

    setResumeData(resume || null);
    setIsLoading(false);
  };

  useEffect(() => {
    loadResume();
  }, [resumeId]);

  if (isLoading) {
    return <Loader />;
  }

  if (!resumeData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-center text-4xl text-slate-400 font-medium">
          No resume found
        </p>

        <Link
          to="/app"
          className="mt-6 bg-indigo-500 hover:bg-indigo-600 text-white 
          rounded-full px-6 h-10 flex items-center 
          ring-1 ring-indigo-400 transition-colors"
        >
          <ArrowLeftIcon className="mr-2 size-4" />
          Go to home page
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen">
      <div className="max-w-3xl mx-auto py-10">
        <ResumePreview
          data={resumeData}
          template={resumeData.template}
          accentColor={resumeData.accent_color}
          classes="py-4 bg-white"
        />
      </div>
    </div>
  );
}

export default Review;