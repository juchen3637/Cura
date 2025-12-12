"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/database";
import type { Resume } from "@/types/resume";

type ResumeRow = Database["public"]["Tables"]["resumes"]["Row"];
type ResumeInsert = Database["public"]["Tables"]["resumes"]["Insert"];
type ResumeUpdate = Database["public"]["Tables"]["resumes"]["Update"];

export async function getResumes() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data as ResumeRow[];
}

export async function getResume(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as ResumeRow;
}

export async function createResume(resume: {
  title: string;
  resume_data: Resume;
  job_description?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      title: resume.title,
      resume_data: resume.resume_data as any,
      job_description: resume.job_description || null,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/dashboard");
  return data as ResumeRow;
}

export async function updateResume(id: string, updates: {
  title?: string;
  resume_data?: Resume;
  job_description?: string;
  is_favorite?: boolean;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("resumes")
    .update({
      ...updates,
      resume_data: updates.resume_data as any,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/dashboard");
  revalidatePath(`/resume-editor/${id}`);
  return data as ResumeRow;
}

export async function deleteResume(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("resumes").delete().eq("id", id);

  if (error) throw error;
  revalidatePath("/dashboard");
}

export async function duplicateResume(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Get the original resume
  const { data: original, error: fetchError } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;

  // Create a copy
  const { data, error } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      title: `${original.title} (Copy)`,
      resume_data: original.resume_data,
      job_description: original.job_description,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/dashboard");
  return data as ResumeRow;
}
