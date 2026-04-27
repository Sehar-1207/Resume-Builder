import {
  BriefcaseBusiness,
  Globe,
  Mail,
  MapPin,
  Phone,
  User2,
Link as LinkIcon,
} from "lucide-react";
import React from "react";

const PersonalInfoForm = ({
  data = {},
  onChange,
  removeBackground,
  setRemoveBackground,
}) => {
  const handleChange = (field, value) => {
    // Corrected to use the prop 'onChange'
    onChange({ ...data, [field]: value });
  };

  const fields = [
    { key: "full_name", label: "Full Name", icon: User2, type: "text", required: true },
    { key: "email", label: "Email Address", icon: Mail, type: "email", required: true },
    { key: "phone", label: "Phone Number", icon: Phone, type: "tel" },
    { key: "location", label: "Location", icon: MapPin, type: "text" },
    { key: "profession", label: "Profession", icon: BriefcaseBusiness, type: "text" },
    { key: "linkedin", label: "LinkedIn profile", icon: LinkIcon, type: "url" },
    { key: "website", label: "Personal Website", icon: Globe, type: "url" },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
      <p className="text-sm text-gray-600 mb-4">Get started with your basic details</p>
      
      <div className="flex items-center gap-6 mb-6">
        <label className="relative cursor-pointer">
          {data.image ? (
            <img
              src={typeof data.image === "string" ? data.image : URL.createObjectURL(data.image)}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover ring-2 ring-indigo-100 hover:opacity-90 transition-opacity"
            />
          ) : (
            <div className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-full text-gray-400 hover:border-indigo-400 hover:text-indigo-400 transition-colors">
              <User2 className="size-8" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleChange("image", e.target.files[0])}
          />
        </label>

        {data.image && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500 uppercase">Background Remover</span>
            <button 
              onClick={() => setRemoveBackground(!removeBackground)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${removeBackground ? 'bg-indigo-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${removeBackground ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => {
          const Icon = field.icon;
          return (
            <div key={field.key} className="space-y-1">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Icon className="size-4 text-gray-400" />
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </label>
              <input
                type={field.type}
                value={data[field.key] || ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                placeholder={`Enter ${field.label.toLowerCase()}`}
                required={field.required}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PersonalInfoForm;