import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react"; // Added useRef for chart references
import { db } from "../firebase/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { Chart } from "chart.js/auto"; // Ensure Chart.js is installed: npm install chart.js
import styles from "./DashboardPage.module.css"; // Optional: Use a CSS module for styling

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

export default function DashboardPage() {
  const router = useRouter();
  const { id } = router.query; // Assumes you pass the session ID as a query parameter (e.g., /dashboard?id=sessionId)
  const [session, setSession] = useState<TestingSession | null>(null);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [topAthletes, setTopAthletes] = useState<Record<string, { name: string; value: number }[]>>({});
  const [averageData, setAverageData] = useState<Record<string, number>>({});
  const chartRefs = useRef<Record<string, Chart | null>>({}); // Use useRef to store chart instances

  useEffect(() => {
    if (!id) return;

    const fetchSession = async () => {
      try {
        console.log("Fetching session with ID:", id);
        const sessionRef = doc(db, "test_sessions", id as string);
        const sessionSnap = await getDoc(sessionRef);

        if (sessionSnap.exists()) {
          const sessionData = sessionSnap.data() as TestingSession;
          console.log("✅ Session data fetched:", sessionData);
          setSession(sessionData);

          // Fetch athletes to map IDs to names
          const querySnapshot = await getDocs(collection(db, "athletes"));
          const athleteList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Athlete[];
          console.log("✅ Athletes fetched:", athleteList);
          setAthletes(athleteList);

          // Process and combine tries for each test
          const combinedTestData: Record<string, { [athleteId: string]: number[] }> = {};
          const testPattern = /(\w+)_try\d+/; // Matches test names like "sprint_5m_try1"

          // Group tries by base test name (e.g., "sprint_5m")
          Object.entries(sessionData.tests).forEach(([athleteId, testValues]) => {
            Object.entries(testValues).forEach(([testKey, value]) => {
              if (value !== null) {
                const match = testKey.match(testPattern);
                if (match) {
                  const baseTest = match[1]; // Extract "sprint_5m" from "sprint_5m_try1"
                  if (!combinedTestData[baseTest]) {
                    combinedTestData[baseTest] = {};
                  }
                  combinedTestData[baseTest][athleteId] = [
                    ...(combinedTestData[baseTest][athleteId] || []),
                    value,
                  ];
                }
              }
            });
          });

          console.log("✅ Combined test data:", combinedTestData);

          // Calculate averages for each base test and top 5
          const topData: Record<string, { name: string; value: number }[]> = {};
          const avgData: Record<string, number> = {};

          Object.keys(combinedTestData).forEach((baseTest) => {
            const testValues: { [athleteId: string]: number } = {};
            let allValues: number[] = [];

            sessionData.athletes.forEach((athleteId) => {
              const tries = combinedTestData[baseTest][athleteId] || [];
              if (tries.length > 0) {
                const validTries = tries.filter((v) => v !== null) as number[];
                if (validTries.length > 0) {
                  const avg = validTries.reduce((sum, val) => sum + val, 0) / validTries.length;
                  testValues[athleteId] = avg;
                  allValues = [...allValues, avg];
                }
              }
            });

            // Calculate average across all athletes for this test
            if (allValues.length > 0) {
              avgData[baseTest] = allValues.reduce((sum, val) => sum + val, 0) / allValues.length;
            }

            // Sort to find top 5 (lower for time-based, higher for performance-based)
            const isTimeBased = baseTest.includes("sprint") || baseTest.includes("contact") || baseTest.includes("agility");
            const sortedValues = Object.entries(testValues)
              .map(([athleteId, value]) => {
                const athlete = athleteList.find((a) => a.id === athleteId);
                return { name: athlete ? `${athlete.firstName} ${athlete.lastName}` : athleteId, value };
              })
              .filter(Boolean) as { name: string; value: number }[];

            sortedValues.sort((a, b) => (isTimeBased ? a.value - b.value : b.value - a.value));
            topData[baseTest] = sortedValues.slice(0, 5);
          });

          console.log("✅ Top athletes:", topData);
          console.log("✅ Average data:", avgData);

          setTopAthletes(topData);
          setAverageData(avgData);
        } else {
          console.error("❌ Session not found in Firestore!");
          alert("❌ Error: Test session not found!");
        }
      } catch (error) {
        console.error("❌ Error fetching session:", error);
        alert(`❌ Error fetching session: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    };

    fetchSession();
  }, [id]);

  useEffect(() => {
    // Clean up previous charts to prevent memory leaks
    Object.values(chartRefs.current).forEach((chart) => chart?.destroy());

    // Render bar charts for averages of all players for each test
    Object.entries(averageData).forEach(([test, avg]) => {
      const ctx = document.getElementById(`avgChart-${test}`) as HTMLCanvasElement;
      if (ctx) {
        chartRefs.current[`avgChart-${test}`] = new Chart(ctx, {
          type: "bar",
          data: {
            labels: [test.replace(/_/g, " ")], // Label for the test
            datasets: [
              {
                label: "Average",
                data: [avg],
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: test.includes("sprint") || test.includes("contact") || test.includes("agility") ? "Time (sec)" : "Distance/Height (cm)",
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
              title: {
                display: true,
                text: `Average - ${test.replace(/_/g, " ")}`,
                color: "#fff",
              },
            },
            maintainAspectRatio: false, // Allow chart to resize
          },
        });
      } else {
        console.error(`Canvas element not found for test: ${test}`);
      }
    });

    // Cleanup function to destroy charts on unmount or re-render
    return () => {
      Object.values(chartRefs.current).forEach((chart) => chart?.destroy());
    };
  }, [averageData]);

  if (!session) return <div>Loading...</div>;

  return (
    <div className="container">
      <h1 className="title">Dashboard for Session: {session.name}</h1>

      <h2 className="subtitle">Top 5 Athletes by Test</h2>
      {Object.entries(topAthletes).length > 0 ? (
        Object.entries(topAthletes).map(([test, data]) => (
          <div key={test} className="tableContainer">
            <h3 className="tableTitle">{test.replace(/_/g, " ").replace(/Try\d+/g, "Try $&")}</h3>
            <table className="top5Table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Athlete</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {data.map((entry, index) => (
                  <tr key={`${test}-${index}`}>
                    <td>{index + 1}</td>
                    <td>{entry.name}</td>
                    <td>{entry.value.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length === 0 && <p className="noData">No data available for this test.</p>}
          </div>
        ))
      ) : (
        <p className="noData">No top athletes data available.</p>
      )}

      <h2 className="subtitle">Averages for All Players by Test</h2>
      {Object.entries(averageData).length > 0 ? (
        Object.entries(averageData).map(([test, avg]) => (
          <div key={test} className="chartContainer">
            <canvas id={`avgChart-${test}`} className="chart" height="200"></canvas>
            {avg === undefined && <p className="noData">No data available for this test.</p>}
          </div>
        ))
      ) : (
        <p className="noData">No average data available.</p>
      )}
    </div>
  );
}