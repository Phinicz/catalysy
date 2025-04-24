import { supabase } from "../lib/supabase";

interface CreateNotificationParams {
  userId: string;
  type:
    | "achievement"
    | "welcome"
    | "subscription"
    | "subscription_expiring"
    | "system"
    | "new_achievement";
  title: string;
  message: string;
  data?: any;
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  data = null,
}: CreateNotificationParams) {
  try {
    console.log(
      "[Notification Debug] Starting notification creation with data:",
      {
        userId,
        type,
        title,
        message,
        data,
      }
    );

    // Step 1: Validate inputs
    if (!userId) {
      console.error("[Notification Debug] Missing userId");
      return false;
    }
    if (!type) {
      console.error("[Notification Debug] Missing type");
      return false;
    }
    if (!title) {
      console.error("[Notification Debug] Missing title");
      return false;
    }
    if (!message) {
      console.error("[Notification Debug] Missing message");
      return false;
    }

    // Step 2: Prepare notification data
    const notificationData = {
      user_id: userId,
      type,
      title,
      message,
      data,
      read: false,
      created_at: new Date().toISOString(),
    };

    console.log(
      "[Notification Debug] Prepared notification data:",
      notificationData
    );

    // Step 3: Insert into Supabase
    console.log(
      "[Notification Debug] Attempting to insert into notifications table..."
    );
    const { data: result, error } = await supabase
      .from("notifications")
      .insert([notificationData]) // Explicitly wrap in array
      .select();

    // Step 4: Handle response
    if (error) {
      console.error("[Notification Debug] Supabase error:", {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      return false;
    }

    console.log(
      "[Notification Debug] Notification created successfully:",
      result
    );
    return true;
  } catch (error) {
    console.error(
      "[Notification Debug] Unexpected error in createNotification:",
      error
    );
    return false;
  }
}

// Helper functions for common notifications
export async function createWelcomeNotification(
  userId: string,
  username: string
) {
  console.log("[Notification Debug] Creating welcome notification:", {
    userId,
    username,
  });
  return createNotification({
    userId,
    type: "welcome",
    title: "Welcome to Catalysy!",
    message: `Welcome ${username}! We're excited to have you join our community. Start exploring and earning achievements!`,
  });
}

export async function createAchievementNotification(
  userId: string,
  achievementName: string,
  description: string
) {
  console.log(
    "[Notification Debug] Creating achievement unlock notification:",
    {
      userId,
      achievementName,
    }
  );
  return createNotification({
    userId,
    type: "achievement",
    title: "New Achievement Unlocked!",
    message: `Congratulations! You've earned the "${achievementName}" achievement.`,
    data: { achievementName, description },
  });
}

export async function createSubscriptionNotification(
  userId: string,
  planName: string
) {
  console.log("[Notification Debug] Creating subscription notification:", {
    userId,
    planName,
  });
  return createNotification({
    userId,
    type: "subscription",
    title: "Subscription Activated",
    message: `Your ${planName} subscription has been successfully activated.`,
    data: { planName },
  });
}

export async function createSubscriptionExpiringNotification(
  userId: string,
  planName: string,
  daysLeft: number
) {
  console.log(
    "[Notification Debug] Creating subscription expiring notification:",
    {
      userId,
      planName,
      daysLeft,
    }
  );
  return createNotification({
    userId,
    type: "subscription_expiring",
    title: "Subscription Expiring Soon",
    message: `Your ${planName} subscription will expire in ${daysLeft} days.`,
    data: { planName, daysLeft },
  });
}

// New function for notifying users about new achievements
export async function createNewAchievementNotification(
  userId: string,
  achievementTitle: string,
  points: number,
  gameName: string
) {
  console.log("[Achievement Notification] Creating notification for:", {
    userId,
    achievementTitle,
    points,
    gameName,
  });

  try {
    const success = await createNotification({
      userId,
      type: "new_achievement",
      title: "New Achievement Available!",
      message: `A new achievement "${achievementTitle}" worth ${points} points is now available in ${gameName}! Check it out and start earning points.`,
      data: { achievementTitle, points, gameName },
    });

    if (success) {
      console.log(
        "[Achievement Notification] Successfully created notification"
      );
    } else {
      console.error("[Achievement Notification] Failed to create notification");
    }

    return success;
  } catch (error) {
    console.error(
      "[Achievement Notification] Error creating notification:",
      error
    );
    return false;
  }
}
