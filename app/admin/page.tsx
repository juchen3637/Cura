"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/hooks/useProfile";

interface AnalyticsData {
  users: {
    total: number;
    active: number;
    recentSignups: number;
  };
  resumes: {
    total: number;
  };
  aiTasks: {
    total: number;
    completed: number;
    analyze: number;
    build: number;
  };
  profile: {
    experiences: number;
    education: number;
    projects: number;
    skillCategories: number;
  };
  apiUsage: {
    aiAnalyze: number;
    aiBuild: number;
    pdfImport: number;
    totalAI: number;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (!profileLoading && profile?.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    // Fetch analytics data
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/admin/analytics");
        if (!response.ok) {
          if (response.status === 403) {
            router.push("/dashboard");
            return;
          }
          throw new Error("Failed to fetch analytics");
        }
        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    if (profile?.role === "admin") {
      fetchAnalytics();
      // Refresh every 30 seconds
      const interval = setInterval(fetchAnalytics, 30000);
      return () => clearInterval(interval);
    }
  }, [profile, profileLoading, router]);

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-red-200 dark:border-red-800 p-6 max-w-md">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-sm text-red-700 dark:text-red-400">{error || "Unknown error"}</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, subtitle, icon, color }: any) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
      {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-semibold rounded-full">
              ADMIN ONLY
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            System analytics and usage statistics
          </p>
        </div>

        {/* User Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">User Statistics</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <StatCard
              title="Total Users"
              value={analytics.users.total}
              subtitle="All registered accounts"
              color="bg-blue-100 dark:bg-blue-900"
              icon={
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />
            <StatCard
              title="Active Users"
              value={analytics.users.active}
              subtitle="Active in last 30 days"
              color="bg-green-100 dark:bg-green-900"
              icon={
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              title="New This Week"
              value={analytics.users.recentSignups}
              subtitle="Sign-ups last 7 days"
              color="bg-purple-100 dark:bg-purple-900"
              icon={
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              }
            />
          </div>
        </div>

        {/* Content Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Content Statistics</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <StatCard
              title="Total Resumes"
              value={analytics.resumes.total}
              subtitle="Saved across all users"
              color="bg-orange-100 dark:bg-orange-900"
              icon={
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Profile Data</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Experiences</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{analytics.profile.experiences}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Education</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{analytics.profile.education}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Projects</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{analytics.profile.projects}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Skill Categories</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{analytics.profile.skillCategories}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Usage Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">AI Tool Usage</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">AI Tasks</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Total AI Tasks</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{analytics.aiTasks.total}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Completed</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">{analytics.aiTasks.completed}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-blue-700 dark:text-blue-400">Analyze Resume</span>
                    <span className="font-semibold text-blue-700 dark:text-blue-400">{analytics.aiTasks.analyze}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-purple-700 dark:text-purple-400">Build Curated</span>
                    <span className="font-semibold text-purple-700 dark:text-purple-400">{analytics.aiTasks.build}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">API Calls (This Month)</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Total AI Calls</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{analytics.apiUsage.totalAI}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                    Analyze: {analytics.apiUsage.aiAnalyze} | Build: {analytics.apiUsage.aiBuild}
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">PDF Imports</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{analytics.apiUsage.pdfImport}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Usage */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Feature Usage</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Most Used Tools</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Build Curated Resume</span>
                    <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{analytics.aiTasks.build}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Analyze Existing Resume</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{analytics.aiTasks.analyze}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">PDF Imports</span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">{analytics.apiUsage.pdfImport}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Engagement Metrics</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">User Activation Rate</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {analytics.users.total > 0
                          ? Math.round((analytics.users.active / analytics.users.total) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${analytics.users.total > 0 ? (analytics.users.active / analytics.users.total) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">AI Task Success Rate</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {analytics.aiTasks.total > 0
                          ? Math.round((analytics.aiTasks.completed / analytics.aiTasks.total) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${analytics.aiTasks.total > 0 ? (analytics.aiTasks.completed / analytics.aiTasks.total) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Avg Resumes per User</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {analytics.users.total > 0
                          ? (analytics.resumes.total / analytics.users.total).toFixed(1)
                          : "0"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vercel Analytics</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            For detailed page views, visitor locations, and real-time traffic, check your{" "}
            <a
              href="https://vercel.com/analytics"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Vercel Analytics Dashboard
            </a>
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white dark:bg-gray-800 p-3 rounded">
              <p className="text-gray-600 dark:text-gray-400">Page Views</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Available in Vercel</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded">
              <p className="text-gray-600 dark:text-gray-400">Visitor Locations</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Available in Vercel</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded">
              <p className="text-gray-600 dark:text-gray-400">Traffic Sources</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Available in Vercel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
