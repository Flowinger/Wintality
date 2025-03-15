import { useState } from "react";
import { useRouter } from "next/router";
import AthleteSelection from "../components/AthleteSelection";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [selectedAthlete, setSelectedAthlete] = useState(null);

  const handleSelectAthlete = (athlete: any) => {
    setSelectedAthlete(athlete);
    router.push(`/test/${athlete.id}`);
  };

  return (
    <div className="container">
      <Image src="/wintality.png" alt="Wintality Logo" width={150} height={150} />
      <h1>Athletic Testing App</h1>
      <Link href="/testing">
        <button>Testung</button>
      </Link>
    </div>
  );
}