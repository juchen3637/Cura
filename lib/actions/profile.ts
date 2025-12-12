"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/database";

type Experience = Database["public"]["Tables"]["experiences"]["Row"];
type ExperienceInsert = Database["public"]["Tables"]["experiences"]["Insert"];
type ExperienceUpdate = Database["public"]["Tables"]["experiences"]["Update"];

type Education = Database["public"]["Tables"]["education"]["Row"];
type EducationInsert = Database["public"]["Tables"]["education"]["Insert"];
type EducationUpdate = Database["public"]["Tables"]["education"]["Update"];

type Project = Database["public"]["Tables"]["projects"]["Row"];
type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

type SkillCategory = Database["public"]["Tables"]["skill_categories"]["Row"];
type SkillCategoryInsert = Database["public"]["Tables"]["skill_categories"]["Insert"];
type SkillCategoryUpdate = Database["public"]["Tables"]["skill_categories"]["Update"];

// ============ PROFILE ============

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(updates: { full_name?: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/profile");
  return data;
}

// ============ EXPERIENCES ============

export async function getExperiences() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("experiences")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_archived", false)
    .order("start_date", { ascending: false });

  if (error) throw error;
  return data as Experience[];
}

export async function createExperience(experience: Omit<ExperienceInsert, "user_id">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("experiences")
    .insert({ ...experience, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/profile/experiences");
  return data as Experience;
}

export async function updateExperience(id: string, updates: ExperienceUpdate) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("experiences")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/profile/experiences");
  return data as Experience;
}

export async function deleteExperience(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("experiences").delete().eq("id", id);

  if (error) throw error;
  revalidatePath("/profile/experiences");
}

// ============ EDUCATION ============

export async function getEducation() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("education")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_archived", false)
    .order("end_date", { ascending: false });

  if (error) throw error;
  return data as Education[];
}

export async function createEducation(education: Omit<EducationInsert, "user_id">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("education")
    .insert({ ...education, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/profile/education");
  return data as Education;
}

export async function updateEducation(id: string, updates: EducationUpdate) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("education")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/profile/education");
  return data as Education;
}

export async function deleteEducation(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("education").delete().eq("id", id);

  if (error) throw error;
  revalidatePath("/profile/education");
}

// ============ PROJECTS ============

export async function getProjects() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Project[];
}

export async function createProject(project: Omit<ProjectInsert, "user_id">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({ ...project, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/profile/projects");
  return data as Project;
}

export async function updateProject(id: string, updates: ProjectUpdate) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/profile/projects");
  return data as Project;
}

export async function deleteProject(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) throw error;
  revalidatePath("/profile/projects");
}

// ============ SKILL CATEGORIES ============

export async function getSkillCategories() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("skill_categories")
    .select("*")
    .eq("user_id", user.id)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data as SkillCategory[];
}

export async function createSkillCategory(
  skillCategory: Omit<SkillCategoryInsert, "user_id">
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("skill_categories")
    .insert({ ...skillCategory, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/profile/skills");
  return data as SkillCategory;
}

export async function updateSkillCategory(
  id: string,
  updates: SkillCategoryUpdate
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("skill_categories")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/profile/skills");
  return data as SkillCategory;
}

export async function deleteSkillCategory(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("skill_categories").delete().eq("id", id);

  if (error) throw error;
  revalidatePath("/profile/skills");
}
