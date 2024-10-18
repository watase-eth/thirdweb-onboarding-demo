"use client";

import { useState } from "react";
import { NavbarComponent } from "@/components/navbar";
import { TraditionalCard } from "@/components/traditionalCard";
import { InAppCard } from "@/components/inAppCard";
import { AccountAbstractionCard } from "@/components/accountAbstractionCard";
import { InAppAACard } from "@/components/inAppAACard";

export default function Home() {
  const [selectedOption, setSelectedOption] = useState("Traditional");

  return (
    <div className="min-h-screen bg-background">
      <NavbarComponent selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
      <main className="container mx-auto mt-8 p-4">
        {selectedOption === "Traditional" && <TraditionalCard />}
        {selectedOption === "In-App" && <InAppCard />}
        {selectedOption === "Account Abstraction" && <AccountAbstractionCard />}
        {selectedOption === "In-App + AA" && <InAppAACard />}
      </main>
    </div>
  );
}
