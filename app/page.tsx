import { loadPortfolio } from "@/lib/portfolio-store";
import { Portfolio } from "@/components/portfolio";
export const dynamic = "force-dynamic";
export default async function Home() { return <Portfolio page="work" {...await loadPortfolio()} />; }
