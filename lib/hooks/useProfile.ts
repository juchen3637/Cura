import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createExperience,
  updateExperience,
  deleteExperience,
  createEducation,
  updateEducation,
  deleteEducation,
  createProject,
  updateProject,
  deleteProject,
  createSkillCategory,
  updateSkillCategory,
  deleteSkillCategory,
} from "@/lib/actions/profile";

// ============ PROFILE ============

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await fetch("/api/profile");
      if (!response.ok) throw new Error("Failed to fetch profile");
      return response.json();
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: { full_name?: string }) => {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

// ============ EXPERIENCES ============

export function useExperiences() {
  return useQuery({
    queryKey: ["experiences"],
    queryFn: async () => {
      const response = await fetch("/api/profile/experiences");
      if (!response.ok) throw new Error("Failed to fetch experiences");
      return response.json();
    },
  });
}

export function useCreateExperience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiences"] });
    },
  });
}

export function useUpdateExperience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      updateExperience(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiences"] });
    },
  });
}

export function useDeleteExperience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiences"] });
    },
  });
}

// ============ EDUCATION ============

export function useEducation() {
  return useQuery({
    queryKey: ["education"],
    queryFn: async () => {
      const response = await fetch("/api/profile/education");
      if (!response.ok) throw new Error("Failed to fetch education");
      return response.json();
    },
  });
}

export function useCreateEducation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEducation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education"] });
    },
  });
}

export function useUpdateEducation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      updateEducation(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education"] });
    },
  });
}

export function useDeleteEducation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEducation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education"] });
    },
  });
}

// ============ PROJECTS ============

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await fetch("/api/profile/projects");
      if (!response.ok) throw new Error("Failed to fetch projects");
      return response.json();
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      updateProject(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

// ============ SKILL CATEGORIES ============

export function useSkillCategories() {
  return useQuery({
    queryKey: ["skillCategories"],
    queryFn: async () => {
      const response = await fetch("/api/profile/skills");
      if (!response.ok) throw new Error("Failed to fetch skills");
      return response.json();
    },
  });
}

export function useCreateSkillCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSkillCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skillCategories"] });
    },
  });
}

export function useUpdateSkillCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      updateSkillCategory(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skillCategories"] });
    },
  });
}

export function useDeleteSkillCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSkillCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skillCategories"] });
    },
  });
}
