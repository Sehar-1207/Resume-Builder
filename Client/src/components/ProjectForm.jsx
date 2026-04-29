import { Plus, Trash2 } from "lucide-react";
import React from "react";

const ProjectForm = ({ data = [], onChange }) => {
  const addProject = () => {
    const newProject = {
      name: "",
      type: "",
      description: "",
    };
    onChange([...(data || []), newProject]);
  };

  const RemoveProject = (index) => {
    const update = data.filter((_, i) => i !== index);
    onChange(update);
  };

  const UpdateProject = (index, field, value) => {
    const update = [...data];
    update[index] = { ...update[index], [field]: value };
    onChange(update);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            Project
          </h3>
          <p className="text-sm text-gray-500">Add your Projects</p>
        </div>

        <button
          onClick={addProject}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
        >
          <Plus className="size-4" />
          Add Project
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          No projects added yet
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((project, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg space-y-3"
            >
              <div className="flex justify-between items-start">
                <h4>Project #{index + 1}</h4>

                <button
                  className="text-red-500 hover:text-red-700 transition-colors"
                  onClick={() => RemoveProject(index)}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Project Name"
                  className="px-3 py-2 text-sm rounded-lg"
                  value={project.name || ""}
                  onChange={(e) =>
                    UpdateProject(index, "name", e.target.value)
                  }
                />

                <input
                  type="text"
                  placeholder="Project Type"
                  className="px-3 py-2 text-sm rounded-lg"
                  value={project.type || ""}
                  onChange={(e) =>
                    UpdateProject(index, "type", e.target.value)
                  }
                />

                <textarea
                  rows={4}
                  className="md:col-span-2 w-full px-3 py-2 text-sm rounded-lg resize-none"
                  value={project.description || ""}
                  onChange={(e) =>
                    UpdateProject(index, "description", e.target.value)
                  }
                  placeholder="Describe your project..."
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectForm;