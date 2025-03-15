import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

interface AthleteTest {
  id: string;
  athleteID: string;
  testType: string;
}

const LiveQueue = () => {
  const [athletes, setAthletes] = useState<AthleteTest[]>([]);

  useEffect(() => {
    const q = query(collection(db, "tests"), where("status", "==", "In Progress"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAthletes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AthleteTest)));
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h2>Live Athlete Queue</h2>
      {athletes.length === 0 ? <p>✅ All tests completed!</p> : (
        <ul>
          {athletes.map((athlete) => (
            <li key={athlete.id}>
              {athlete.athleteID} - {athlete.testType} (Pending)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LiveQueue;
