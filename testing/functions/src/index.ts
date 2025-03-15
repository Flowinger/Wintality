import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

export const createTestSession = functions.https.onCall(
  async (request) => {
    try {
      console.log("Received raw request:", JSON.stringify(request, null, 2)); // Log the entire request for debugging

      if (!request.data || typeof request.data !== "object") {
        throw new functions.https.HttpsError("invalid-argument", "Request data is missing or not an object.");
      }

      const { sessionName, athleteIds } = request.data.data;

      if (!sessionName || typeof sessionName !== "string" || !sessionName.trim()) {
        console.error("❌ Invalid or missing sessionName:", sessionName);
        throw new functions.https.HttpsError("invalid-argument", "Session name is required and must be a non-empty string.");
      }

      if (!athleteIds || !Array.isArray(athleteIds) || athleteIds.length === 0) {
        console.error("❌ Invalid or missing athleteIds:", athleteIds);
        throw new functions.https.HttpsError("invalid-argument", "Athlete IDs are required and must be a non-empty array.");
      }

      console.log("✅ Creating session with athletes:", athleteIds);


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

      const athletesTests = athleteIds.reduce((acc, athleteId) => {
        acc[athleteId] = { ...testSchema };
        return acc;
      }, {} as Record<string, typeof testSchema>);

      const sessionData = {
        name: sessionName,
        date: new Date().toISOString(),
        athletes: athleteIds, // Array of athlete IDs
        tests: athletesTests, // Nested tests per athlete
      };
      console.log("📝 Session data prepared:", sessionData);

      const sessionRef = await db.collection("test_sessions").add(sessionData);
      console.log("✅ Session successfully created:", sessionRef.id);

      return { sessionId: sessionRef.id };
    } catch (error) {
      console.error("❌ Error creating test session:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new functions.https.HttpsError("internal", "🔥 Internal error: " + errorMessage);
    }
  }
);