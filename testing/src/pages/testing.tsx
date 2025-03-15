import { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useRouter } from "next/router";

interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
}
interface TestSession {
  id: string;
  name: string;
  athletes: string[];
  tests: { [athleteId: string]: { [key: string]: number | null } };
  date: string;
}

export default function TestingPage() {
  const [sessionName, setSessionName] = useState("");
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(true); // Toggle between creating and managing sessions
  const router = useRouter();
  const functions = getFunctions();
  const createTestSession = httpsCallable(functions, "createTestSession");
  
  useEffect(() => {
    const fetchAthletes = async () => {
      const querySnapshot = await getDocs(collection(db, "athletes"));
      const athleteList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Athlete[];
      setAthletes(athleteList);
    };

    const fetchSessions = async () => {
      const querySnapshot = await getDocs(collection(db, "test_sessions"));
      const sessionList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TestSession[];
      setSessions(sessionList);
    };

    fetchAthletes();
    fetchSessions();
  }, []);

  const handleCreateSession = async () => {
    if (!sessionName || selectedAthletes.length === 0) {
      alert("Please enter a session name and select at least one athlete.");
      return;
    }

    try {
      console.log("📡 Creating session:", { 
        sessionName: sessionName.trim(), 
        athleteIds: selectedAthletes 
      });

      const result = await createTestSession({
        data: { sessionName: sessionName.trim(),
        athleteIds: selectedAthletes}
      });

      console.log("✅ Testing session created:", result);
      alert("✅ Testing session created successfully!");

      // ✅ Ensure session ID exists before redirecting
      const sessionId = (result as any).data?.sessionId;
      if (!sessionId) {
        throw new Error("No sessionId returned from Firebase.");
      }

      router.push(`/test/${sessionId}`);
    } catch (error) {
      console.error("❌ Error creating session:", error);
      alert(`❌ Failed to create session: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleAddAthletesToSession = async () => {
    if (!selectedSession || selectedAthletes.length === 0) {
      alert("Please select a session and at least one athlete to add.");
      return;
    }

    try {
      const sessionRef = doc(db, "test_sessions", selectedSession);
      const sessionSnap = await getDoc(sessionRef);
      
      if (!sessionSnap.exists()) {
        alert("❌ Selected session not found!");
        return;
      }

      const currentSession = sessionSnap.data() as TestSession;
      const newAthleteIds = [...new Set([...currentSession.athletes, ...selectedAthletes])]; // Avoid duplicates

      // Define the test schema for new athletes
      const testSchema = {
        body_height: null,
        body_mass: null,
        fat_free_mass: null,
        body_fat_percentage: null,
        arm_span: null,
        leg_length_left: null,
        leg_length_right: null,
        sit_and_reach_try1: null,
        sit_and_reach_try2: null,
        jump_and_reach_counter_movement: null,
        jump_and_reach_standing_reach: null,
        jump_and_reach_running: null,
        counter_movement_try1: null,
        counter_movement_try2: null,
        counter_movement_try3: null,
        drop_jump_height_try1: null,
        drop_jump_height_try2: null,
        drop_jump_height_try3: null,
        drop_jump_contact_try1: null,
        drop_jump_contact_try2: null,
        drop_jump_contact_try3: null,
        squat_jump_try1: null,
        squat_jump_try2: null,
        squat_jump_try3: null,
        sprint_5m_try1: null,
        sprint_5m_try2: null,
        sprint_5m_try3: null,
        sprint_10m_try1: null,
        sprint_10m_try2: null,
        sprint_10m_try3: null,
        sprint_30m_try1: null,
        sprint_30m_try2: null,
        sprint_30m_try3: null,
        lane_agility: null,
        yoyo_II: null,
        y_balance_front_right_leg: null,
        y_balance_front_left_leg: null,
        y_balance_right_right_leg: null,
        y_balance_right_left_leg: null,
        y_balance_left_right_leg: null,
        y_balance_left_left_leg: null,
      };

      // Initialize tests for new athletes (those not already in the session)
      const updatedTests = { ...currentSession.tests };
      selectedAthletes.forEach((athleteId) => {
        if (!currentSession.athletes.includes(athleteId)) {
          updatedTests[athleteId] = { ...testSchema };
        }
      });

      await updateDoc(sessionRef, {
        athletes: newAthleteIds,
        tests: updatedTests,
      });

      alert("✅ Athletes added to the session successfully!");
      setSelectedAthletes([]); // Reset selected athletes
      setSelectedSession(null); // Reset selected session
    } catch (error) {
      console.error("❌ Error adding athletes to session:", error);
      alert(`❌ Failed to add athletes: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleEditSession = (sessionId: string) => {
    router.push(`/test/${sessionId}`);
  };

  return (
    <div className="container">
      <h1 className="title">Manage Testing Sessions</h1>

      {/* Toggle buttons aligned horizontally and centered */}
      <div className="buttonGroup">
        <button className="toggleButton" onClick={() => setIsCreating(true)}>
          Create New Session
        </button>
        <button className="toggleButton" onClick={() => setIsCreating(false)}>
          Manage Existing Sessions
        </button>
      </div>

      {isCreating ? (
        <>
          <h2 className="subtitle">Create Testing Session</h2>
          <input
            type="text"
            placeholder="Session Name"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            className="input"
          />

          <h2 className="subtitle">Select Athletes</h2>
          <ul className="athleteList">
            {athletes.map((athlete) => (
              <li key={athlete.id} className="athleteItem">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedAthletes.includes(athlete.id)}
                    onChange={(e) => {
                      setSelectedAthletes((prev) =>
                        e.target.checked
                          ? [...prev, athlete.id]
                          : prev.filter((id) => id !== athlete.id)
                      );
                    }}
                    className="checkbox"
                  />
                  {athlete.firstName} {athlete.lastName}
                </label>
              </li>
            ))}
          </ul>

          <button className="actionButton" onClick={handleCreateSession}>
            Start Testing Session
          </button>
        </>
      ) : (
        <>
          <h2 className="subtitle">Manage Existing Sessions</h2>
          <ul className="sessionList">
            {sessions.map((session) => (
              <li key={session.id} className="sessionItem">
                {session.name} (Date: {new Date(session.date).toLocaleDateString()})
                <button className="actionButton" onClick={() => handleEditSession(session.id)}>
                  Edit Session
                </button>
              </li>
            ))}
          </ul>

          <select
            value={selectedSession || ""}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="select"
          >
            <option value="">Select a Session</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.name} (Date: {new Date(session.date).toLocaleDateString()})
              </option>
            ))}
          </select>

          <h2 className="subtitle">Select Athletes to Add</h2>
          <ul className="athleteList">
            {athletes.map((athlete) => (
              <li key={athlete.id} className="athleteItem">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedAthletes.includes(athlete.id)}
                    onChange={(e) => {
                      setSelectedAthletes((prev) =>
                        e.target.checked
                          ? [...prev, athlete.id]
                          : prev.filter((id) => id !== athlete.id)
                      );
                    }}
                    className="checkbox"
                  />
                  {athlete.firstName} {athlete.lastName}
                </label>
              </li>
            ))}
          </ul>

          <button className="actionButton" onClick={handleAddAthletesToSession} disabled={!selectedSession}>
            Add Athletes to Selected Session
          </button>
        </>
      )}
    </div>
  );
}
