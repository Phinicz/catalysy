interface Task {
  id: string;
  title: string;
  description: string;
  status: "ongoing" | "completed";
  progress: number;
  imageUrl: string;
}

interface TaskListProps {
  tasks: Task[];
  type: "ongoing" | "completed";
}

export default function TaskList({ tasks, type }: TaskListProps) {
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
            key={task.id}
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
              <div className="flex-shrink-0">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Completed
                </span>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
