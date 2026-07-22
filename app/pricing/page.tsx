import type { Metadata } from "next";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing - Image Background Remover",
  description:
    "Buy one-time credit packs for removing image backgrounds online. Start free, then buy paid credits valid for 90 days."
};

export default function PricingPage() {
  return <PricingClient />;
}
