import type { Metadata } from "next";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing - Image Background Remover",
  description:
    "Buy one-time monthly credits for removing image backgrounds online. Start free, then upgrade for more credits."
};

export default function PricingPage() {
  return <PricingClient />;
}
