import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import Layout from "../Layout"

const MNC_COMPANIES = [
  {name:"Google", icon:"🔍", roles:["frontend_developer","backend_developer","ml_engineer"], difficulty:"Hard"},
  {name:"Microsoft", icon:"🪟", roles:["backend_developer","devops_engineer","frontend_developer"], difficulty:"Hard"},
  {name:"Amazon", icon:"📦", roles:["backend_developer","devops_engineer","ml_engineer"], difficulty:"Hard"},
  {name:"TCS", icon:"🏢", roles:["backend_developer","frontend_developer","data_analyst"], difficulty:"Medium"},
  {name:"Infosys", icon:"💼", roles:["backend_developer","frontend_developer","data_analyst"], difficulty:"Medium"},
  {name:"Wipro", icon:"🌊", roles:["backend_developer","frontend_developer","devops_engineer"], difficulty:"Medium"},
  {name:"Zoho", icon:"🔧", roles:["frontend_developer","backend_developer","data_analyst"], difficulty:"Medium"},
  {name:"Freshworks", icon:"🌱", roles:["frontend_developer","backend_developer","ml_engineer"], difficulty:"Medium"},
  {name:"Flipkart", icon:"🛒", roles:["backend_developer","ml_engineer","data_analyst"], difficulty:"Hard"},
  {name:"Swiggy", icon:"🍔", roles:["backend_developer","devops_engineer","frontend_developer"], difficulty:"Medium"}
]

