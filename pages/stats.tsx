import { useState, useEffect } from "react";
import SlidingBanner from "../components/Banner/SlidingBanner";
import TaskList from "../components/Tasks/TaskList";

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
  const [ongoingTasks, setOngoingTasks] = useState(SAMPLE_TASKS.ongoing);
  const [completedTasks, setCompletedTasks] = useState(SAMPLE_TASKS.completed);

  return (
    <div className="p-8">
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
