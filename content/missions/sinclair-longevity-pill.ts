import type { Mission } from "@/lib/types";

export const sinclairLongevityPill: Mission = {
  id: "sinclair-longevity-pill",
  podcastId: "moonshots",
  branch: "longevity",
  episodeTitle: "David Sinclair on the Longevity Pill, Age Reversal Timelines, and Updated Protocols",
  episodeShortTitle: "The Age-Reversal Wright Brothers Moment",
  guests: ["David Sinclair", "Peter Diamandis"],
  releasedDate: "2026-04-27",
  episodeNumber: 250,  // estimated by back-counting from verified EP 255 (anthropic-spacex). Real numbering may differ if intermediate episodes weren't covered — override when known.
  duration: "32m",
  difficulty: "Intermediate",
  videoId: "4IM866W7yGc",
  summary:
    "Days from the first human epigenetic reprogramming trial, Sinclair walks through OSK / ER100 therapy, the cocktail pathway to a cheap longevity pill, and what 'Wright brothers moment' means for human lifespan.",
  concepts: [
    { id: "epigenetic-reprogramming", label: "Epigenetic reprogramming", color: "green" },
    { id: "osk-er100",                label: "OSK / ER100 therapy",      color: "cyan"  },
    { id: "cocktail-pathway",         label: "Small-molecule cocktail",  color: "purple"},
    { id: "no-upper-limit",           label: "No biological upper limit",color: "amber" },
    { id: "fossil-funding-model",     label: "FOSSL direct-funding model", color: "green" },
    { id: "longevity-protocols",      label: "Personal protocols",       color: "cyan"  },
  ],
  evidence: [
    { speaker: "David Sinclair", tStart: "03:01", quote: "He found three of the Yamanaka genes—we call them OSK. They're going into the eye of a patient shortly to see if we can cure blindness." },
    { speaker: "David Sinclair", tStart: "08:48", quote: "Small molecules can potentially be made for a few cents a pill. We're at the stage where AI is screening billions of molecules to see which ones reverse aging." },
    { speaker: "David Sinclair", tStart: "13:38", quote: "I always talk about the Wright brothers — this feels like another Wright brothers moment. Once you can fly, everything changes." },
    { speaker: "David Sinclair", tStart: "20:30", quote: "We're going so fast now. An idea on a Zoom call, Brett Blundy funds the project, started within weeks instead of years." },
  ],
  questions: [
    { id: "q1", kind: "recall", prompt: "What are the OSK genes, and what's the FIRST disease target for ER100 trials?",
      rubric: ["Subset of Yamanaka factors", "OSK = Oct4 / Sox2 / Klf4", "First target: blindness (glaucoma) via eye injection"], concepts: ["osk-er100"] },
    { id: "q2", kind: "recall", prompt: "Beyond the eye, name three tissues where OSK has already shown benefits in animal models.",
      rubric: ["Any three from: brain (memory, Alzheimer's), motor neurons (ALS), liver, kidney, skin, muscle, joints/cartilage, immune"], concepts: ["epigenetic-reprogramming"] },
    { id: "q3", kind: "applied", prompt: "Apply Sinclair's 'Wright brothers' analogy. What's the equivalent of 'can it fly?' for the upcoming trial?",
      rubric: ["Proof age-reversal works in humans, not just mice", "6-week dosing schedule", "Visible improvement in eyesight as binary read-out"], concepts: ["no-upper-limit"] },
    { id: "q4", kind: "applied", prompt: "Why is the small-molecule cocktail strategically important, and what's the cost story?",
      rubric: ["Hundreds-of-thousands → cents per pill at scale", "Replaces AAV gene therapy", "FDA prefers single molecule", "Metformin-like accessibility"], concepts: ["cocktail-pathway"] },
    { id: "q5", kind: "synthesis", prompt: "Synthesize: why does Sinclair argue there's no biological upper limit on lifespan?",
      rubric: ["No physical or biological law mandates aging", "Whales, naked mole rats etc.", "Reboot system can be triggered repeatedly", "Mice get repeat OSK doses"], concepts: ["no-upper-limit"] },
    { id: "q6", kind: "pitch", prompt: "Pitch 'Friends of Sinclair Lab' (FOSSL) to a UHNW philanthropist who funds traditional NIH grants.",
      rubric: ["NIH = 10% hit rate, 1–2yr delay, conservative", "Direct funding = weeks not years", "Personal access + discoveries-first", "70-member community model"], concepts: ["fossil-funding-model"] },
  ],
  badge: { id: "age-reversal-scout", name: "Age-Reversal Scout", iconKey: "dna", rarity: "epic" },
  xp: 140,
};
