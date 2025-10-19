"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RewriteModalProps {
  isOpen: boolean;
  originalText: string;
  onClose: () => void;
  onReplace: (newText: string) => void;
}

export default function RewriteModal({
  isOpen,
  originalText,
  onClose,
  onReplace,
}: RewriteModalProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(false);

  const fetchSuggestions = useCallback(async () => {
    if (cooldown) return;

    setLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const response = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: originalText }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Use the error message from the API
        throw new Error(data.error || "Failed to fetch suggestions");
      }

      setSuggestions(data.suggestions || []);

      // Set cooldown
      setCooldown(true);
      setTimeout(() => setCooldown(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [cooldown, originalText]);

  useEffect(() => {
    if (isOpen && originalText) {
      fetchSuggestions();
    }
  }, [isOpen, originalText, fetchSuggestions]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">AI Bullet Rewrite</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
              <p className="text-sm text-gray-600 mb-1 font-semibold">
                Original:
              </p>
              <p className="text-sm">{originalText}</p>
            </div>

            <p className="text-xs text-gray-500 mb-4 italic">
              Only bullet text is sent to Anthropic Claude for rewriting. No
              personal data is stored.
            </p>

            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">
                  Generating suggestions...
                </span>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 mb-4">
                {error}
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Suggestions:
                </h3>
                {suggestions.map((suggestion, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 bg-blue-50 border border-blue-200 rounded"
                  >
                    <p className="text-sm mb-3">{suggestion}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onReplace(suggestion);
                          onClose();
                        }}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Replace
                      </button>
                      <button
                        onClick={() => handleCopy(suggestion)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Keep Original
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

