import { UserAchievement } from "@/types/UserAchievement";
import { useRouter } from "next/router";
import { Award } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "ongoing" | "completed";
  progress: number;
  imageUrl: string;
}

interface TaskListProps {
  tasks: UserAchievement[];
  type: "ongoing" | "completed";
}

export default function TaskList({ tasks, type }: TaskListProps) {
  const router = useRouter();

  return (
    <div className="grid gap-4">
      {tasks.length === 0 ? (
        <div className="text-center py-8 bg-surface rounded-lg">
          <p className="text-text-secondary">
            {type === "ongoing"
              ? "No tasks in progress"
              : "No completed tasks yet"}
          </p>
        </div>
      ) : (
        tasks.map((task) => (
          <div
            key={task.task_id}
            className="bg-surface p-4 rounded-lg flex items-center gap-4"
          >
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-background">
              <img
                src={task.imageUrl}
                alt={task.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-text-primary">{task.title}</h3>
              <p className="text-sm text-text-secondary">{task.description}</p>
              {type === "ongoing" && (
                <div className="mt-2 w-full bg-background rounded-full h-2">
                  <div
                    className="bg-gray-500  h-full rounded-full"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              )}
            </div>
            {type === "completed" && (
              <div className="flex-shrink-0 flex flex-col items-end gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Completed
                </span>
                <button
                  onClick={() => router.push("/rewards")}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 flex items-center gap-2 text-sm font-medium"
                >
                  <Award className="w-4 h-4" />
                  Claim Reward
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
