import type { Metadata } from "next";
import EngineeringLabView from "../engineering-lab/EngineeringLabView";

export const metadata: Metadata = {
  title: "Engineering Lab | Pavan Kumar",
  description:
    "A selection of projects shaped by curiosity, thoughtful engineering, and a desire to make useful things.",
};

export default function ConnectPage() {
  return <EngineeringLabView />;
}
