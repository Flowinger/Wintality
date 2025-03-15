import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBJBe7ahcXerFeopQVMCViZer2u_fX8ui0",
  authDomain: "athlete-testing.firebaseapp.com",
  projectId: "athlete-testing",
  storageBucket: "athlete-testing.firebasestorage.app",
  messagingSenderId: "689885275284",
  appId: "1:689885275284:web:9c194b00e6cdcf64d70081",
  measurementId: "G-46P8EL1YEG"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const addTestSession = async () => {
  const sessionId = "default_test_session";
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

  // Assume some sample athlete IDs (you’d replace these with real IDs from your athletes collection)
  const sampleAthleteIds = ["W87nePwjOJPizcDQVzXE", "athlete_2_id"]; // Example athlete IDs

  const athletesTests = sampleAthleteIds.reduce((acc, athleteId) => {
    acc[athleteId] = { ...testSchema }; // Each athlete starts with null values
    return acc;
  }, {} as Record<string, typeof testSchema>);

  try {
    await setDoc(doc(db, "test_sessions", sessionId), {
      name: "Preloaded Test Session",
      date: new Date().toISOString(),
      athletes: sampleAthleteIds, // List of athlete IDs
      tests: athletesTests, // Nested tests per athlete
    });

    console.log("✅ Test session structure added with athletes!");
  } catch (error) {
    console.error("❌ Error adding test session:", error);
  }
};

addTestSession();