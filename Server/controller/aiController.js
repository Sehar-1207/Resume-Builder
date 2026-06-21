import Resume from '../model/resume.js';
import ai from '../config/ai.js';

// post:/api/ai/enhance-pro-sum
export const enhanceProfessionalSummary = async (req, res) => {
    try {
        const { userContent } = req.body; 
        if (!userContent) {
            return res.status(400).json({ message: 'Missing required field' });
        }
        const response = await ai.chat.completions.create({
            model: process.env.GEMINI_MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are an expert in resume writing. Your task is to enhance the professional summary of a resume. The summary should be 1-2 sentences also highlighting key skills, experience, and career objectives. Make it compelling and ATS-friendly. And only return text no options or anything else."
                },
                {
                    role: "user",
                    content: userContent,
                },
            ],
        });
        const enhancedContent = response.choices[0].message.content;
        return res.status(200).json({ enhancedContent }); 
    } catch (error) {
        return res.status(400).json({ message: error.message }); 
    }
};

// post:/api/a/enhance-job-desc
export const enhanceJobDescription = async (req, res) => {
    try {
        const { userContent } = req.body; 
        if (!userContent) {
            return res.status(400).json({ message: 'Missing required field' });
        }
        const response = await ai.chat.completions.create({
            model: process.env.GEMINI_MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are an expert in resume writing. Your task us to enhance the job description of a resume. The job description should be only in 1-2 sentences also highlighting key responsibilities and achievements. Use action verbs and quantifiable results where possible. Make it ATS-friendly. And only return text no options no anything else."
                },
                {
                    role: "user",
                    content: userContent,
                },
            ],
        });
        const enhancedContent = response.choices[0].message.content;
        return res.status(200).json({ enhancedContent }); 
    } catch (error) {
        return res.status(400).json({ message: error.message }); 
    }
};

// post:/api/ai/upload-resume
export const UploadResume = async (req, res) => {
    try {
        const { resumeText, title } = req.body;
        const userId = req.userId;
        if (!resumeText) {
            return res.status(400).json({ message: 'Missing required field' });
        }
        
        const systemPrompt = "You are an expert AI agent to extract data from resume.";
        const userPrompt = `extract data from this resume: ${resumeText}  
        
        provide data in a raw JSON format mimicking a schema mapping where keys align to actual text content values:
        {
          "professional_summary": "",
          "skills": [""],
          "personal_info": {
            "image": "",
            "full_name": "",
            "profession": "",
            "email": "",
            "phone": "",
            "location": "",
            "linkedin": "",
            "website": ""
          },
          "experience": [
            {
              "company": "",
              "position": "",
              "start_date": "",
              "end_date": "",
              "description": "",
              "is_current": false
            }
          ],
          "projects": [
            {
              "name": "",
              "type": "",
              "description": ""
            }
          ],
          "education": [
            {
              "institution": "",
              "degree": "",
              "field": "",
              "graduation_date": "",
              "gpa": ""
            }
          ]
        }`;

        const response = await ai.chat.completions.create({
            model: process.env.GEMINI_MODEL,
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: userPrompt,
                },
            ],
            response_format: { type: "json_object" } 
        });

        const extractedData = response.choices[0].message.content;
        const parsedData = JSON.parse(extractedData); 
        const newResume = await Resume.create({ userId, title, ...parsedData });
        return res.status(200).json({ resumeId: newResume._id });
    } catch (error) {
        return res.status(400).json({ message: error.message }); 
    }
};