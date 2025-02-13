interface RewardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  points: number;
}

export default function RewardCard({
  title,
  description,
  imageUrl,
  category,
  points,
}: RewardProps) {
  return (
    <div className="bg-surface rounded-lg overflow-hidden">
      <div className="aspect-video relative">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        <span className="absolute top-2 right-2 px-2 py-1 rounded bg-black/50 text-white text-sm">
          {points} Points
        </span>
        <span className="absolute top-2 left-2 px-2 py-1 rounded bg-primary text-white text-xs">
          {category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-text-primary mb-2">{title}</h3>
        <p className="text-sm text-text-secondary mb-4">{description}</p>
        <button className="w-full py-2 px-4 bg-red-500 font-semibold text-white rounded-lg hover:bg-primary-dark transition-colors">
          Claim Reward
        </button>
      </div>
    </div>
  );
}
