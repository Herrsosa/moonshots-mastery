import type { Mission } from "@/lib/types";

export const benLammColossal: Mission = {
  id: "ben-lamm-colossal",
  podcastId: "moonshots",
  branch: "biotech",
  episodeTitle: "AI + Synthetic Biology: The Most Transformative Technology in Human History",
  episodeShortTitle: "The Living-Products Engine",
  guests: ["Ben Lamm", "Peter Diamandis"],
  releasedDate: "2026-04-07",
  episodeNumber: 245,  // estimated by back-counting from verified EP 255 (anthropic-spacex). Real numbering may differ if intermediate episodes weren't covered — override when known.
  duration: "35m",
  difficulty: "Advanced",
  videoId: "Goa6c6Qz__I",
  summary:
    "Colossal isn't a de-extinction company—it's an AI-powered platform for designing living products. From dire wolves and woolly mice to plastic-eating microbes, gene drives for invasive species, and reinvented IVF, Ben Lamm explains the pipeline.",
  concepts: [
    { id: "living-products-platform", label: "Living-products platform", color: "green" },
    { id: "de-extinction",            label: "De-extinction pipeline",   color: "cyan"  },
    { id: "breaking-plastics",        label: "Microbe plastic break-down", color: "purple" },
    { id: "gene-drives",              label: "Gene drives for invasives", color: "amber" },
    { id: "artificial-wombs",         label: "Artificial wombs",         color: "cyan"  },
    { id: "bio-vaults",               label: "National bio-vaults",      color: "green" },
  ],
  evidence: [
    { speaker: "Ben Lamm", tStart: "04:42", quote: "The same system that can bring you a mammoth can also make microbes that can break the chemical bonds of plastic." },
    { speaker: "Ben Lamm", tStart: "10:09", quote: "12.5% of global consumers buy something that's extinct every year — about $1.7 trillion." },
    { speaker: "Ben Lamm", tStart: "23:39", quote: "The invasive species problem is global — about $5.4 trillion as currently measured. I think it's much larger than that." },
    { speaker: "Ben Lamm", tStart: "33:00", quote: "Two years ago we were doing victory laps with a couple edits. Now we're doing hundreds of edits at 90% efficiency, all over the genome." },
  ],
  questions: [
    { id: "q1", kind: "recall", prompt: "What four species has Colossal publicly announced bringing back, and which one already produced living animals?",
      rubric: ["Woolly mammoth, Tasmanian tiger, dodo, moa", "Dire wolves (Romulus, Remus, Khaleesi) are alive", "73,000-year-old skull to puppies in 18 months"], concepts: ["de-extinction"] },
    { id: "q2", kind: "recall", prompt: "What's the Breaking enzyme system actually doing that's different from other plastic companies?",
      rubric: ["Concert of microbes, not single enzyme", "Breaks chemical bonds (not micronizing)", "Directed evolution + editing for plastic-type breadth"], concepts: ["breaking-plastics"] },
    { id: "q3", kind: "applied", prompt: "Walk through how a gene drive would humanely deal with the Texas screwworm outbreak.",
      rubric: ["Engineer modified screwworms", "Next gen all-male", "Population collapses without poison", "Bio-control + roll-back capability"], concepts: ["gene-drives"] },
    { id: "q4", kind: "applied", prompt: "Why are artificial wombs strategically valuable beyond curiosity? Tie it to the northern white rhino.",
      rubric: ["Only 2 females left", "$25M/yr keeping them alive", "Productionize via synthetic diversity + ex-utero", "Re-route capital to other priorities"], concepts: ["artificial-wombs"] },
    { id: "q5", kind: "synthesis", prompt: "Synthesize: why does Ben argue Colossal is undervalued at $10B? Use the 'platform of platforms' framing.",
      rubric: ["AI + synbio = largest tech category", "Spinouts: Breaking, cloning, IVF, gene drives", "Hundreds-of-billions adjacent markets"], concepts: ["living-products-platform"] },
    { id: "q6", kind: "pitch", prompt: "Pitch the UAE-style 'national bio-vault' product to a sovereign wealth fund minister.",
      rubric: ["High-traffic education center, not secret cave", "National-pride + biodiversity narrative", "9-figure capex, sovereign-scale", "Builds in-country capability"], concepts: ["bio-vaults"] },
  ],
  badge: { id: "synbio-platform-architect", name: "SynBio Platform Architect", iconKey: "leaf", rarity: "epic" },
  xp: 160,
};
