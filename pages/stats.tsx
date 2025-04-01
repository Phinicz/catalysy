import { useState, useEffect } from "react";
import SlidingBanner from "../components/Banner/SlidingBanner";
import TaskList from "../components/Tasks/TaskList";
import { supabase } from "@/lib/supabase";
import { Achievement } from "@/types/Achievement";
import { UserAchievement } from "@/types/UserAchievement";

const SAMPLE_TASKS = {
  ongoing: [
    {
      id: "1",
      title: "Win 10 Matches in Nyan Heroes",
      description: "Complete 10 winning matches in ranked mode",
      status: "ongoing" as const,
      progress: 60,
      imageUrl: "/placeholders/achivements/1.jpg",
    },
    {
      id: "2",
      title: "Complete Daily Quest",
      description: "Finish all daily missions in Uldor Test",
      status: "ongoing" as const,
      progress: 30,
      imageUrl: "/placeholders/achivements/2.jpg",
    },
  ],
  completed: [
    {
      id: "3",
      title: "First Victory",
      description: "Win your first match in any game mode",
      status: "completed" as const,
      progress: 100,
      imageUrl: "/placeholders/achivements/3.jpg",
    },
  ],
};

const BANNER_ITEMS = [
  {
    id: "1",
    imageUrl: "/placeholders/achivements/1.jpg",
    title: "Track Your Progress",
    description: "See your gaming achievements and ongoing challenges",
  },
  {
    id: "2",
    imageUrl: "/placeholders/achivements/2.jpg",
    title: "Weekly Challenges",
    description: "New challenges every week with exclusive rewards",
  },
];

export default function StatsPage() {
  const [ongoingTasks, setOngoingTasks] = useState<UserAchievement[]>([]);
  const [completedTasks, setCompletedTasks] = useState<UserAchievement[]>([]);

  useEffect(() => {
    fetchUserTasks();
  }, [])
  
  const fetchUserTasks = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        window.location.href = "/";
        return;
      }
      // get user-tasks from supabase and join them with tasks table
      const { data, error } = await supabase
          .from('user_tasks')
          .select(`
            user_id,
            task_id,
            progress,
            status,
            tasks (
              title,
              description,
              imageUrl
            )
          `)
          .eq('user_id', session.user.id);
      if (error) throw error;
      const userTasks = data.map((task: any) => ({
        progress: task.progress,
        status: task.status,
        title: task.tasks.title,
        imageUrl: task.tasks.imageUrl,
        task_id: task.task_id,
      })) as UserAchievement[];
      console.log(userTasks);
        
      setOngoingTasks(userTasks.filter(task => task.status === 'ongoing'));
      setCompletedTasks(userTasks.filter(task => task.status === 'completed'));
    } catch (error) {
      console.error("Error:", error);
    } finally {
    }
  };

  return (
    <div className="px-8 py-20">
      <SlidingBanner items={BANNER_ITEMS} />

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            Tasks in Progress
          </h2>
          <TaskList tasks={ongoingTasks} type="ongoing" />
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            Completed Tasks
          </h2>
          <TaskList tasks={completedTasks} type="completed" />
        </section>
      </div>
    </div>
  );
}