const ALL_APTITUDE_QUESTIONS = [
  {q:"A train travels 360 km in 4 hours. What is its speed in m/s?",options:["25 m/s","20 m/s","30 m/s","15 m/s"],answer:0,explanation:"360 km/4h = 90 km/h = 90×1000/3600 = 25 m/s"},
  {q:"If 6 workers complete a job in 12 days, how many days will 9 workers take?",options:["8 days","6 days","10 days","9 days"],answer:0,explanation:"6×12=72 work-days. 72/9 = 8 days"},
  {q:"What is 15% of 240?",options:["36","32","40","38"],answer:0,explanation:"15/100 × 240 = 36"},
  {q:"A shopkeeper sells for Rs.120 at 20% profit. Cost price?",options:["Rs.100","Rs.96","Rs.105","Rs.110"],answer:0,explanation:"CP = 120/1.20 = Rs.100"},
  {q:"Find the next number: 2, 6, 12, 20, 30, ?",options:["42","40","44","38"],answer:0,explanation:"Differences: 4,6,8,10,12. Next = 30+12 = 42"},
  {q:"Two pipes fill a tank in 20 and 30 minutes. Together?",options:["12 min","15 min","10 min","8 min"],answer:0,explanation:"1/20+1/30=5/60=1/12. Time=12 min"},
  {q:"A is 3 years older than B. B is 2 years younger than C. C=25. A=?",options:["26","24","28","25"],answer:0,explanation:"C=25, B=23, A=26"},
  {q:"If COMPUTER is coded as RETUPMOC, how is MOUSE coded?",options:["ESUOM","MOUEM","ESEUM","OMUSE"],answer:0,explanation:"Word is reversed. MOUSE reversed = ESUOM"},
  {q:"A car travels 100 km at 50 km/h and 100 km at 100 km/h. Average speed?",options:["66.67 km/h","75 km/h","80 km/h","70 km/h"],answer:0,explanation:"Total time=2+1=3h. Average=200/3=66.67"},
  {q:"Simple interest on Rs.5000 at 8% for 3 years?",options:["Rs.1200","Rs.1000","Rs.1500","Rs.800"],answer:0,explanation:"SI=5000×8×3/100=1200"},
  {q:"What is 25% of 25% of 400?",options:["25","50","100","75"],answer:0,explanation:"25% of 400=100. 25% of 100=25"},
  {q:"A man walks 3 km north then 4 km east. Distance from start?",options:["5 km","7 km","6 km","4 km"],answer:0,explanation:"Pythagoras: √(9+16)=√25=5 km"},
  {q:"Find odd one out: 2, 3, 5, 7, 9, 11",options:["9","7","11","3"],answer:0,explanation:"9=3×3 is not prime. All others are prime numbers"},
  {q:"If 8 apples cost Rs.56, what do 12 apples cost?",options:["Rs.84","Rs.72","Rs.96","Rs.80"],answer:0,explanation:"Cost per apple=56/8=7. 12×7=84"},
  {q:"A can do a work in 10 days, B in 15 days. Together in?",options:["6 days","8 days","5 days","7 days"],answer:0,explanation:"1/10+1/15=3/30+2/30=5/30=1/6. Time=6 days"},
  {q:"What is the LCM of 12 and 18?",options:["36","24","72","18"],answer:0,explanation:"LCM(12,18)=36"},
  {q:"If 30% of x = 90, then x = ?",options:["300","270","330","250"],answer:0,explanation:"x=90×100/30=300"},
  {q:"A rectangle has length 12 and breadth 8. Perimeter?",options:["40","48","80","20"],answer:0,explanation:"Perimeter=2(12+8)=2×20=40"},
  {q:"Speed of light is 3×10^8 m/s. In km/s?",options:["300000","30000","3000000","30"],answer:0,explanation:"3×10^8 m/s = 3×10^5 km/s = 300000 km/s"},
  {q:"What comes next: 1, 4, 9, 16, 25, ?",options:["36","32","40","49"],answer:0,explanation:"Pattern: 1²,2²,3²,4²,5²,6²=36"},
  {q:"Compound interest on Rs.1000 at 10% for 2 years?",options:["Rs.210","Rs.200","Rs.220","Rs.190"],answer:0,explanation:"A=1000(1.1)²=1210. CI=210"},
  {q:"A cistern is filled in 9 hours, leaks in 12 hours. Net fill time?",options:["36 hours","24 hours","48 hours","18 hours"],answer:0,explanation:"Net rate=1/9-1/12=4/36-3/36=1/36. Time=36h"},
  {q:"Average of 5 numbers is 20. If one number is 30, average of rest?",options:["17.5","15","20","22"],answer:0,explanation:"Sum=100. Rest sum=70. Average=70/4=17.5"},
  {q:"In a class of 30, boys:girls = 2:3. How many girls?",options:["18","12","15","20"],answer:0,explanation:"Girls=3/5×30=18"},
  {q:"A train 200m long passes a pole in 20 seconds. Speed in km/h?",options:["36","45","30","40"],answer:0,explanation:"Speed=200/20=10 m/s=36 km/h"},
  {q:"What is the HCF of 36 and 48?",options:["12","6","24","18"],answer:0,explanation:"HCF(36,48)=12"},
  {q:"Profit percentage if CP=400, SP=500?",options:["25%","20%","30%","15%"],answer:0,explanation:"Profit=100. %=100/400×100=25%"},
  {q:"A 6-digit number 5_7234 is divisible by 9. Missing digit?",options:["1","2","3","4"],answer:0,explanation:"Sum of digits must be a multiple of 9 for the number to be divisible by 9."},
  {q:"If today is Monday, what day is 100 days later?",options:["Wednesday","Tuesday","Thursday","Friday"],answer:0,explanation:"100/7=14 weeks + 2 days. Monday+2=Wednesday"},
  {q:"A sphere has radius 7cm. Volume? (π=22/7)",options:["1437.33 cm³","1232 cm³","1540 cm³","1200 cm³"],answer:0,explanation:"V=4/3×22/7×7³=4/3×22/7×343=1437.33"}
]

const APTITUDE_SETS = [
  ALL_APTITUDE_QUESTIONS.slice(0,8),
  ALL_APTITUDE_QUESTIONS.slice(8,16),
  ALL_APTITUDE_QUESTIONS.slice(16,24),
  ALL_APTITUDE_QUESTIONS.slice(24,30)
]

