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
    const { userId, username, email, role } = req.body;

    const { error } = await supabase.from("user_profiles").insert([
      {
        id: userId,
        username,
        email,
        role,
        bio: null,
        profile_picture: null,
        coins: 0,
        gems: 0,
      },
    ]);

    if (error) throw error;

    res.status(200).json({ message: "Profile created successfully" });
  } catch (error: any) {
    console.error("Error creating profile:", error);
    res.status(500).json({ message: error.message });
  }
}
