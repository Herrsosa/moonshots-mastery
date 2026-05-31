import { Brain, Bot, Dna, Zap, Rocket, Leaf, BarChart3, User } from "lucide-react";

const MAP = {
  brain: Brain, robot: Bot, dna: Dna, bolt: Zap,
  rocket: Rocket, leaf: Leaf, chart: BarChart3, user: User,
} as const;

export function BranchIcon({
  iconKey,
  size = 28,
  className,
  color = "currentColor",
}: { iconKey: keyof typeof MAP; size?: number; className?: string; color?: string }) {
  const Icon = MAP[iconKey];
  return <Icon size={size} className={className} color={color} strokeWidth={2} />;
}
