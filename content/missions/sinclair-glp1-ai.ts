import type { Mission } from "@/lib/types";

export const sinclairGLP1AI: Mission = {
  id: "sinclair-glp1-ai",
  podcastId: "moonshots",
  branch: "longevity",
  episodeTitle: "David Sinclair: GLP-1 Side Effect No One Talks About, AI in His Lab & Reversing Blindness",
  episodeShortTitle: "GLP-1, AI Drug Design, and Mindset",
  guests: ["David Sinclair", "Peter Diamandis"],
  releasedDate: "2026-04-28",
  episodeNumber: 251,  // estimated by back-counting from verified EP 255 (anthropic-spacex). Real numbering may differ if intermediate episodes weren't covered — override when known.
  duration: "26m",
  difficulty: "Intermediate",
  videoId: "D8ohmtB8MdI",
  summary:
    "Q&A across the longevity stack: GLP-1's hidden blindness signal, AI-driven drug screening at billions-of-molecules scale, the 50/50 genetics vs lifestyle debate, sarcopenia, hormone replacement, and how mindset measurably bends biology.",
  concepts: [
    { id: "glp1-blindness",     label: "GLP-1 NAION signal",      color: "amber" },
    { id: "ai-drug-design",     label: "AI-driven drug screening",color: "cyan"  },
    { id: "cadence-agentic",    label: "Cadence agentic scientist",color: "purple"},
    { id: "genetics-vs-lifestyle", label: "50/50 genetics vs lifestyle", color: "green" },
    { id: "mindset-biology",    label: "Mindset → measurable biology", color: "cyan" },
    { id: "xenohormesis",       label: "Xenohormesis (stressed plants)", color: "purple" },
  ],
  evidence: [
    { speaker: "David Sinclair", tStart: "03:33", quote: "There's an increasing number of people waking up blind because of GLP-1. About 20–30,000 a year in the US. ER100 will be tested in that population." },
    { speaker: "David Sinclair", tStart: "08:09", quote: "We're doing AI-driven drug design — looking at billions, eventually trillions of molecules to see which ones reverse aging. We've done that already." },
    { speaker: "David Sinclair", tStart: "09:35", quote: "A paper just challenged the 10–15% genetic figure — it's closer to 50/50. At a minimum, half of your lifespan is up to you." },
    { speaker: "David Sinclair", tStart: "22:45", quote: "Manipulating nerves in the brain of a mouse sends signals through the gut. You get more immune cells by changing the brain." },
  ],
  questions: [
    { id: "q1", kind: "recall", prompt: "What is the GLP-1 'side effect no one talks about', how often, and what therapy is being tested to reverse it?",
      rubric: ["NAION (non-arteritic ischemic optic neuropathy)", "~20–30k US cases/year", "ER100 OSK eye therapy"], concepts: ["glp1-blindness", "osk-er100"] },
    { id: "q2", kind: "recall", prompt: "Name the agentic scientific AI system Sinclair's lab is collaborating with, and what surprising thing it did.",
      rubric: ["Cadence", "Made an original discovery about looking at biological age in transcriptomic data", "Not just what we taught it — creative"], concepts: ["cadence-agentic", "ai-drug-design"] },
    { id: "q3", kind: "applied", prompt: "Apply xenohormesis to your weekly grocery list. Why eat stressed plants, what to look for, and one favorite?",
      rubric: ["Plant stress polyphenols signal adversity", "Eat the rainbow / colored vegetables", "Bitter olive oil", "Broccolini lightly steamed"], concepts: ["xenohormesis"] },
    { id: "q4", kind: "applied", prompt: "Apply the 50/50 framing. If genetics covers up to ~50%, what's the practical workflow Sinclair recommends?",
      rubric: ["Sequence the genome (exome at minimum)", "Identify actionable variants", "Hit lifestyle on the modifiable 50%", "Therapeutics overcome the rest later"], concepts: ["genetics-vs-lifestyle"] },
    { id: "q5", kind: "synthesis", prompt: "Synthesize the mindset → biology evidence. Why is Sinclair (a self-described data scientist) now studying meditation?",
      rubric: ["Mouse brain-to-gut nerve study", "Optimists live ~15% longer", "Sensory-nerve rejuvenation experiments", "Concedes 'woo-woo' often precedes science"], concepts: ["mindset-biology"] },
    { id: "q6", kind: "pitch", prompt: "Pitch a 90-second product brief: an at-home 'longevity environment' starter kit for the median knowledge worker.",
      rubric: ["HEPA in every room", "Glass / no plastic / no teflon", "Sauna + red light", "Cold/heat cycles vs ambient comfort"], concepts: ["mindset-biology"] },
  ],
  badge: { id: "ai-longevity-tactician", name: "AI Longevity Tactician", iconKey: "dna", rarity: "rare" },
  xp: 130,
};
