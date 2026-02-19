import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface StructuredJobData {
  title: string;
  company?: string;
  requirements: string[];
  extractedKeywords: string[];
  parsed: {
    responsibilities: string[];
    qualifications: {
      required: string[];
      preferred: string[];
    };
    skills: string[];
    experience_required: string;
  };
}

export interface StructuredResumeData {
  personal_data: {
    name: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  experiences: Array<{
    title: string;
    company: string;
    start_date: string;
    end_date: string;
    description: string;
  }>;
  skills: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  extracted_keywords: string[];
}

/**
 * Extract structured data from job description using OpenAI
 */
export async function extractStructuredJobData(
  jobDescription: string
): Promise<StructuredJobData> {
  const systemPrompt = `
You are an expert HR analyst. Analyze the following job description and extract structured information.
Return your response as a JSON object with the following structure:
{
  "title": "Job title",
  "company": "Company name (if mentioned)",
  "requirements": ["list", "of", "requirements"],
  "extractedKeywords": ["relevant", "technical", "keywords"],
  "parsed": {
    "responsibilities": ["list", "of", "responsibilities"],
    "qualifications": {
      "required": ["required", "qualifications"],
      "preferred": ["preferred", "qualifications"]
    },
    "skills": ["technical", "skills", "mentioned"],
    "experience_required": "X years experience"
  }
}

Extract ALL technical skills, tools, technologies, and relevant keywords.
Be comprehensive but accurate. Only include what's explicitly mentioned or clearly implied.
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Job Description:\n${jobDescription}` },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.choices[0].message.content || '{}');

    return {
      title: parsed.title || 'Unknown Position',
      company: parsed.company || undefined,
      requirements: parsed.requirements || [],
      extractedKeywords: parsed.extractedKeywords || [],
      parsed: {
        responsibilities: parsed.parsed?.responsibilities || [],
        qualifications: parsed.parsed?.qualifications || {
          required: [],
          preferred: [],
        },
        skills: parsed.parsed?.skills || [],
        experience_required: parsed.parsed?.experience_required || '',
      },
    };
  } catch (error) {
    console.error('Error extracting structured job data:', error);
    throw new Error('Failed to extract structured job data');
  }
}

/**
 * Extract structured data from resume text using OpenAI
 */
export async function extractStructuredResumeData(
  resumeText: string
): Promise<StructuredResumeData> {
  const systemPrompt = `
You are an expert resume parser. Analyze the following resume text and extract structured information.
Return your response as a JSON object with the following structure:
{
  "personal_data": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "+33 6 XX XX XX XX",
    "location": "City, Country"
  },
  "experiences": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "start_date": "MM/YYYY",
      "end_date": "MM/YYYY or Present",
      "description": "Job description and achievements"
    }
  ],
  "skills": ["Skill 1", "Skill 2"],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "School Name",
      "year": "YYYY"
    }
  ],
  "extracted_keywords": ["keyword1", "keyword2"]
}

Extract ALL skills, technologies, and relevant keywords from the resume.
Be comprehensive and accurate.
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Resume Text:\n${resumeText}` },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.choices[0].message.content || '{}');

    return {
      personal_data: parsed.personal_data || {
        name: 'Unknown',
        email: undefined,
        phone: undefined,
        location: undefined,
      },
      experiences: parsed.experiences || [],
      skills: parsed.skills || [],
      education: parsed.education || [],
      extracted_keywords: parsed.extracted_keywords || [],
    };
  } catch (error) {
    console.error('Error extracting structured resume data:', error);
    throw new Error('Failed to extract structured resume data');
  }
}
