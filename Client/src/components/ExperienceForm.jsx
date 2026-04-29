import { Briefcase, Plus, SparkleIcon, Trash2 } from "lucide-react";
import React from "react";

const ExperienceForm = ({ data, onChange }) => {
  const addExperience = () => {
    const newExperience = {
      company: "",
      position: "",
      start_date: "",
      end_date: "",
      description: "",
      is_current: false,
    };
    onChange([...data, newExperience]);
  };

  const RemoveExperience = (index) => {
    const update = data.filter((_, i) => i !== index);
    onChange(update);
  };

  const UpdateExperience = (index, field, value) => {
    const update = [...data];
    update[index] = { ...update[index], [field]: value };
    onChange(update);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            Professional Experience
          </h3>
          <p className="text-sm text-gray-500">
            Add your job experience here
          </p>
        </div>

        <button
          onClick={addExperience}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
        >
          <Plus className="size-4" />
          Add Experience
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No work experience added yet.</p>
          <p className="text-sm">
            Click "Add Experience" to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((experience, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg space-y-3"
            >
              <div className="flex justify-between items-start">
                <h4>Experience #{index + 1}</h4>

                <button
                  className="text-red-500 hover:text-red-700 transition-colors"
                  onClick={() => RemoveExperience(index)}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Company Name"
                  className="px-3 py-2 text-sm rounded-lg"
                  value={experience.company || ""}
                  onChange={(e) =>
                    UpdateExperience(index, "company", e.target.value)
                  }
                />

                <input
                  type="text"
                  placeholder="Job Title"
                  className="px-3 py-2 text-sm rounded-lg"
                  value={experience.position || ""}
                  onChange={(e) =>
                    UpdateExperience(index, "position", e.target.value)
                  }
                />

                <input
                  type="month"
                  className="px-3 py-2 text-sm rounded-lg"
                  value={experience.start_date || ""}
                  onChange={(e) =>
                    UpdateExperience(index, "start_date", e.target.value)
                  }
                />

                <input
                  type="month"
                  className="px-3 py-2 text-sm rounded-lg disabled:bg-gray-100"
                  value={experience.end_date || ""}
                  disabled={experience.is_current}
                  onChange={(e) =>
                    UpdateExperience(index, "end_date", e.target.value)
                  }
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={experience.is_current || false}
                  onChange={(e) =>
                    UpdateExperience(
                      index,
                      "is_current",
                      e.target.checked
                    )
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />

                <span className="text-sm text-gray-700">
                  Currently working here
                </span>
              </label>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Job Description
                  </label>

                  <button className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50">
                    <SparkleIcon className="w-3 h-3" />
                    Enhance with AI
                  </button>
                </div>

                <textarea
                  className="w-full text-sm px-3 py-2 rounded-lg resize-none"
                  rows={4}
                  value={experience.description || ""}
                  onChange={(e) =>
                    UpdateExperience(
                      index,
                      "description",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExperienceForm;