import type { Mission } from "@/lib/types";

export const daraQA: Mission = {
  id: "dara-qa",
  podcastId: "moonshots",
  branch: "markets",
  episodeTitle: "Uber's Robotaxi Playbook, End of Human Driving & $10B Bet on Robots",
  episodeShortTitle: "The Autonomous Economy Q&A",
  guests: ["Dara Khosrowshahi"],
  releasedDate: "2026-04-02",
  episodeNumber: 244,  // estimated by back-counting from verified EP 255 (anthropic-spacex). Real numbering may differ if intermediate episodes weren't covered — override when known.
  duration: "31m",
  difficulty: "Intermediate",
  videoId: "Mh9yC4j0_rI",
  summary:
    "An audience Q&A unpacking insurance models, the future of human driver's licenses, affordable living-as-a-service, China bridges, and Uber's 'do the right thing—period' culture at $10B free cash flow.",
  concepts: [
    { id: "av-insurance-stack",   label: "Layered AV insurance",     color: "amber" },
    { id: "human-license-future", label: "Human license future",     color: "cyan"  },
    { id: "china-bridges",        label: "BYD / Pony / WeRide bridges", color: "purple" },
    { id: "do-the-right-thing",   label: "'Do the right thing.'",    color: "green" },
    { id: "big-bets-at-scale",    label: "Big bets at scale",        color: "amber" },
    { id: "rhymes-with-us",       label: "Adjacency rhyme test",     color: "purple" },
  ],
  evidence: [
    { speaker: "Dara Khosrowshahi", tStart: "01:13", quote: "80% of people say yes to the autonomous match. And the 80% who say yes love the experience." },
    { speaker: "Dara Khosrowshahi", tStart: "02:30", quote: "In the next 25 years, humans will be demonstrably less safe than autonomous drivers." },
    { speaker: "Dara Khosrowshahi", tStart: "27:00", quote: "Companies tend to get more conservative as they get bigger—the exact opposite should be true. You can take big bets at large scale and you can be fine if they don't work out." },
    { speaker: "Dara Khosrowshahi", tStart: "29:50", quote: "If it rhymes, I'll listen. If it doesn't rhyme, it's better for someone else to do it." },
  ],
  questions: [
    { id: "q1", kind: "recall", prompt: "What share of riders accept the AV match in Austin/Atlanta, and what's their reaction?",
      rubric: ["80% accept", "20% decline", "Acceptors love the experience"], concepts: ["human-license-future"] },
    { id: "q2", kind: "applied", prompt: "Explain Uber's two-layer insurance model for AVs.",
      rubric: ["AV provider covers driver software", "Uber covers everything else", "Pass savings to consumer"], concepts: ["av-insurance-stack"] },
    { id: "q3", kind: "applied", prompt: "How is Uber 'building bridges' to China rather than competing head-on? Name three partners.",
      rubric: ["Exited China; equity in Didi", "Partners: BYD, Pony, WeRide", "Hopefully Baidu"], concepts: ["china-bridges"] },
    { id: "q4", kind: "synthesis", prompt: "Why does Dara argue large companies should take MORE risk as they scale? Tie it to Uber's history.",
      rubric: ["Lost $4B/yr at start vs $10B FCF today", "Same dollar bet is now affordable", "Conservatism is the trap"], concepts: ["big-bets-at-scale"] },
    { id: "q5", kind: "synthesis", prompt: "Apply Dara's 'rhymes with us' test to Uber AI Solutions (data labeling). Does it pass?",
      rubric: ["Not movement—but flexible-work platform", "Uses existing driver supply", "Rhymes via labor liquidity"], concepts: ["rhymes-with-us"] },
    { id: "q6", kind: "pitch", prompt: "Pitch 'do the right thing—period' as an operating principle to a series-A startup CEO.",
      rubric: ["Push responsibility down 3–4 levels", "Removes need for thick policy", "Trades certainty for speed"], concepts: ["do-the-right-thing"] },
  ],
  badge: { id: "autonomous-economy-analyst", name: "Autonomous Economy Analyst", iconKey: "chart", rarity: "rare" },
  xp: 110,
};
