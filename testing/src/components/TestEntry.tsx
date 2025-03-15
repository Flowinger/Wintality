import { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
}

interface Props {
  athlete: Athlete;
  testType: string;
}

const TestEntry: React.FC<Props> = ({ athlete, testType }) => {
  const [attempts, setAttempts] = useState<Record<string, number>>({});
  const [bestAttempt, setBestAttempt] = useState<number | null>(null);

  useEffect(() => {
    const fetchTestData = async () => {
      const testRef = doc(db, "tests", `${testType}_${athlete.id}`);
      const testSnap = await getDoc(testRef);

      if (testSnap.exists()) {
        const data = testSnap.data();
        setAttempts(data.attempts || {});
        setBestAttempt(data.bestAttempt || null);
      }
    };

    fetchTestData();
  }, [athlete, testType]);

  const handleAttemptChange = async (attemptNumber: number, value: number) => {
    const testRef = doc(db, "tests", `${testType}_${athlete.id}`);
    const updatedAttempts = { ...attempts, [`attempt${attemptNumber}`]: value };
    
    await updateDoc(testRef, { attempts: updatedAttempts });
    setAttempts(updatedAttempts);
  };

  return (
    <div className="container">
      <h2>Test Entry for {athlete.firstName} {athlete.lastName}</h2>
      <p>Test Type: {testType}</p>

      {[1, 2, 3].map((attempt) => (
        <div key={attempt}>
          <label>Attempt {attempt}:</label>
          <input
            type="number"
            value={attempts[`attempt${attempt}`] || ""}
            onChange={(e) => handleAttemptChange(attempt, Number(e.target.value))}
            style={{ padding: "10px", margin: "5px", fontSize: "16px" }}
          />
        </div>
      ))}

      {bestAttempt && <p>🔥 Best Attempt: {bestAttempt}</p>}
    </div>
  );
};

export default TestEntry;