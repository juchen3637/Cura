import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Curate Your Career Story
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            AI-powered resume tailoring that selects your best experiences for every opportunity
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors font-semibold text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* What is Cura Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 sm:p-12 mb-16 border border-gray-100 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">What is Cura?</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Cura is an intelligent resume platform that helps you create perfectly tailored resumes
            for every job application. Instead of manually editing your resume for each position,
            Cura curates the best experiences from your master profile using AI.
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            Build your complete professional profile once, then let AI intelligently select and
            present the most relevant experiences, skills, and achievements for each specific role
            you&apos;re targeting.
          </p>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">How Cura Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                Build Your Master Profile
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                Add all your work experiences, education, projects, and skills. Import directly from
                your existing resume PDF or build from scratch.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                Paste a Job Description
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                When applying for a job, simply paste the job description. Our AI analyzes the
                requirements and company culture.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                Get a Tailored Resume
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                AI curates your best experiences for that specific role, optimizes your bullet points,
                and generates a perfectly tailored resume.
              </p>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Powerful Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Master Profile */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-8 border border-blue-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Master Profile</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Store unlimited experiences, projects, and skills in one place. Your complete career
                history, ready to be curated for any opportunity.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2 font-bold">✓</span>
                  Unlimited work experiences
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2 font-bold">✓</span>
                  Projects and achievements
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2 font-bold">✓</span>
                  Skills and certifications
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2 font-bold">✓</span>
                  Import from existing resume
                </li>
              </ul>
            </div>

            {/* AI-Powered Curation */}
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-8 border border-purple-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">AI-Powered Curation</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Advanced AI analyzes job descriptions and intelligently selects your most relevant
                experiences and skills for each application.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2 font-bold">✓</span>
                  Automatic experience selection
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2 font-bold">✓</span>
                  Keyword optimization
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2 font-bold">✓</span>
                  ATS-friendly formatting
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2 font-bold">✓</span>
                  Relevance scoring
                </li>
              </ul>
            </div>

            {/* Smart Suggestions */}
            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-8 border border-green-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Smart Suggestions</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Get AI-powered suggestions to improve your bullet points, enhance impact, and better
                align with job requirements.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 font-bold">✓</span>
                  Bullet point improvements
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 font-bold">✓</span>
                  Impact quantification
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 font-bold">✓</span>
                  Action verb optimization
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 font-bold">✓</span>
                  One-click apply suggestions
                </li>
              </ul>
            </div>

            {/* Resume Management */}
            <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-8 border border-orange-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Resume Management</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Save and organize multiple versions of your resume. Keep track of which resume you
                sent to each company.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2 font-bold">✓</span>
                  Unlimited saved resumes
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2 font-bold">✓</span>
                  Version history
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2 font-bold">✓</span>
                  Export to PDF
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2 font-bold">✓</span>
                  Professional templates
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Why Cura */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 sm:p-12 mb-16 text-white">
          <h2 className="text-3xl font-bold mb-6 text-center">Why Choose Cura?</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-xl font-bold mb-3">Save Time</h3>
              <p className="text-blue-100">
                Stop manually editing your resume for every application. Create tailored resumes in
                minutes, not hours.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3">Better Results</h3>
              <p className="text-blue-100">
                AI-optimized resumes that highlight your most relevant experiences increase your
                chances of landing interviews.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3">Stay Organized</h3>
              <p className="text-blue-100">
                Keep all your career information in one place. Never lose track of your accomplishments
                or which resume you sent where.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3">AI-Powered</h3>
              <p className="text-blue-100">
                Leverage cutting-edge AI to craft compelling bullet points and match your experience
                to job requirements.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Curate Your Career Story?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join professionals who are landing more interviews with AI-tailored resumes
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-10 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            Start Building Your Profile
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            No credit card required • Free to start
          </p>
        </div>
      </div>
    </div>
  );
}
