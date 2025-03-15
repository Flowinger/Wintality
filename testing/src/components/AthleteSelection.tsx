import { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  team: string;
}

interface Props {
  onSelectAthlete: (athlete: Athlete) => void;
}

const AthleteSelection: React.FC<Props> = ({ onSelectAthlete }) => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);

  useEffect(() => {
    const fetchAthletes = async () => {
      const querySnapshot = await getDocs(collection(db, "athletes"));
      const athleteList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Athlete[];
      setAthletes(athleteList);
    };

    fetchAthletes();
  }, []);

  return (
    <div>
      <h2>Select Athlete</h2>
      <ul>
        {athletes.map((athlete) => (
          <li key={athlete.id}>
            <button onClick={() => onSelectAthlete(athlete)}>
              {athlete.firstName} {athlete.lastName} - {athlete.team}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AthleteSelection;
