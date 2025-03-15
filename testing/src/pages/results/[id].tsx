import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import PerformanceFeedback from "../../components/PerformanceFeedback";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ResultsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [athlete, setAthlete] = useState<any>(null);
  const [testType] = useState("Sprint"); // Example test type, make this dynamic if needed

  useEffect(() => {
    if (!id) return;
    const fetchAthlete = async () => {
      const athleteRef = doc(db, "athletes", id as string);
      const athleteSnap = await getDoc(athleteRef);
      if (athleteSnap.exists()) {
        setAthlete({ id: athleteSnap.id, ...athleteSnap.data() });
      }
    };

    fetchAthlete();
  }, [id]);

  if (!athlete) return <p>Loading athlete data...</p>;

  return (
    <div>
      <h1>Performance Feedback for {athlete.firstName} {athlete.lastName}</h1>
      <PerformanceFeedback athlete={athlete} testType={testType} />
    </div>
  );
}
