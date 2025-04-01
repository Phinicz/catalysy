export interface UserAchievement {
  "task_id": string,
  "title": string,
  "imageUrl": string,
  "description": string,
  "progress": number,
  "status": "completed" | "ongoing",
}
