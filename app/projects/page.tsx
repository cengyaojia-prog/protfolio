import { loadPortfolio } from "@/lib/portfolio-store";
import { Portfolio } from "@/components/portfolio";
import type { Metadata } from "next";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Work & cinema index — Yaojia Zeng" };
export default async function Projects() { return <Portfolio page="projects" {...await loadPortfolio()} />; }
