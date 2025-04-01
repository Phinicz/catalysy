import { apiService } from "@/services/api.service";
import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Use service key for admin privileges
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { userId, taskId, progress } = req.body;
    const apiKey = req.headers["x-api-key"] as string;
    const { data } = await supabase.from("api_keys").select("*").eq(
      "api_key",
      apiKey
    );

    if (!data?.find((item) => item.api_key === apiKey)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { data: task } = await supabase.from("tasks").select("*").eq("id", taskId).single();
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (progress < 0 || progress > task.steps) {
      return res.status(400).json({ message: "Invalid progress value" });
    }

    // Check if the user has already started the task
    const { data: userTask } = await supabase
      .from("user_tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("task_id", taskId)
      .single();
    if (userTask) {
      if (userTask.status !== "ongoing") {
        return res.status(400).json({ message: "Task already completed" });
      }
    } else {
      // insert new task
      const { error } = await supabase.from("user_tasks").insert({
        user_id: userId,
        task_id: taskId,
        status: "ongoing",
        created_at: new Date().toISOString(),
        progress: 0
      });
      if (error) throw error;
    }
    if (progress >= task.steps) {
      const { error } = await supabase.from("user_tasks").update({
        status: "completed",
        progress
      }).eq("user_id", userId).eq("task_id", taskId);
      if (error) throw error;
      const { data: userData, error: errorUserData } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (errorUserData) throw error;

      // call to snag api service and complete external rule
      const completeRuleResponse = await apiService.completeLoyaltyRule(
        task.rule_id,
        userData.wallet_address
      );

      return res.status(200).json({ message: "Task completed successfully" });
    } else {
      const { error } = await supabase.from("user_tasks").update({
        progress
      }).eq("user_id", userId).eq("task_id", taskId);
      if (error) throw error;
    }
    res.status(200).json({ message: "task updated successfully" });
  } catch (error: any) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: error.message });
  }
}
