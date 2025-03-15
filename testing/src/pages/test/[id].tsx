import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db } from "../../firebase/firebase";
import { doc, collection, getDoc, getDocs, updateDoc } from "firebase/firestore";
import "../../styles/global.css"; // Assuming a CSS module for styling

interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
}

interface AthleteTestData {
  [key: string]: number | null;
}

interface TestingSession {
  id: string;
  name: string;
  athletes: string[];
  tests: { [athleteId: string]: AthleteTestData };
  date: string;
}

export default function TestEntryPage() {
  const router = useRouter();
  const { id } = router.query;
  const [session, setSession] = useState<TestingSession | null>(null);
  const [testData, setTestData] = useState<AthleteTestData>({});
  const [selectedAthlete, setSelectedAthlete] = useState<string | null>(null);
  const [athletes, setAthletes] = useState<Athlete[]>([]); // New state for athlete data

  useEffect(() => {
    if (!id) return;

    const fetchSession = async () => {
      try {
        console.log("Fetching test session:", id);
        const sessionRef = doc(db, "test_sessions", id as string);
        const sessionSnap = await getDoc(sessionRef);

        if (sessionSnap.exists()) {
          const sessionData = sessionSnap.data() as TestingSession;
          console.log("✅ Session data found:", sessionData);
          setSession(sessionData);
          
          // Pre-fill test data for the currently selected athlete, if any
          if (selectedAthlete && sessionData.tests[selectedAthlete]) {
            setTestData(sessionData.tests[selectedAthlete]);
          } else if (sessionData.athletes.length > 0) {
            // Default to the first athlete if no athlete is selected
            const firstAthlete = sessionData.athletes[0];
            setSelectedAthlete(firstAthlete);
            setTestData(sessionData.tests[firstAthlete] || {});
          }
        } else {
          console.error("❌ Session not found in Firestore!");
          alert("❌ Error: Test session not found!");
        }
      } catch (error) {
        console.error("❌ Error fetching session:", error);
        alert(`❌ Error fetching session: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    };

    const fetchAthletes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "athletes"));
        const athleteList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Athlete[];
        setAthletes(athleteList);
      } catch (error) {
        console.error("❌ Error fetching athletes:", error);
        alert(`❌ Error fetching athletes: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    };

    fetchSession();
    fetchAthletes();
  }, [id]);

  const handleAthleteSelect = (athleteId: string) => {
    if (!session) return;

    console.log("Selecting athlete:", athleteId);
    setSelectedAthlete(athleteId);
    // Pre-fill test data for the selected athlete
    const athleteTestData = session.tests[athleteId] || {};
    setTestData(athleteTestData);
  };

  const handleTestChange = (testType: string, value: number | null) => {
    setTestData((prevData) => ({
      ...prevData,
      [testType]: value,
    }));
  };

  const saveTestResults = async () => {
    if (!selectedAthlete || !session) {
      alert("Select an athlete and ensure session data is loaded!");
      return;
    }

    try {
      console.log("Saving test data for:", selectedAthlete, testData);
      const sessionRef = doc(db, "test_sessions", id as string);

      // Preserve existing tests and update only the selected athlete's data
      const updatedTests = {
        ...(session.tests || {}),
        [selectedAthlete]: {
          ...(session.tests?.[selectedAthlete] || {}),
          ...testData,
        },
      };

      await updateDoc(sessionRef, { tests: updatedTests });
      alert("✅ Test results saved!");

      // Update local state to reflect the saved data
      setSession((prevSession) =>
        prevSession ? { ...prevSession, tests: updatedTests } : prevSession
      );
      setTestData({}); // Reset test data after saving (optional, depending on UX)
    } catch (error) {
      console.error("❌ Error saving test results:", error);
      alert(`❌ Error saving test results: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // Helper function to get athlete's full name by ID
  const getAthleteName = (athleteId: string) => {
    const athlete = athletes.find((a) => a.id === athleteId);
    return athlete ? `${athlete.firstName} ${athlete.lastName}` : athleteId;
  };

  return (
    <div className="container">
      <h1 className="title">Testing Session: {session?.name}</h1>

      <h2 className="subtitle">Select Athlete</h2>
      {session?.athletes.length ? (
        <ul className="athleteList">
          {session.athletes.map((athleteId) => (
            <li key={athleteId} className="athleteItem">
              <button
                className="athleteButton"
                onClick={() => handleAthleteSelect(athleteId)}
              >
                {getAthleteName(athleteId)} {selectedAthlete === athleteId && "✔"}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="noAthletes">⚠️ No athletes available.</p>
      )}

      {selectedAthlete && (
        <div className="testResults">
          <h2 className="subtitle">Enter Test Results for Athlete {getAthleteName(selectedAthlete)}</h2>

          {/* Anthropometry Group */}
          <fieldset className="fieldset">
            <legend className="groupHeader">Anthropometry</legend>
            <div className="inputGroup">
              <input
                type="number"
                placeholder="Body Height (cm)"
                value={testData.body_height !== null ? testData.body_height : ""}
                onChange={(e) => handleTestChange("body_height", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              <input
                type="number"
                placeholder="Body Mass (kg)"
                value={testData.body_mass !== null ? testData.body_mass : ""}
                onChange={(e) => handleTestChange("body_mass", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              <input
                type="number"
                placeholder="Fat-Free Mass (kg)"
                value={testData.fat_free_mass !== null ? testData.fat_free_mass : ""}
                onChange={(e) => handleTestChange("fat_free_mass", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              <input
                type="number"
                placeholder="Body Fat %"
                value={testData.body_fat_percentage !== null ? testData.body_fat_percentage : ""}
                onChange={(e) => handleTestChange("body_fat_percentage", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              <input
                type="number"
                placeholder="Arm Span (cm)"
                value={testData.arm_span !== null ? testData.arm_span : ""}
                onChange={(e) => handleTestChange("arm_span", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              <input
                type="number"
                placeholder="Left Leg Length (cm)"
                value={testData.leg_length_left !== null ? testData.leg_length_left : ""}
                onChange={(e) => handleTestChange("leg_length_left", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              <input
                type="number"
                placeholder="Right Leg Length (cm)"
                value={testData.leg_length_right !== null ? testData.leg_length_right : ""}
                onChange={(e) => handleTestChange("leg_length_right", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
            </div>
          </fieldset>

          {/* Sit and Reach Group */}
          <fieldset className="fieldset">
            <legend className="groupHeader">Sit and Reach (cm)</legend>
            <div className="inputGroup">
              <input
                type="number"
                placeholder="Try 1"
                value={testData.sit_and_reach_try1 !== null ? testData.sit_and_reach_try1 : ""}
                onChange={(e) => handleTestChange("sit_and_reach_try1", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              <input
                type="number"
                placeholder="Try 2"
                value={testData.sit_and_reach_try2 !== null ? testData.sit_and_reach_try2 : ""}
                onChange={(e) => handleTestChange("sit_and_reach_try2", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
            </div>
          </fieldset>

          {/* Y-Balance Test Group */}
          <fieldset className="fieldset">
            <legend className="groupHeader">Y-Balance Test</legend>
            <div className="inputGroup">
              <input
                type="number"
                placeholder="Front - Left Leg"
                value={testData.y_balance_front_left_leg !== null ? testData.y_balance_front_left_leg : ""}
                onChange={(e) => handleTestChange("y_balance_front_left_leg", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              <input
                type="number"
                placeholder="Right - Left Leg"
                value={testData.y_balance_right_left_leg !== null ? testData.y_balance_right_left_leg : ""}
                onChange={(e) => handleTestChange("y_balance_right_left_leg", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              <input
                type="number"
                placeholder="Left - Left Leg"
                value={testData.y_balance_left_left_leg !== null ? testData.y_balance_left_left_leg : ""}
                onChange={(e) => handleTestChange("y_balance_left_left_leg", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              
               <input
                type="number"
                placeholder="Front - Right Leg"
                value={testData.y_balance_front_right_leg !== null ? testData.y_balance_front_right_leg : ""}
                onChange={(e) => handleTestChange("y_balance_front_right_leg", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              
              <input
                type="number"
                placeholder="Right - Right Leg"
                value={testData.y_balance_right_right_leg !== null ? testData.y_balance_right_right_leg : ""}
                onChange={(e) => handleTestChange("y_balance_right_right_leg", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              
              <input
                type="number"
                placeholder="Left - Right Leg"
                value={testData.y_balance_left_right_leg !== null ? testData.y_balance_left_right_leg : ""}
                onChange={(e) => handleTestChange("y_balance_left_right_leg", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              
            </div>
          </fieldset>

          {/* Jump and Reach Group */}
          <fieldset className="fieldset">
            <legend className="groupHeader">Jump and Reach (cm)</legend>
            <div className="inputGroup">
              <input
                type="number"
                placeholder="Counter Movement"
                value={testData.jump_and_reach_counter_movement !== null ? testData.jump_and_reach_counter_movement : ""}
                onChange={(e) => handleTestChange("jump_and_reach_counter_movement", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              <input
                type="number"
                placeholder="Standing Reach"
                value={testData.jump_and_reach_standing_reach !== null ? testData.jump_and_reach_standing_reach : ""}
                onChange={(e) => handleTestChange("jump_and_reach_standing_reach", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              <input
                type="number"
                placeholder="With Running"
                value={testData.jump_and_reach_running !== null ? testData.jump_and_reach_running : ""}
                onChange={(e) => handleTestChange("jump_and_reach_running", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
            </div>
          </fieldset>

          {/* Counter Movement Group */}
          <fieldset className="fieldset">
            <legend className="groupHeader">Counter Movement (cm)</legend>
            <div className="inputGroup">
              <input
                type="number"
                placeholder="Try 1"
                value={testData.counter_movement_try1 !== null ? testData.counter_movement_try1 : ""}
                onChange={(e) => handleTestChange("counter_movement_try1", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              <input
                type="number"
                placeholder="Try 2"
                value={testData.counter_movement_try2 !== null ? testData.counter_movement_try2 : ""}
                onChange={(e) => handleTestChange("counter_movement_try2", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              <input
                type="number"
                placeholder="Try 3"
                value={testData.counter_movement_try3 !== null ? testData.counter_movement_try3 : ""}
                onChange={(e) => handleTestChange("counter_movement_try3", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
            </div>
          </fieldset>

          {/* Drop Jump Group */}
          <fieldset className="fieldset">
            <legend className="groupHeader">Drop Jump</legend>
            <div className="inputGroup">
              <input
                type="number"
                placeholder="Height - Try 1 (cm)"
                value={testData.drop_jump_height_try1 !== null ? testData.drop_jump_height_try1 : ""}
                onChange={(e) => handleTestChange("drop_jump_height_try1", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              <input
                type="number"
                placeholder="Height - Try 2 (cm)"
                value={testData.drop_jump_height_try2 !== null ? testData.drop_jump_height_try2 : ""}
                onChange={(e) => handleTestChange("drop_jump_height_try2", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              <input
                type="number"
                placeholder="Height - Try 3 (cm)"
                value={testData.drop_jump_height_try3 !== null ? testData.drop_jump_height_try3 : ""}
                onChange={(e) => handleTestChange("drop_jump_height_try3", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              <input
                type="number"
                placeholder="Contact - Try 1 (sec)"
                value={testData.drop_jump_contact_try1 !== null ? testData.drop_jump_contact_try1 : ""}
                onChange={(e) => handleTestChange("drop_jump_contact_try1", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              <input
                type="number"
                placeholder="Contact - Try 2 (sec)"
                value={testData.drop_jump_contact_try2 !== null ? testData.drop_jump_contact_try2 : ""}
                onChange={(e) => handleTestChange("drop_jump_contact_try2", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              <input
                type="number"
                placeholder="Contact - Try 3 (sec)"
                value={testData.drop_jump_contact_try3 !== null ? testData.drop_jump_contact_try3 : ""}
                onChange={(e) => handleTestChange("drop_jump_contact_try3", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
            </div>
          </fieldset>

          {/* Squat Jump Group */}
          <fieldset className="fieldset">
            <legend className="groupHeader">Squat Jump (cm)</legend>
            <div className="inputGroup">
              <input
                type="number"
                placeholder="Try 1"
                value={testData.squat_jump_try1 !== null ? testData.squat_jump_try1 : ""}
                onChange={(e) => handleTestChange("squat_jump_try1", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              <input
                type="number"
                placeholder="Try 2"
                value={testData.squat_jump_try2 !== null ? testData.squat_jump_try2 : ""}
                onChange={(e) => handleTestChange("squat_jump_try2", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              <input
                type="number"
                placeholder="Try 3"
                value={testData.squat_jump_try3 !== null ? testData.squat_jump_try3 : ""}
                onChange={(e) => handleTestChange("squat_jump_try3", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
            </div>
          </fieldset>

          {/* Sprint Group */}
          <fieldset className="fieldset">
            <legend className="groupHeader">Sprint (sec)</legend>
            <div className="inputGroup">
              <input
                type="number"
                placeholder="5m - Try 1"
                value={testData.sprint_5m_try1 !== null ? testData.sprint_5m_try1 : ""}
                onChange={(e) => handleTestChange("sprint_5m_try1", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              <input
                type="number"
                placeholder="5m - Try 2"
                value={testData.sprint_5m_try2 !== null ? testData.sprint_5m_try2 : ""}
                onChange={(e) => handleTestChange("sprint_5m_try2", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              <input
                type="number"
                placeholder="5m - Try 3"
                value={testData.sprint_5m_try3 !== null ? testData.sprint_5m_try3 : ""}
                onChange={(e) => handleTestChange("sprint_5m_try3", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              <input
                type="number"
                placeholder="10m - Try 1"
                value={testData.sprint_10m_try1 !== null ? testData.sprint_10m_try1 : ""}
                onChange={(e) => handleTestChange("sprint_10m_try1", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              <input
                type="number"
                placeholder="10m - Try 2"
                value={testData.sprint_10m_try2 !== null ? testData.sprint_10m_try2 : ""}
                onChange={(e) => handleTestChange("sprint_10m_try2", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              <input
                type="number"
                placeholder="10m - Try 3"
                value={testData.sprint_10m_try3 !== null ? testData.sprint_10m_try3 : ""}
                onChange={(e) => handleTestChange("sprint_10m_try3", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              <input
                type="number"
                placeholder="30m - Try 1"
                value={testData.sprint_30m_try1 !== null ? testData.sprint_30m_try1 : ""}
                onChange={(e) => handleTestChange("sprint_30m_try1", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              <input
                type="number"
                placeholder="30m - Try 2"
                value={testData.sprint_30m_try2 !== null ? testData.sprint_30m_try2 : ""}
                onChange={(e) => handleTestChange("sprint_30m_try2", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              <input
                type="number"
                placeholder="30m - Try 3"
                value={testData.sprint_30m_try3 !== null ? testData.sprint_30m_try3 : ""}
                onChange={(e) => handleTestChange("sprint_30m_try3", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
            </div>
          </fieldset>

          {/* Agility & Stamina Group */}
          <fieldset className="fieldset">
            <legend className="groupHeader">Agility & Stamina</legend>
            <div className="inputGroup">
              <input
                type="number"
                placeholder="Lane Agility (sec)"
                value={testData.lane_agility !== null ? testData.lane_agility : ""}
                onChange={(e) => handleTestChange("lane_agility", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
              <input
                type="number"
                placeholder="YoYo II (meters)"
                value={testData.yoyo_II !== null ? testData.yoyo_II : ""}
                onChange={(e) => handleTestChange("yoyo_II", e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
            </div>
          </fieldset>

          

          <button className="saveButton" onClick={saveTestResults}>
            Save Results
          </button>
        </div>
      )}
    </div>
  );
}