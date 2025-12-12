import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createResume,
  updateResume,
  deleteResume,
  duplicateResume,
} from "@/lib/actions/resumes";

export function useResumes() {
  return useQuery({
    queryKey: ["resumes"],
    queryFn: async () => {
      const response = await fetch("/api/resumes");
      if (!response.ok) throw new Error("Failed to fetch resumes");
      return response.json();
    },
  });
}

export function useResume(id: string) {
  return useQuery({
    queryKey: ["resumes", id],
    queryFn: async () => {
      const response = await fetch(`/api/resumes/${id}`);
      if (!response.ok) throw new Error("Failed to fetch resume");
      return response.json();
    },
    enabled: !!id,
  });
}

export function useCreateResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });
}

export function useUpdateResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      updateResume(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["resumes", variables.id] });
    },
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });
}

export function useDuplicateResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: duplicateResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });
}
