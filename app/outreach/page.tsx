"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useResumes } from "@/lib/hooks/useResumes";
import { useToast } from "@/lib/hooks/useToast";

type MessageType = "linkedin" | "email" | "other";

interface RecipientInfo {
  name: string;
  title: string;
  company: string;
  linkedinUrl: string;
  twitterUrl: string;
  githubUrl: string;
  websiteUrl: string;
  additionalNotes: string;
}

export default function OutreachPage() {
  const router = useRouter();
  const { success: showSuccess } = useToast();
  const { data: resumes, isLoading: resumesLoading } = useResumes();

  // Auth state
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [jobDescription, setJobDescription] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("linkedin");
  const [showSocialLinks, setShowSocialLinks] = useState(false);
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo>({
    name: "",
    title: "",
    company: "",
    linkedinUrl: "",
    twitterUrl: "",
    githubUrl: "",
    websiteUrl: "",
    additionalNotes: "",
  });

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Check auth
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login");
      } else {
        setUser(user);
      }
      setLoading(false);
    });
  }, [router]);

  const handleRecipientChange = (field: keyof RecipientInfo, value: string) => {
    setRecipientInfo((prev) => ({ ...prev, [field]: value }));
  };

  const hasRecipientInfo = () => {
    return (
      recipientInfo.name ||
      recipientInfo.linkedinUrl ||
      recipientInfo.twitterUrl ||
      recipientInfo.githubUrl
    );
  };

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      setError("Please enter a job description");
      return;
    }
    if (!selectedResumeId) {
      setError("Please select a resume");
      return;
    }

    setError(null);
    setIsGenerating(true);
    setGeneratedMessage("");
    setEmailSubject("");

    try {
      // Get the selected resume data
      const selectedResume = resumes?.find((r: any) => r.id === selectedResumeId);
      if (!selectedResume) {
        throw new Error("Resume not found");
      }

      let recipientResearch = null;
      let recipientName = recipientInfo.name || null;

      // Step 1: Research the recipient if we have info
      if (hasRecipientInfo()) {
        setIsResearching(true);
        try {
          const searchResponse = await fetch("/api/ai/outreach-search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recipientInfo }),
          });

          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            recipientResearch = searchData.research;
            if (searchData.recipientName) {
              recipientName = searchData.recipientName;
            }
          }
        } catch (searchError) {
          console.warn("Recipient research failed, continuing without:", searchError);
        }
        setIsResearching(false);
      }

      // Step 2: Generate the outreach message
      const generateResponse = await fetch("/api/ai/generate-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          resumeData: selectedResume.resume_data,
          recipientResearch,
          recipientName,
          recipientInfo: {
            name: recipientInfo.name,
            title: recipientInfo.title,
            company: recipientInfo.company,
          },
          additionalNotes: recipientInfo.additionalNotes,
          messageType,
        }),
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.error || "Failed to generate message");
      }

      const generateData = await generateResponse.json();
      setGeneratedMessage(generateData.message);
      if (generateData.subject) {
        setEmailSubject(generateData.subject);
      }

      showSuccess(`Your ${messageType === "linkedin" ? "LinkedIn message" : messageType === "email" ? "email" : "message"} is ready!`);
    } catch (err) {
      console.error("Generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate message");
    } finally {
      setIsGenerating(false);
      setIsResearching(false);
    }
  };

  const handleCopy = async () => {
    const textToCopy = messageType === "email" && emailSubject
      ? `Subject: ${emailSubject}\n\n${generatedMessage}`
      : generatedMessage;

    await navigator.clipboard.writeText(textToCopy);
    showSuccess("Message copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Outreach Message Generator
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create personalized outreach messages using AI-powered research and your resume
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Job Description */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="w-full h-40 px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Resume Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Resume <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a resume...</option>
                {resumesLoading ? (
                  <option disabled>Loading resumes...</option>
                ) : (
                  resumes?.map((resume: any) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.title} (Updated {new Date(resume.updated_at).toLocaleDateString()})
                    </option>
                  ))
                )}
              </select>
              {resumes?.length === 0 && !resumesLoading && (
                <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                  No saved resumes found. Please save a resume first.
                </p>
              )}
            </div>

            {/* Recipient Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Recipient Info (Optional)
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Add details about the person you&apos;re reaching out to for a more personalized message.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={recipientInfo.name}
                      onChange={(e) => handleRecipientChange("name", e.target.value)}
                      placeholder="John Smith"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={recipientInfo.title}
                      onChange={(e) => handleRecipientChange("title", e.target.value)}
                      placeholder="Engineering Manager"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={recipientInfo.company}
                    onChange={(e) => handleRecipientChange("company", e.target.value)}
                    placeholder="Acme Inc"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Social Links Toggle */}
                <button
                  type="button"
                  onClick={() => setShowSocialLinks(!showSocialLinks)}
                  className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <svg
                    className={`w-4 h-4 mr-1 transition-transform ${showSocialLinks ? "rotate-90" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Social Links (for AI research)
                </button>

                {showSocialLinks && (
                  <div className="space-y-3 pl-4 border-l-2 border-blue-200 dark:border-blue-800">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        value={recipientInfo.linkedinUrl}
                        onChange={(e) => handleRecipientChange("linkedinUrl", e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Twitter/X URL
                      </label>
                      <input
                        type="url"
                        value={recipientInfo.twitterUrl}
                        onChange={(e) => handleRecipientChange("twitterUrl", e.target.value)}
                        placeholder="https://twitter.com/..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        GitHub URL
                      </label>
                      <input
                        type="url"
                        value={recipientInfo.githubUrl}
                        onChange={(e) => handleRecipientChange("githubUrl", e.target.value)}
                        placeholder="https://github.com/..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Personal Website
                      </label>
                      <input
                        type="url"
                        value={recipientInfo.websiteUrl}
                        onChange={(e) => handleRecipientChange("websiteUrl", e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Special Instructions
                  </label>
                  <textarea
                    value={recipientInfo.additionalNotes}
                    onChange={(e) => handleRecipientChange("additionalNotes", e.target.value)}
                    placeholder="Describe the tone, style, or specific points to emphasize (optional)..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    If provided, the AI will follow these instructions when generating your message
                  </p>
                </div>
              </div>
            </div>

            {/* Message Type */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Message Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="messageType"
                    value="linkedin"
                    checked={messageType === "linkedin"}
                    onChange={() => setMessageType("linkedin")}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    LinkedIn Message
                  </span>
                  <span className="ml-1 text-xs text-gray-500">(300 char limit)</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="messageType"
                    value="email"
                    checked={messageType === "email"}
                    onChange={() => setMessageType("email")}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Email
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="messageType"
                    value="other"
                    checked={messageType === "other"}
                    onChange={() => setMessageType("other")}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Other / Custom
                  </span>
                  <span className="ml-1 text-xs text-gray-500">(flexible format)</span>
                </label>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !jobDescription.trim() || !selectedResumeId}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-medium rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isResearching ? "Researching recipient..." : "Generating message..."}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Outreach Message
                </>
              )}
            </button>

            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Generated Message
                </h2>
                {generatedMessage && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Regenerate
                    </button>
                  </div>
                )}
              </div>

              {generatedMessage ? (
                <div className="space-y-4">
                  {/* Email Subject */}
                  {messageType === "email" && emailSubject && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Subject</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{emailSubject}</p>
                    </div>
                  )}

                  {/* Other/Custom Message Type Label */}
                  {messageType === "other" && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Custom message format
                    </p>
                  )}

                  {/* Message Body */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                      {generatedMessage}
                    </p>
                  </div>

                  {/* Character Count */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      {generatedMessage.length} characters
                      {messageType === "linkedin" && (
                        <span className={generatedMessage.length > 300 ? "text-red-500 ml-1" : "text-green-500 ml-1"}>
                          ({generatedMessage.length > 300 ? `${generatedMessage.length - 300} over limit` : `${300 - generatedMessage.length} remaining`})
                        </span>
                      )}
                    </span>
                    <span>{generatedMessage.split(/\s+/).length} words</span>
                  </div>

                  {/* Warning for LinkedIn */}
                  {messageType === "linkedin" && generatedMessage.length > 300 && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                      <p className="text-xs text-amber-800 dark:text-amber-300">
                        This message exceeds LinkedIn&apos;s 300 character limit for connection requests. Consider shortening it or try regenerating.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Fill in the form and click &quot;Generate&quot; to create your outreach message
                  </p>
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Tips for Effective Outreach
              </h3>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Add recipient info for personalized messages</li>
                <li>• LinkedIn URLs help AI research their background</li>
                <li>• Review and tweak the message before sending</li>
                <li>• Keep LinkedIn messages under 300 characters</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
