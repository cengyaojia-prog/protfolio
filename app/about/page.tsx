import { loadPortfolio } from "@/lib/portfolio-store";
import { Portfolio } from "@/components/portfolio";
import type { Metadata } from "next";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "About me — Yaojia Zeng" };
export default async function About() { return <Portfolio page="about" {...await loadPortfolio()} />; }