function Interview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("companies")
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [selectedRole, setSelectedRole] = useState("frontend_developer")
  const [questions, setQuestions] = useState(null)
  const [careerPath, setCareerPath] = useState(null)
  const [loading, setLoading] = useState(false)
  const [answers, setAnswers] = useState({})
  const [scores, setScores] = useState({})
  const [aptitudeSet, setAptitudeSet] = useState(0)
  const [challenges, setChallenges] = useState([])
  const [selectedChallenge, setSelectedChallenge] = useState(null)
  const [code, setCode] = useState("")
  const [runLoading, setRunLoading] = useState(false)
  const [runResult, setRunResult] = useState(null)
  const [aptAnswers, setAptAnswers] = useState({})
  const [aptSubmitted, setAptSubmitted] = useState(false)
  const [difficultyFilter, setDifficultyFilter] = useState("All")
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [sessionSaving, setSessionSaving] = useState(false)
  const [sessionSaved, setSessionSaved] = useState(false)
  const resumeId = id || localStorage.getItem("resume_id")

  useEffect(() => {
    if (activeTab !== "mock") return
    const timer = setInterval(() => setElapsedSeconds(s => s + 1), 1000)
    return () => clearInterval(timer)
  }, [activeTab])

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2,"0")
    const sec = (s % 60).toString().padStart(2,"0")
    return m + ":" + sec
  }

  const filteredCompanies = difficultyFilter === "All" ? MNC_COMPANIES : MNC_COMPANIES.filter(c => c.difficulty === difficultyFilter)

  const fetchChallenges = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/coding/challenges")
      setChallenges(res.data)
    } catch { setChallenges([]) }
  }

  const selectChallenge = (ch) => {
    setSelectedChallenge(ch)
    setCode(ch.starter_code)
    setRunResult(null)
  }

  const runCode = async () => {
    setRunLoading(true)
    setRunResult(null)
    try {
      const res = await axios.post("http://127.0.0.1:8000/coding/run", {
        source_code: code, language: "python",
        stdin: selectedChallenge?.stdin || "",
        challenge_id: selectedChallenge?.id
      })
      setRunResult(res.data)
    } catch {
      setRunResult({success:false, message:"Couldn't reach the code execution service."})
    }
    setRunLoading(false)
  }

  const feedbackSummary = () => {
    const values = Object.values(scores)
    if (values.length === 0) return null
    const counts = {Strong:0, Good:0, Weak:0, "Too Short":0}
    values.forEach(v => counts[v.score]++)
    return counts
  }

  const saveSession = async () => {
    const userId = localStorage.getItem("user_id")
    if (!userId) return
    const summary = feedbackSummary()
    if (!summary) return

    setSessionSaving(true)
    try {
      await axios.post("http://127.0.0.1:8000/interview-history/" + userId, {
        company: selectedCompany?.name || null,
        role: selectedRole,
        strong_count: summary.Strong,
        good_count: summary.Good,
        weak_count: summary.Weak,
        too_short_count: summary["Too Short"],
        elapsed_seconds: elapsedSeconds
      })
      setSessionSaved(true)
      setTimeout(() => setSessionSaved(false), 3000)
    } catch {
      alert("Couldn't save this session — please try again.")
    }
    setSessionSaving(false)
  }

  const currentAptitudeQuestions = APTITUDE_SETS[aptitudeSet]

  const roles = [
    {key:"frontend_developer",label:"Frontend Developer"},
    {key:"data_analyst",label:"Data Analyst"},
    {key:"ml_engineer",label:"ML Engineer"},
    {key:"backend_developer",label:"Backend Developer"},
    {key:"devops_engineer",label:"DevOps Engineer"}
  ]

  const fetchQuestions = async (role) => {
    setLoading(true)
    try {
      const [qRes, cRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/resume/" + resumeId + "/interview/" + role),
        axios.get("http://127.0.0.1:8000/resume/" + resumeId + "/career-path")
      ])
      setQuestions(qRes.data)
      setCareerPath(cRes.data)
    } catch (err) {
      console.error("Failed")
    }
    setLoading(false)
  }

  const handleCompanySelect = (company) => {
    setSelectedCompany(company)
    const role = company.roles[0]
    setSelectedRole(role)
    fetchQuestions(role)
    setActiveTab("questions")
  }

  const scoreAnswer = (index, answer) => {
    const words = answer.trim().split(" ").length
    const score = words >= 50 ? "Strong" : words >= 20 ? "Good" : words >= 5 ? "Weak" : "Too Short"
    const color = score === "Strong" ? "#16A34A" : score === "Good" ? "#F59E0B" : "#EF4444"
    setScores(prev => ({...prev, [index]: {score, color, words}}))
  }

  const getAptScore = () => {
    let correct = 0
    currentAptitudeQuestions.forEach((q, i) => {
      if (aptAnswers[i] === q.answer) correct++
    })
    return correct
  }

  const diffColor = (d) => d === "Hard" ? "#FEE2E2" : "#FEF3C7"
  const diffText = (d) => d === "Hard" ? "#DC2626" : "#B45309"

  return (
    <Layout>
      <div style={{maxWidth:"900px",margin:"0 auto"}}>

        <div style={{marginBottom:"24px"}}>
          <h2 style={{fontSize:"26px",fontWeight:"800",color:"#5C4033",marginBottom:"6px"}}>🎤 Interview Preparation</h2>
          <p style={{color:"#8D6E63",fontSize:"14px"}}>Choose a company, practice questions and test your aptitude!</p>
        </div>

        <div style={{display:"flex",gap:"8px",marginBottom:"24px",backgroundColor:"#FFFDF9",padding:"6px",borderRadius:"12px",boxShadow:"0 2px 8px rgba(92,64,51,0.06)"}}>
          {[
            {key:"companies",label:"🏢 Companies"},
            {key:"questions",label:"❓ Questions"},
            {key:"mock",label:"🎯 Mock Interview"},
            {key:"aptitude",label:"🧮 Aptitude Test"},
            {key:"coding",label:"💻 Coding Round"},
            {key:"career",label:"🧭 Career Path"}
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); if (tab.key === "questions" || tab.key === "mock") fetchQuestions(selectedRole); if (tab.key === "mock" && activeTab !== "mock") setElapsedSeconds(0); if (tab.key === "coding" && challenges.length === 0) fetchChallenges() }}
              style={{flex:1,padding:"9px 6px",borderRadius:"8px",border:"none",cursor:"pointer",fontWeight:"600",fontSize:"12px",backgroundColor:activeTab===tab.key?"#5C4033":"transparent",color:activeTab===tab.key?"white":"#8D6E63",transition:"all 0.2s"}}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {activeTab === "companies" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",flexWrap:"wrap",gap:"10px"}}>
              <p style={{color:"#6B5B4D",fontSize:"14px",fontWeight:"600",margin:0}}>Select a company to practice their interview style:</p>
              <div style={{display:"flex",gap:"6px"}}>
                {["All","Hard","Medium"].map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficultyFilter(d)}
                    style={{padding:"5px 14px",borderRadius:"20px",border:"none",cursor:"pointer",fontWeight:"600",fontSize:"12px",backgroundColor:difficultyFilter===d?"#5C4033":"#F0E4D3",color:difficultyFilter===d?"white":"#5C4033"}}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
              {filteredCompanies.map((company, i) => (
                <div
                  key={i}
                  className="card-hover"
                  onClick={() => handleCompanySelect(company)}
                  style={{backgroundColor:"#FFFDF9",borderRadius:"16px",padding:"20px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",cursor:"pointer",display:"flex",gap:"14px",alignItems:"center",border:selectedCompany?.name===company.name?"2px solid #C89B6D":"2px solid transparent"}}
                >
                  <div style={{fontSize:"32px",flexShrink:0}}>{company.icon}</div>
                  <div style={{flex:1}}>
                    <h3 style={{fontSize:"16px",fontWeight:"700",color:"#5C4033",margin:"0 0 4px"}}>{company.name}</h3>
                    <p style={{color:"#8D6E63",fontSize:"12px",margin:"0 0 8px"}}>{company.roles.length} roles available</p>
                    <span style={{backgroundColor:diffColor(company.difficulty),color:diffText(company.difficulty),padding:"3px 10px",borderRadius:"20px",fontSize:"11px",fontWeight:"700"}}>
                      {company.difficulty}
                    </span>
                  </div>
                  <span style={{color:"#C89B6D",fontSize:"20px"}}>→</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(activeTab === "questions" || activeTab === "mock") && (
          <div>
            <div style={{backgroundColor:"#FFFDF9",borderRadius:"14px",padding:"16px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",marginBottom:"16px"}}>
              <div style={{display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap"}}>
                {selectedCompany && (
                  <span style={{backgroundColor:"#F0E4D3",color:"#5C4033",padding:"4px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:"700"}}>
                    {selectedCompany.icon} {selectedCompany.name}
                  </span>
                )}
                {roles.map(r => (
                  <button
                    key={r.key}
                    onClick={() => { setSelectedRole(r.key); fetchQuestions(r.key) }}
                    style={{padding:"6px 14px",borderRadius:"20px",border:"none",cursor:"pointer",fontWeight:"600",fontSize:"12px",backgroundColor:selectedRole===r.key?"#5C4033":"#F5EDE0",color:selectedRole===r.key?"white":"#5C4033"}}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{height:"110px",borderRadius:"16px"}}/>)}
              </div>
            ) : questions && (
              <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
                {activeTab === "mock" && (
                  <div style={{backgroundColor:"#5C4033",borderRadius:"14px",padding:"16px",color:"white",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
                    <div>
                      <p style={{fontWeight:"700",fontSize:"15px",margin:"0 0 4px"}}>🎯 Mock Interview Mode</p>
                      <p style={{opacity:0.8,fontSize:"12px",margin:0}}>Type your answer and click Check to get instant feedback!</p>
                    </div>
                    <div style={{backgroundColor:"rgba(255,255,255,0.15)",padding:"8px 16px",borderRadius:"10px",textAlign:"center"}}>
                      <p style={{fontSize:"18px",fontWeight:"800",margin:0,fontFamily:"monospace"}}>⏱ {formatTime(elapsedSeconds)}</p>
                      <p style={{fontSize:"9px",opacity:0.8,margin:0}}>elapsed</p>
                    </div>
                  </div>
                )}
                {activeTab === "mock" && feedbackSummary() && (
                  <div className="animate-fadeIn" style={{backgroundColor:"#FFFDF9",borderRadius:"14px",padding:"16px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",display:"flex",gap:"10px",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{display:"flex",gap:"10px",flexWrap:"wrap",alignItems:"center"}}>
                      <p style={{color:"#5C4033",fontWeight:"700",fontSize:"12px",margin:0}}>Session feedback:</p>
                      {Object.entries(feedbackSummary()).filter(([,v]) => v > 0).map(([label,count]) => (
                        <span key={label} style={{
                          backgroundColor: label==="Strong"?"#DCFCE7":label==="Good"?"#FEF3C7":"#FEE2E2",
                          color: label==="Strong"?"#16A34A":label==="Good"?"#B45309":"#DC2626",
                          padding:"4px 12px",borderRadius:"20px",fontSize:"11px",fontWeight:"700"
                        }}>{count} {label}</span>
                      ))}
                    </div>
                    {localStorage.getItem("user_id") && (
                      <button
                        onClick={saveSession}
                        disabled={sessionSaving}
                        style={{backgroundColor:sessionSaved?"#DCFCE7":"#5C4033",color:sessionSaved?"#16A34A":"white",border:"none",padding:"6px 14px",borderRadius:"8px",fontSize:"11px",fontWeight:"700",cursor:"pointer"}}
                      >
                        {sessionSaving ? "Saving..." : sessionSaved ? "✅ Saved" : "💾 Save Session"}
                      </button>
                    )}
                  </div>
                )}
                {questions.questions.map((q, i) => (
                  <div key={i} style={{backgroundColor:"#FFFDF9",borderRadius:"16px",padding:"22px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
                    <div style={{display:"flex",gap:"12px",alignItems:"flex-start",marginBottom:"12px"}}>
                      <div style={{backgroundColor:"#F0E4D3",color:"#5C4033",width:"28px",height:"28px",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"700",flexShrink:0,fontSize:"13px"}}>{i+1}</div>
                      <div style={{flex:1}}>
                        <p style={{color:"#5C4033",fontSize:"15px",fontWeight:"600",margin:"0 0 4px",lineHeight:"1.5"}}>{q.q}</p>
                        <span style={{backgroundColor:q.category==="Technical"?"#F0E4D3":q.category==="Behavioral"?"#FEF3C7":"#F5EDE0",color:q.category==="Technical"?"#5C4033":q.category==="Behavioral"?"#B45309":"#8A5FA8",padding:"2px 10px",borderRadius:"20px",fontSize:"11px",fontWeight:"700"}}>{q.category}</span>
                      </div>
                    </div>
                    <div style={{backgroundColor:"#F5EDE0",borderRadius:"8px",padding:"10px 14px",marginBottom: activeTab==="mock"?"12px":"0"}}>
                      <p style={{color:"#5C4033",fontSize:"12px",margin:0}}>💡 {q.hint}</p>
                    </div>
                    {activeTab === "mock" && (
                      <div>
                        <textarea
                          value={answers[i] || ""}
                          onChange={e => setAnswers(prev => ({...prev, [i]: e.target.value}))}
                          placeholder="Type your answer here..."
                          rows={3}
                          style={{width:"100%",padding:"12px",borderRadius:"8px",border:"1px solid #E8D9C5",fontSize:"13px",outline:"none",resize:"none",boxSizing:"border-box",fontFamily:"'Segoe UI',sans-serif",marginBottom:"10px"}}
                        />
                        <div style={{display:"flex",gap:"10px",alignItems:"center"}}>
                          <button
                            onClick={() => scoreAnswer(i, answers[i] || "")}
                            style={{backgroundColor:"#5C4033",color:"white",border:"none",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"12px"}}
                          >
                            Check Answer
                          </button>
                          {scores[i] && (
                            <span style={{backgroundColor:scores[i].color+"22",color:scores[i].color,padding:"6px 12px",borderRadius:"20px",fontWeight:"700",fontSize:"12px"}}>
                              {scores[i].score} · {scores[i].words} words
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "aptitude" && (
          <div>
            <div style={{backgroundColor:"#5C4033",borderRadius:"16px",padding:"20px",color:"white",textAlign:"center",marginBottom:"20px"}}>
              <h3 style={{fontSize:"20px",fontWeight:"700",margin:"0 0 6px"}}>🧮 Aptitude Test</h3>
              <p style={{opacity:0.8,fontSize:"13px",margin:0}}>{currentAptitudeQuestions.length} questions · Common in MNC interviews</p>
            </div>

            {!aptSubmitted ? (
              <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
                {currentAptitudeQuestions.map((q, i) => (
                  <div key={i} style={{backgroundColor:"#FFFDF9",borderRadius:"16px",padding:"22px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
                    <p style={{color:"#5C4033",fontSize:"15px",fontWeight:"600",margin:"0 0 14px"}}>
                      {i+1}. {q.q}
                    </p>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                      {q.options.map((opt, j) => (
                        <div
                          key={j}
                          onClick={() => setAptAnswers(prev => ({...prev, [i]: j}))}
                          style={{
                            padding:"10px 14px",
                            borderRadius:"8px",
                            border: aptAnswers[i]===j ? "2px solid #5C4033" : "1px solid #E8D9C5",
                            cursor:"pointer",
                            backgroundColor: aptAnswers[i]===j ? "#F0E4D3" : "#FFFDF9",
                            fontSize:"13px",
                            color:"#4A3728",
                            fontWeight: aptAnswers[i]===j ? "600" : "400"
                          }}
                        >
                          {String.fromCharCode(65+j)}. {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setAptSubmitted(true)}
                  disabled={Object.keys(aptAnswers).length < currentAptitudeQuestions.length}
                  style={{width:"100%",backgroundColor:Object.keys(aptAnswers).length===currentAptitudeQuestions.length?"#5C4033":"#ccc",color:"white",border:"none",padding:"14px",borderRadius:"12px",fontSize:"15px",fontWeight:"700",cursor:Object.keys(aptAnswers).length===currentAptitudeQuestions.length?"pointer":"not-allowed"}}
                >
                  Submit Test ({Object.keys(aptAnswers).length}/{currentAptitudeQuestions.length} answered)
                </button>
              </div>
            ) : (
              <div>
                <div style={{
                  background: getAptScore() >= 6 ? "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)" : getAptScore() >= 4 ? "linear-gradient(135deg, #F59E0B 0%, #E8B872 100%)" : "linear-gradient(135deg, #EF4444 0%, #F97316 100%)",
                  borderRadius:"20px",padding:"32px",textAlign:"center",color:"white",marginBottom:"20px"
                }}>
                  <p style={{fontSize:"14px",opacity:0.85,margin:"0 0 8px"}}>Your Score</p>
                  <p style={{fontSize:"56px",fontWeight:"900",margin:"0 0 8px",lineHeight:1}}>{getAptScore()}/{currentAptitudeQuestions.length}</p>
                  <p style={{fontSize:"18px",fontWeight:"700",margin:0}}>
                    {getAptScore() >= 6 ? "Excellent! 🎉" : getAptScore() >= 4 ? "Good! Keep practicing 💪" : "Needs improvement 📚"}
                  </p>

                  <button
                    onClick={() => {
                      setAptitudeSet((aptitudeSet + 1) % APTITUDE_SETS.length)
                      setAptAnswers({})
                      setAptSubmitted(false)
                    }}
                    style={{width:"100%",marginTop:"10px",backgroundColor:"#F0E4D3",color:"#5C4033",border:"none",padding:"12px",borderRadius:"10px",fontSize:"14px",fontWeight:"600",cursor:"pointer"}}
                  >
                    🔄 Try Another Set of Questions ({APTITUDE_SETS.length} sets available)
                  </button>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                  {currentAptitudeQuestions.map((q, i) => (
                    <div key={i} style={{backgroundColor:"#FFFDF9",borderRadius:"14px",padding:"18px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",borderLeft:"4px solid "+(aptAnswers[i]===q.answer?"#22C55E":"#EF4444")}}>
                      <p style={{color:"#5C4033",fontSize:"14px",fontWeight:"600",margin:"0 0 10px"}}>{i+1}. {q.q}</p>
                      <p style={{color:aptAnswers[i]===q.answer?"#16A34A":"#DC2626",fontSize:"13px",margin:"0 0 6px",fontWeight:"600"}}>
                        {aptAnswers[i]===q.answer ? "✅ Correct!" : "❌ Wrong — Answer: " + q.options[q.answer]}
                      </p>
                      <p style={{color:"#8D6E63",fontSize:"12px",margin:0}}>💡 {q.explanation}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { setAptAnswers({}); setAptSubmitted(false) }}
                  style={{width:"100%",marginTop:"16px",backgroundColor:"#5C4033",color:"white",border:"none",padding:"14px",borderRadius:"12px",fontSize:"15px",fontWeight:"700",cursor:"pointer"}}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "coding" && (
          <div>
            {!selectedChallenge ? (
              <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                <p style={{color:"#6B5B4D",fontSize:"14px",fontWeight:"600",marginBottom:"4px"}}>Pick a challenge to practice:</p>
                {challenges.map(ch => (
                  <div key={ch.id} onClick={() => selectChallenge(ch)} className="card-hover" style={{backgroundColor:"#FFFDF9",borderRadius:"14px",padding:"18px 22px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
                    <div>
                      <h3 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",margin:"0 0 4px"}}>{ch.title}</h3>
                      <p style={{color:"#8D6E63",fontSize:"12px",margin:0}}>{ch.description}</p>
                    </div>
                    <span style={{backgroundColor:ch.difficulty==="Easy"?"#DCFCE7":"#FEF3C7",color:ch.difficulty==="Easy"?"#16A34A":"#B45309",padding:"3px 12px",borderRadius:"20px",fontSize:"11px",fontWeight:"700",flexShrink:0}}>{ch.difficulty}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <button onClick={() => setSelectedChallenge(null)} style={{background:"none",border:"none",color:"#8D6E63",fontSize:"13px",cursor:"pointer",marginBottom:"12px",fontWeight:"600"}}>← Back to challenges</button>
                <div style={{backgroundColor:"#FFFDF9",borderRadius:"16px",padding:"20px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",marginBottom:"14px"}}>
                  <h3 style={{fontSize:"16px",fontWeight:"700",color:"#5C4033",marginBottom:"6px"}}>{selectedChallenge.title}</h3>
                  <p style={{color:"#6B5B4D",fontSize:"13px",margin:0}}>{selectedChallenge.description}</p>
                </div>
                <textarea
                  value={code} onChange={e => setCode(e.target.value)}
                  spellCheck={false}
                  style={{width:"100%",minHeight:"220px",padding:"16px",borderRadius:"12px",border:"1px solid #E8D9C5",fontSize:"13px",fontFamily:"'Courier New',monospace",outline:"none",boxSizing:"border-box",backgroundColor:"#2A1F18",color:"#F0E4D3",marginBottom:"12px"}}
                />
                <button onClick={runCode} disabled={runLoading} style={{backgroundColor:"#5C4033",color:"white",border:"none",padding:"10px 22px",borderRadius:"10px",fontSize:"13px",fontWeight:"700",cursor:"pointer",marginBottom:"14px"}}>
                  {runLoading ? "Running..." : "▶ Run Code"}
                </button>
                {runResult && (
                  <div className="animate-fadeIn" style={{backgroundColor:"#FFFDF9",borderRadius:"14px",padding:"18px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
                    {!runResult.success ? (
                      <p style={{color:"#B45309",fontSize:"13px",margin:0}}>{runResult.message}</p>
                    ) : (
                      <>
                        {runResult.passed !== undefined && (
                          <div style={{marginBottom:"10px"}}>
                            <span style={{backgroundColor:runResult.passed?"#DCFCE7":"#FEE2E2",color:runResult.passed?"#16A34A":"#DC2626",padding:"4px 14px",borderRadius:"20px",fontSize:"12px",fontWeight:"700"}}>
                              {runResult.passed ? "✅ Passed" : "❌ Not quite right"}
                            </span>
                          </div>
                        )}
                        <p style={{color:"#8D6E63",fontSize:"11px",fontWeight:"700",marginBottom:"4px"}}>OUTPUT</p>
                        <pre style={{backgroundColor:"#2A1F18",color:"#F0E4D3",padding:"12px",borderRadius:"8px",fontSize:"12px",overflowX:"auto",marginBottom:runResult.stderr?"10px":0}}>{runResult.stdout || "(no output)"}</pre>
                        {runResult.stderr && (
                          <>
                            <p style={{color:"#DC2626",fontSize:"11px",fontWeight:"700",marginBottom:"4px"}}>ERROR</p>
                            <pre style={{backgroundColor:"#FEE2E2",color:"#DC2626",padding:"12px",borderRadius:"8px",fontSize:"12px",overflowX:"auto"}}>{runResult.stderr}</pre>
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "career" && careerPath && (
          <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
            <div style={{background:"linear-gradient(135deg, #5C4033 0%, #C89B6D 100%)",borderRadius:"20px",padding:"28px",color:"white",textAlign:"center"}}>
              <div style={{fontSize:"40px",marginBottom:"12px"}}>🧭</div>
              <h3 style={{fontSize:"22px",fontWeight:"800",margin:"0 0 8px"}}>{careerPath.current_level}</h3>
              <p style={{opacity:0.85,margin:"0 0 20px",fontSize:"14px"}}>{careerPath.message}</p>
              <div style={{display:"flex",justifyContent:"center",gap:"14px"}}>
                {[
                  {label:"Next Level",val:careerPath.next_level},
                  {label:"Timeline",val:careerPath.estimated_timeline},
                  {label:"End Goal",val:careerPath.advanced_level}
                ].map((item,i) => (
                  <div key={i} style={{backgroundColor:"rgba(255,255,255,0.15)",padding:"12px 16px",borderRadius:"10px"}}>
                    <p style={{fontWeight:"700",margin:"0 0 2px",fontSize:"13px"}}>{item.val}</p>
                    <p style={{fontSize:"11px",opacity:0.8,margin:0}}>{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
              <div style={{backgroundColor:"#FFFDF9",borderRadius:"16px",padding:"20px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
                <h4 style={{color:"#16A34A",fontWeight:"700",marginBottom:"12px",fontSize:"14px"}}>✅ Skills You Have</h4>
                <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                  {careerPath.skills_you_have.map((s,i) => (
                    <span key={i} style={{backgroundColor:"#DCFCE7",color:"#16A34A",padding:"4px 10px",borderRadius:"20px",fontSize:"12px",fontWeight:"600"}}>{s}</span>
                  ))}
                </div>
              </div>
              <div style={{backgroundColor:"#FFFDF9",borderRadius:"16px",padding:"20px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
                <h4 style={{color:"#DC2626",fontWeight:"700",marginBottom:"12px",fontSize:"14px"}}>📚 Skills for Next Level</h4>
                <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                  {careerPath.skills_for_next_level.map((s,i) => (
                    <span key={i} style={{backgroundColor:"#FEE2E2",color:"#DC2626",padding:"4px 10px",borderRadius:"20px",fontSize:"12px",fontWeight:"600"}}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}

export default Interview
