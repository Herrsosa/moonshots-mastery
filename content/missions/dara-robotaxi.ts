import type { Mission } from "@/lib/types";

export const daraRobotaxi: Mission = {
  id: "dara-robotaxi",
  podcastId: "moonshots",
  branch: "robotics",
  episodeTitle: "Uber vs. Tesla, Robotaxi Timelines, and the End of Human Driving",
  episodeShortTitle: "The Robotaxi Race",
  guests: ["Dara Khosrowshahi", "Peter Diamandis", "Salim Ismail"],
  releasedDate: "2026-03-31",
  episodeNumber: 243,  // estimated by back-counting from verified EP 255 (anthropic-spacex). Real numbering may differ if intermediate episodes weren't covered — override when known.
  duration: "33m",
  difficulty: "Intermediate",
  videoId: "fzKVYNBg50E",
  summary:
    "Uber's CEO lays out the hybrid playbook for autonomy: humans and robots on the same network, 20+ AV partners, and Marriott-style asset-light fleet management. The future of moving anything that moves.",
  concepts: [
    { id: "hybrid-autonomy",        label: "Hybrid autonomy",         color: "cyan"  },
    { id: "av-partners",            label: "20+ AV partners",         color: "purple"},
    { id: "asset-light-fleets",     label: "Asset-light fleet model", color: "green" },
    { id: "labor-to-capital-shift", label: "Labor→capital shift",     color: "amber" },
    { id: "evtol-trip-planning",    label: "eVTOL trip planning",     color: "cyan"  },
    { id: "delivery-multimodal",    label: "Multimodal delivery",     color: "purple"},
  ],
  evidence: [
    { speaker: "Dara Khosrowshahi", tStart: "03:55", quote: "There isn't going to be this kind of binary outcome. You'll have fleets that consist of some autonomous vehicles and then many human driven vehicles as well." },
    { speaker: "Dara Khosrowshahi", tStart: "09:25", quote: "Just like Marriott doesn't own any hotels, we think autonomous will move into an asset-light model where Blackstones of the world own large fleets that give a 9% yield." },
    { speaker: "Dara Khosrowshahi", tStart: "15:25", quote: "Within 10 years every new car is going to be autonomous ready. But the average life of a car is over 10 years—the fleet turnover takes time." },
    { speaker: "Dara Khosrowshahi", tStart: "21:50", quote: "Vertiports will have to be designed for multiple vehicles. Push a button, get an Uber to the vertiport, take a Joby to your destination." },
  ],
  questions: [
    { id: "q1", kind: "recall", prompt: "How many autonomous partners does Uber currently have, and name three.",
      rubric: ["20+ partners", "Names from: Waymo, WeRide, Pony.ai, Nvidia, Nuro, Avride, Wabi, Zoox"], concepts: ["av-partners"] },
    { id: "q2", kind: "recall", prompt: "What is Uber's projected timeline to be the world's largest robotaxi facilitator?",
      rubric: ["By 2029", "More AV/robotaxi rides than anyone else", "15 cities by end of year with partners"], concepts: ["hybrid-autonomy"] },
    { id: "q3", kind: "applied", prompt: "Apply the Marriott analogy to robotaxi economics. Who owns what, and what yield does Dara cite?",
      rubric: ["Financial players own fleets", "Uber operates / repairs / cleans", "~9% yield"], concepts: ["asset-light-fleets"] },
    { id: "q4", kind: "applied", prompt: "How does Dara reconcile autonomy with displaced drivers? Give the labor→capital framing.",
      rubric: ["Slow new-driver recruitment", "Existing drivers become fleet managers", "20% natural slough-off absorbs supply"], concepts: ["labor-to-capital-shift"] },
    { id: "q5", kind: "synthesis", prompt: "Synthesize: why are autonomous markets EXPANDING the addressable market in Austin and Atlanta rather than just cannibalizing it?",
      rubric: ["New customer segments enter", "Lower price unlocks demand", "Markets grow faster than national average"], concepts: ["hybrid-autonomy", "labor-to-capital-shift"] },
    { id: "q6", kind: "pitch", prompt: "Pitch the Uber+Joby integrated trip-planning product to an Abu Dhabi tourism board.",
      rubric: ["End-to-end button", "Uber → vertiport → Joby → Uber", "Time-savings story", "Middle East regulatory tailwinds"], concepts: ["evtol-trip-planning"] },
  ],
  badge: { id: "hybrid-autonomy-strategist", name: "Hybrid Autonomy Strategist", iconKey: "robot", rarity: "rare" },
  xp: 120,
};
