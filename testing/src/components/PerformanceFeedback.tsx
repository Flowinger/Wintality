import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
}

interface Props {
  athlete: Athlete;
  testType: string;
}

const PerformanceFeedback: React.FC<Props> = ({ athlete, testType }) => {
  const [testData, setTestData] = useState<{ attempts: Record<string, number>; bestAttempt: number | null } | null>(null);

  useEffect(() => {
    const fetchTestData = async () => {
      const testRef = doc(db, "tests", `${testType}_${athlete.id}`);
      const testSnap = await getDoc(testRef);

      if (testSnap.exists()) {
        setTestData(testSnap.data() as any);
      }
    };

    fetchTestData();
  }, [athlete, testType]);

  if (!testData) return <p>Loading results...</p>;

  return (
    <div className="container">
      <h2>Performance Feedback for {athlete.firstName} {athlete.lastName}</h2>
      <p>Test Type: {testType}</p>
      <h3>🔥 Best Attempt: {testData.bestAttempt}</h3>
      <ul>
        {Object.entries(testData.attempts).map(([attempt, value]) => (
          <li key={attempt}>
            {attempt}: {value} {value === testData.bestAttempt ? "✅ Best" : ""}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PerformanceFeedback;