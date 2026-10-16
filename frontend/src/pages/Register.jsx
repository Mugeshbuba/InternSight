import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"
import logo from "../assets/logo.jpeg"

function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({full_name: "", email: "", password: "", role: "student"})
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError("")
    try {
      await axios.post("http://127.0.0.1:8000/auth/register", form)
      navigate("/login")
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed")
    }
    setLoading(false)
  }

  return (
    <div style={{minHeight: "100vh", backgroundColor: "#FDF8F0", display: "flex", fontFamily: "'Segoe UI', sans-serif"}}>

      {/* Left Side */}
      <div style={{
        flex: 1,
        background: "linear-gradient(135deg, #7A5233 0%, #C89B6D 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px",
        color: "white",
        position: "relative",
        overflow: "hidden"
      }}>
        <div className="animate-float" style={{position:"absolute",top:"14%",left:"12%",fontSize:"30px",opacity:0.35,animationDelay:"0.4s"}}>🚀</div>
        <div className="animate-float" style={{position:"absolute",bottom:"14%",right:"10%",fontSize:"30px",opacity:0.35,animationDelay:"1.1s"}}>✨</div>
        <img src={logo} alt="InternSight" className="animate-fadeUp" style={{height: "80px", objectFit: "contain", marginBottom: "32px", position:"relative"}}/>
        <h2 className="animate-fadeUp stagger-1" style={{fontSize: "32px", fontWeight: "800", marginBottom: "16px", textAlign: "center", position:"relative"}}>
          Discover Your Path
        </h2>
        <p className="animate-fadeUp stagger-2" style={{fontSize: "16px", opacity: 0.8, textAlign: "center", lineHeight: "1.7", maxWidth: "320px", position:"relative"}}>
          Join thousands of students who improved their resume and landed their dream internship.
        </p>
        <div className="animate-fadeUp stagger-3" style={{marginTop: "48px", display: "flex", flexDirection: "column", gap: "16px", width: "100%", maxWidth: "300px", position:"relative"}}>
          {["Free forever", "Instant ATS analysis", "Real job matching", "Personalized roadmap"].map((f, i) => (
            <div key={i} style={{display: "flex", alignItems: "center", gap: "12px"}}>
              <div style={{width: "24px", height: "24px", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px"}}>✓</div>
              <span style={{fontSize: "14px", opacity: 0.9}}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side */}
      <div style={{flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px"}}>
        <div className="animate-fadeUp" style={{width: "100%", maxWidth: "400px"}}>
          <h2 style={{fontSize: "32px", fontWeight: "800", color: "#5C4033", marginBottom: "8px"}}>
            Create Account
          </h2>
          <p style={{color: "#8D6E63", marginBottom: "36px"}}>
            Start your internship journey today
          </p>

          {error && (
            <div className="animate-fadeIn" style={{backgroundColor: "#FEE2E2", color: "#DC2626", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px"}}>
              {error}
            </div>
          )}

          <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
            <div>
              <label style={{fontSize: "13px", fontWeight: "600", color: "#6B5B4D", marginBottom: "6px", display: "block"}}>Full Name</label>
              <input
                type="text"
                name="full_name"
                placeholder="Your full name"
                value={form.full_name}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label style={{fontSize: "13px", fontWeight: "600", color: "#6B5B4D", marginBottom: "6px", display: "block"}}>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label style={{fontSize: "13px", fontWeight: "600", color: "#6B5B4D", marginBottom: "6px", display: "block"}}>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label style={{fontSize: "13px", fontWeight: "600", color: "#6B5B4D", marginBottom: "6px", display: "block"}}>I am a</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="input"
              >
                <option value="student">Student</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn btn-primary"
              style={{padding: "14px", fontSize: "16px", marginTop: "8px", opacity: loading ? 0.7 : 1}}
            >
              {loading ? "Creating Account..." : "Create Account →"}
            </button>
          </div>

          <p style={{textAlign: "center", marginTop: "24px", color: "#8D6E63", fontSize: "14px"}}>
            Already have an account?{" "}
            <Link to="/login" style={{color: "#C89B6D", fontWeight: "600", textDecoration: "none"}}>
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register