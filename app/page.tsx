import { ContactCTA } from "@/components/ContactCTA";
import { Examples } from "@/components/Examples";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { PriceEstimator } from "@/components/PriceEstimator";
import { Pricing } from "@/components/Pricing";
import { ProblemSolution } from "@/components/ProblemSolution";
import { Process } from "@/components/Process";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <ProblemSolution />
      <Pricing />
      <PriceEstimator />
      <Examples />
      <Process />
      <FAQ />
      <ContactCTA />
      <Footer />
    </main>
  );
}
