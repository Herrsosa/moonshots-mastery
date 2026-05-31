import type { Mission } from "@/lib/types";

export const schmidtRoboticsEnergy: Mission = {
  id: "schmidt-robotics-energy",
  podcastId: "moonshots",
  branch: "energy",
  episodeTitle: "Eric Schmidt on the Robotics Race, Singularity Timeline, and Energy Shortage",
  episodeShortTitle: "The Robotics & Energy Bottleneck",
  guests: ["Eric Schmidt", "Peter Diamandis", "Dave Blundin"],
  releasedDate: "2026-03-24",
  episodeNumber: 241,  // estimated by back-counting from verified EP 255 (anthropic-spacex). Real numbering may differ if intermediate episodes weren't covered — override when known.
  duration: "1h 12m",
  difficulty: "Advanced",
  videoId: "DpwmmXmzvfo",
  summary:
    "Eric Schmidt breaks down the accelerating robotics race, why energy is the ultimate constraint, and how nations are competing for AI-dominant futures. This mission unpacks the hard limits—and the moonshot solutions.",
  concepts: [
    { id: "ai-reasoning-boom",      label: "AI reasoning boom",     color: "cyan" },
    { id: "robotics-race",          label: "Robotics race",         color: "purple" },
    { id: "china-automation-edge",  label: "China automation edge", color: "green" },
    { id: "energy-bottlenecks",     label: "Energy bottlenecks",    color: "amber" },
    { id: "orbital-data-centers",   label: "Orbital data centers",  color: "cyan" },
    { id: "geopolitical-ai-race",   label: "Geopolitical AI race",  color: "purple" },
  ],
  evidence: [
    { speaker: "Eric Schmidt", tStart: "18:13", quote: "There was an estimated 92 gigawatt shortage of power in America between now and 2030. About 60 nuclear plants, and we're doing essentially zero." },
    { speaker: "Eric Schmidt", tStart: "30:36", quote: "China is capable of vertical integration and building these gigafactories at a scale that we can't for all sorts of reasons. That's got to get addressed." },
    { speaker: "Eric Schmidt", tStart: "20:00", quote: "The ultimate scaling laws are not done yet. I keep asking my friends, when does the asymptote arrive—we've not seen it yet." },
    { speaker: "Eric Schmidt", tStart: "27:58", quote: "The energy argument says space wins by far—the cooling is a big challenge, but it's largely figured out now." },
  ],
  questions: [
    { id: "q1", kind: "recall", prompt: "What is Schmidt's estimated US power shortfall between now and 2030, and how does he benchmark it?",
      rubric: ["~92 gigawatts", "Benchmarked against ~60 nuclear plants", "Current build rate ~zero"],
      concepts: ["energy-bottlenecks"] },
    { id: "q2", kind: "recall", prompt: "Why does Schmidt call China a 'competitor, not enemy', and where does he say they currently lead?",
      rubric: ["Low-end robotic hardware", "EV-style vertical integration", "Brutal manufacturing scale"], concepts: ["china-automation-edge", "robotics-race"] },
    { id: "q3", kind: "applied", prompt: "Apply Jevons paradox to the AI data-center buildout. What does Schmidt expect happens as algorithms get more efficient?",
      rubric: ["More efficient → MORE compute, not less", "Demand expands faster than gains", "No sign of bubble in 6–9 months"], concepts: ["energy-bottlenecks", "ai-reasoning-boom"] },
    { id: "q4", kind: "applied", prompt: "Why is the TPU strategically valuable for inference, and how does Nvidia compare in Schmidt's framing?",
      rubric: ["TPU v2 optimized for inference", "Nvidia controls full server stack — Intel never could", "Both companies positioned well"], concepts: ["ai-reasoning-boom"] },
    { id: "q5", kind: "synthesis", prompt: "Synthesize Schmidt's view: if robotics hardware is becoming a commodity and energy is the bottleneck, what's the single highest-leverage moonshot for the US?",
      rubric: ["Recognize energy as binding constraint", "Vertical integration of US robotics", "Skilled immigration + permitting"], concepts: ["energy-bottlenecks", "robotics-race", "china-automation-edge"] },
    { id: "q6", kind: "pitch", prompt: "Pitch an orbital data-center startup to a generalist investor in 90 seconds. Use Schmidt's framing.",
      rubric: ["Infinite power in orbit", "Cooling is solvable", "Capex story: $50B per gigawatt", "Geopolitical hedge"], concepts: ["orbital-data-centers", "energy-bottlenecks"] },
  ],
  badge: { id: "energy-bottleneck-analyst", name: "Energy Bottleneck Analyst", iconKey: "bolt", rarity: "epic" },
  xp: 150,
};
