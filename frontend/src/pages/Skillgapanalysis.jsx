import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Layout from "../Layout"

const ROLE_OPTIONS = [
  {key:"frontend_developer", label:"Frontend Developer", icon:"🎨"},
  {key:"backend_developer", label:"Backend Developer", icon:"⚙️"},
  {key:"data_analyst", label:"Data Analyst", icon:"📊"},
  {key:"ml_engineer", label:"ML Engineer", icon:"🤖"},
  {key:"devops_engineer", label:"DevOps Engineer", icon:"🔧"}
]

function CircularScore({ value, size = 120, stroke = 11, color = "#5C4033" }) {
  const [progress, setProgress] = useState(0)
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    const t = setTimeout(() => setProgress(value || 0), 300)
    return () => clearTimeout(t)
  }, [value])

  return (
    <div style={{position:"relative",width:size,height:size,margin:"0 auto"}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#EFE4D3" strokeWidth={stroke}/>
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (progress/100)*circumference}
          style={{transition:"stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)"}}
        />
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <p style={{fontSize:"30px",fontWeight:"900",color,margin:0,lineHeight:1}}>{value}%</p>
      </div>
    </div>
  )
}

function SkillGapAnalysis() {
  const navigate = useNavigate()
  const resumeId = localStorage.getItem("resume_id")
  const [selectedRole, setSelectedRole] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const savedRole = localStorage.getItem("career_discovery_scores")
    if (savedRole) {
      try {
        const scores = JSON.parse(savedRole)
        const top = Object.entries(scores).sort((a,b) => b[1]-a[1])[0]?.[0]
        if (top && ROLE_OPTIONS.some(r => r.key === top)) analyzeRole(top)
      } catch { /* no saved preference, fine */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const analyzeRole = async (roleKey) => {
    if (!resumeId) { setError("Upload a resume first to run skill gap analysis."); return }
    setSelectedRole(roleKey)
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get("http://127.0.0.1:8000/resume/" + resumeId + "/skill-gap/" + roleKey)
      setResult(res.data)
    } catch {
      setError("Couldn't analyze this role right now — please try again.")
    }
    setLoading(false)
  }

  const getScoreColor = (s) => s >= 70 ? "#22C55E" : s >= 40 ? "#F59E0B" : "#EF4444"

  return (
    <Layout>
      <div style={{maxWidth:"800px",margin:"0 auto"}}>

        <div style={{marginBottom:"24px"}}>
          <h2 style={{fontSize:"26px",fontWeight:"800",color:"#5C4033",marginBottom:"6px"}}>🧩 Skill Gap Analysis</h2>
          <p style={{color:"#8D6E63",fontSize:"14px"}}>Pick a dream role and see exactly what stands between you and it.</p>
        </div>

        {!resumeId && (
          <div style={{backgroundColor:"#FEF3C7",borderRadius:"14px",padding:"16px 20px",color:"#B45309",fontSize:"13px",marginBottom:"20px"}}>
            Upload your resume first for a personalized analysis. <span onClick={() => navigate("/upload")} style={{textDecoration:"underline",cursor:"pointer",fontWeight:"700"}}>Upload now</span>
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))",gap:"10px",marginBottom:"24px"}}>
          {ROLE_OPTIONS.map(r => (
            <div
              key={r.key}
              onClick={() => analyzeRole(r.key)}
              className="card-hover"
              style={{
                backgroundColor:"#FFFDF9",borderRadius:"14px",padding:"16px",textAlign:"center",cursor:"pointer",
                border: selectedRole===r.key ? "2px solid #C89B6D" : "1px solid #EFE4D3",
                boxShadow:"0 2px 12px rgba(92,64,51,0.08)"
              }}
            >
              <div style={{fontSize:"26px",marginBottom:"6px"}}>{r.icon}</div>
              <p style={{fontSize:"12px",fontWeight:"700",color:"#5C4033",margin:0}}>{r.label}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="animate-fadeIn" style={{backgroundColor:"#FEE2E2",borderRadius:"12px",padding:"14px 18px",color:"#DC2626",fontSize:"13px",marginBottom:"20px"}}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
            <div className="skeleton" style={{height:"180px",borderRadius:"20px"}}/>
            <div className="skeleton" style={{height:"200px",borderRadius:"16px"}}/>
          </div>
        )}

        {!loading && result && (
          <div className="animate-fadeUp" style={{display:"flex",flexDirection:"column",gap:"18px"}}>

            <div style={{backgroundColor:"#FFFDF9",borderRadius:"20px",padding:"28px",textAlign:"center",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
              <p style={{color:"#8D6E63",fontSize:"13px",marginBottom:"14px"}}>Match with {result.role}</p>
              <CircularScore value={result.match_score} color={getScoreColor(result.match_score)}/>
              <div style={{display:"inline-block",backgroundColor:getScoreColor(result.match_score)+"22",color:getScoreColor(result.match_score),padding:"6px 18px",borderRadius:"20px",fontWeight:"700",fontSize:"14px",marginTop:"14px"}}>
                {result.verdict}
              </div>
              <p style={{color:"#7A6A5D",fontSize:"13px",marginTop:"12px",lineHeight:"1.6"}}>{result.career_advice}</p>
            </div>

            {result.matched_skills.length > 0 && (
              <div style={{backgroundColor:"#FFFDF9",borderRadius:"16px",padding:"20px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
                <h3 style={{fontSize:"14px",fontWeight:"700",color:"#16A34A",marginBottom:"12px"}}>✅ Skills You Already Have</h3>
                <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                  {result.matched_skills.map(s => (
                    <span key={s} style={{backgroundColor:"#DCFCE7",color:"#16A34A",padding:"3px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:"600"}}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {result.missing_skills.length > 0 && (
              <div style={{backgroundColor:"#FFFDF9",borderRadius:"16px",padding:"20px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
                <h3 style={{fontSize:"14px",fontWeight:"700",color:"#5C4033",marginBottom:"14px"}}>🎯 Skills to Close the Gap</h3>
                <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                  {result.missing_skills.map((s,i) => (
                    <div key={i} style={{backgroundColor:"#FDF8F0",borderRadius:"12px",padding:"14px 16px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px",flexWrap:"wrap",gap:"6px"}}>
                        <span style={{fontWeight:"700",color:"#5C4033",fontSize:"13px",textTransform:"capitalize"}}>{s.skill}</span>
                        <div style={{display:"flex",gap:"6px"}}>
                          <span style={{backgroundColor:s.priority==="High"?"#FEE2E2":"#FEF3C7",color:s.priority==="High"?"#DC2626":"#B45309",padding:"2px 10px",borderRadius:"20px",fontSize:"10px",fontWeight:"700"}}>{s.priority} priority</span>
                          <span style={{backgroundColor:"#F0E4D3",color:"#5C4033",padding:"2px 10px",borderRadius:"20px",fontSize:"10px",fontWeight:"700"}}>{s.difficulty}</span>
                        </div>
                      </div>
                      <p style={{color:"#8D6E63",fontSize:"11px",margin:0}}>⏱ {s.learning_time}{s.resource ? " · " : ""}{s.resource && <a href={s.link} target="_blank" rel="noreferrer" style={{color:"#5C4033",fontWeight:"600"}}>{s.resource}</a>}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => navigate("/roadmap/"+resumeId+"/"+selectedRole)} className="btn btn-primary" style={{padding:"14px"}}>
              See Full Learning Roadmap →
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default SkillGapAnalysis