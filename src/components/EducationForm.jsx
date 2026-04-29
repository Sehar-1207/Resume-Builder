import { GraduationCap, Trash2, Plus } from "lucide-react";
import React from "react";

const EducationForm = ({ data, onChange }) => {
  const addEducation = () => {
    const newEducation = {
      institution: "",
      degree: "",
      field: "",
      graduation_date: "",
      gpa: "",
    };
    onChange([...data, newEducation]);
  };

  const RemoveEducation = (index) => {
    const update = data.filter((_, i) => i !== index);
    onChange(update);
  };

  const UpdateEducation = (index, field, value) => {
    const update = [...data];
    update[index] = { ...update[index], [field]: value };
    onChange(update);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            Education
          </h3>
          <p className="text-sm text-gray-500">
            Add your educational background here
          </p>
        </div>

        <button
          onClick={addEducation}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
        >
          <Plus className="size-4" />
          Add Education
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No education added yet.</p>
          <p className="text-sm">Click "Add Education to get started."</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((education, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg space-y-3"
            >
              <div className="flex justify-between items-start">
                <h4>Education #{index + 1}</h4>

                <button
                  className="text-red-500 hover:text-red-700 transition-colors"
                  onClick={() => RemoveEducation(index)}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Institute Name"
                  className="px-3 py-2 text-sm rounded-lg"
                  value={education.institution || ""}
                  onChange={(e) =>
                    UpdateEducation(index, "institution", e.target.value)
                  }
                />

                <input
                  type="text"
                  placeholder="Degree"
                  className="px-3 py-2 text-sm rounded-lg"
                  value={education.degree || ""}
                  onChange={(e) =>
                    UpdateEducation(index, "degree", e.target.value)
                  }
                />

                <input
                  type="text"
                  className="px-3 py-2 text-sm rounded-lg"
                  value={education.field || ""}
                  onChange={(e) =>
                    UpdateEducation(index, "field", e.target.value)
                  }
                  placeholder="Field of Study"
                />

                <input
                  type="month"
                  className="px-3 py-2 text-sm rounded-lg disabled:bg-gray-100"
                  value={education.graduation_date || ""}
                  onChange={(e) =>
                    UpdateEducation(index, "graduation_date", e.target.value)
                  }
                />
              </div>

              <input
                type="text"
                className="px-3 py-2 text-sm rounded-lg w-full"
                value={education.gpa || ""}
                onChange={(e) =>
                  UpdateEducation(index, "gpa", e.target.value)
                }
                placeholder="GPA (optional)"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EducationForm;