import { useState } from "react";
import { db } from "../firebase/firebase";
import { collection, addDoc } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";

export default function AthleteSignUpPage() {
  const [athlete, setAthlete] = useState({
    firstName: "",
    lastName: "",
    birthdate: "",
    email: "",
    instagram: "",
    sport: "",
    team: "",
    position: "",
    jerseyNumber: "",
    club: "",
    league: ""
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAthlete({ ...athlete, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!athlete.firstName || !athlete.lastName || !athlete.team || !athlete.birthdate || !athlete.email) {
      alert("Please fill in required fields.");
      return;
    }

    try {
      await addDoc(collection(db, "athletes"), {
        ...athlete,
        jerseyNumber: Number(athlete.jerseyNumber) || null,
        birthdate: athlete.birthdate || null,
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error adding athlete: ", error);
      alert("❌ Failed to sign up.");
    }
  };

  return (
    <div className="container">
      <div className="contentWrapper">
        <Image src="/wintality.png" alt="Wintality Logo" width={300} height={300} className="logo" />
        <h1 className="title">Athlete Sign-Up</h1>

        {submitted ? (
          <div className="successMessage">
            <h2 className="subtitle">✅ Sign-up Successful!</h2>
            <p>Thank you for signing up. You will be contacted soon.</p>
            <Link href="/">
              <button className="actionButton">Back to Home</button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-grid">
              <div className="form-group">
                <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} value={athlete.firstName} required className="input" />
              </div>
              <div className="form-group">
                <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} value={athlete.lastName} required className="input" />
              </div>
              <div className="form-group">
                <input type="date" name="birthdate" onChange={handleChange} value={athlete.birthdate} className="input" />
              </div>
              <div className="form-group">
                <input type="email" name="email" placeholder="E-Mail" onChange={handleChange} value={athlete.email} required className="input" />
              </div>
              <div className="form-group">
                <input type="text" name="instagram" placeholder="Instagram" onChange={handleChange} value={athlete.instagram} className="input" />
              </div>
              <div className="form-group">
                <input type="text" name="sport" placeholder="Sport" onChange={handleChange} value={athlete.sport} className="input" />
              </div>
              <div className="form-group">
                <input type="text" name="team" placeholder="Team" onChange={handleChange} value={athlete.team} required className="input" />
              </div>
              <div className="form-group">
                <input type="text" name="position" placeholder="Position" onChange={handleChange} value={athlete.position} className="input" />
              </div>
              <div className="form-group">
                <input type="number" name="jerseyNumber" placeholder="Trikotnummer" onChange={handleChange} value={athlete.jerseyNumber} className="input" />
              </div>
              <div className="form-group">
                <input type="text" name="club" placeholder="Verein" onChange={handleChange} value={athlete.club} className="input" />
              </div>
              <div className="form-group">
                <input type="text" name="league" placeholder="Liga" onChange={handleChange} value={athlete.league} className="input" />
              </div>
            </div>
            <button type="submit" className="actionButton">
              Sign Up
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
