import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import Layout from "../Layout"

function CircularScore({ value, size = 140, stroke = 12, color = "#5C4033" }) {
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
        <p style={{fontSize:"40px",fontWeight:"900",color,margin:0,lineHeight:1}}>{value}</p>
      </div>
    </div>
  )
}

function Results() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [score, setScore] = useState(null)
  const [matches, setMatches] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("score")
  const resumeId = id || localStorage.getItem("resume_id")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scoreRes, matchRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/resume/" + resumeId + "/score"),
          axios.get("http://127.0.0.1:8000/resume/" + resumeId + "/match-all")
        ])
        setScore(scoreRes.data)
        setMatches(matchRes.data.matches)
      } catch (err) {
        console.error("Failed")
      }
      setLoading(false)
    }
    fetchData()
  }, [resumeId])

  const getScoreColor = (s) => {
    if (s >= 80) return "#22C55E"
    if (s >= 60) return "#F59E0B"
    if (s >= 40) return "#F97316"
    return "#EF4444"
  }

  const getRoleKey = (roleName) => {
    const map = {
      "Frontend Developer":"frontend_developer",
      "Data Analyst":"data_analyst",
      "ML Engineer":"ml_engineer",
      "Backend Developer":"backend_developer",
      "DevOps Engineer":"devops_engineer"
    }
    return map[roleName] || "frontend_developer"
  }

  if (loading) {
    return (
      <Layout>
        <div style={{maxWidth:"800px",margin:"0 auto"}}>
          <div className="skeleton" style={{height:"280px",borderRadius:"20px",marginBottom:"20px"}}/>
          <div className="skeleton" style={{height:"44px",borderRadius:"10px",marginBottom:"20px"}}/>
          <div className="skeleton" style={{height:"320px",borderRadius:"16px"}}/>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{maxWidth:"800px",margin:"0 auto"}}>

        <div className="animate-fadeUp" style={{backgroundColor:"#FFFDF9",borderRadius:"20px",padding:"32px",textAlign:"center",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",marginBottom:"20px"}}>
          <p style={{color:"#8D6E63",fontSize:"13px",marginBottom:"14px"}}>Your ATS Score</p>
          <CircularScore value={score?.total_score} color={getScoreColor(score?.total_score)}/>
          <div style={{display:"inline-block",backgroundColor:getScoreColor(score?.total_score)+"22",color:getScoreColor(score?.total_score),padding:"6px 18px",borderRadius:"20px",fontWeight:"700",fontSize:"15px",marginTop:"16px",marginBottom:"10px"}}>
            {score?.grade}
          </div>
          <p style={{color:"#7A6A5D",fontSize:"14px",margin:0}}>{score?.message}</p>
        </div>

        <div style={{display:"flex",gap:"6px",marginBottom:"20px",backgroundColor:"#FFFDF9",padding:"5px",borderRadius:"10px",boxShadow:"0 2px 8px rgba(92,64,51,0.06)"}}>
          {[
            {key:"score",label:"📊 ATS Score"},
            {key:"jobs",label:"💼 Job Match"},
            {key:"tips",label:"💡 Tips"}
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{flex:1,padding:"9px",borderRadius:"8px",border:"none",cursor:"pointer",fontWeight:"600",fontSize:"13px",backgroundColor:activeTab===tab.key?"#5C4033":"transparent",color:activeTab===tab.key?"white":"#8D6E63",transition:"all 0.2s"}}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "score" && score && (
          <div className="animate-fadeUp" style={{display:"flex",flexDirection:"column",gap:"16px"}}>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
              <div style={{backgroundColor:"#DCFCE7",borderRadius:"14px",padding:"18px"}}>
                <p style={{color:"#16A34A",fontWeight:"700",fontSize:"13px",marginBottom:"10px"}}>✅ Strengths</p>
                {Object.entries(score.breakdown).filter(([,v]) => v.score >= 70).length === 0 && (
                  <p style={{color:"#16A34A",fontSize:"12px",opacity:0.7,margin:0}}>None above 70 yet — see breakdown below.</p>
                )}
                {Object.entries(score.breakdown).filter(([,v]) => v.score >= 70).map(([key,value]) => (
                  <p key={key} style={{color:"#166534",fontSize:"12px",margin:"0 0 6px",textTransform:"capitalize"}}>• {key} ({value.score}/100)</p>
                ))}
              </div>
              <div style={{backgroundColor:"#FEE2E2",borderRadius:"14px",padding:"18px"}}>
                <p style={{color:"#DC2626",fontWeight:"700",fontSize:"13px",marginBottom:"10px"}}>⚠️ Needs Work</p>
                {Object.entries(score.breakdown).filter(([,v]) => v.score < 50).length === 0 && (
                  <p style={{color:"#DC2626",fontSize:"12px",opacity:0.7,margin:0}}>No major weak spots — nice work!</p>
                )}
                {Object.entries(score.breakdown).filter(([,v]) => v.score < 50).map(([key,value]) => (
                  <p key={key} style={{color:"#991B1B",fontSize:"12px",margin:"0 0 6px",textTransform:"capitalize"}}>• {key} ({value.score}/100)</p>
                ))}
              </div>
            </div>

            <div style={{backgroundColor:"#FFFDF9",borderRadius:"16px",padding:"24px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
              <h3 style={{fontSize:"16px",fontWeight:"700",color:"#5C4033",marginBottom:"20px"}}>Score Breakdown</h3>
              {Object.entries(score.breakdown).map(([key, value]) => (
                <div key={key} style={{marginBottom:"18px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
                    <span style={{fontWeight:"600",color:"#4A3728",textTransform:"capitalize",fontSize:"13px"}}>{key}</span>
                    <span style={{fontWeight:"700",color:getScoreColor(value.score),fontSize:"13px"}}>{value.score}/100</span>
                  </div>
                  <div style={{backgroundColor:"#EFE4D3",borderRadius:"6px",height:"9px",overflow:"hidden"}}>
                    <div style={{height:"100%",width:value.score+"%",backgroundColor:getScoreColor(value.score),borderRadius:"6px"}}/>
                  </div>
                  <p style={{color:"#A08D7C",fontSize:"12px",marginTop:"4px"}}>{value.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "jobs" && matches && (
          <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
            <div style={{background:"linear-gradient(135deg, #5C4033 0%, #C89B6D 100%)",borderRadius:"14px",padding:"18px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",color:"white"}}>
              <div>
                <p style={{fontWeight:"700",fontSize:"15px",margin:"0 0 3px"}}>See Real Internship Listings!</p>
                <p style={{opacity:0.8,fontSize:"12px",margin:0}}>Check your match score for each job</p>
              </div>
              <button onClick={() => navigate("/jobs")} style={{backgroundColor:"#FFFDF9",color:"#5C4033",border:"none",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontWeight:"700",fontSize:"13px",whiteSpace:"nowrap"}}>
                Browse Jobs →
              </button>
            </div>

            {matches.map((match, index) => (
              <div key={index} className="card-hover" style={{backgroundColor:"#FFFDF9",borderRadius:"16px",padding:"22px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
                  <h3 style={{fontSize:"16px",fontWeight:"700",color:"#5C4033",margin:0}}>{match.role}</h3>
                  <div style={{padding:"5px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:"700",backgroundColor:match.verdict==="Strong Match"?"#DCFCE7":match.verdict==="Moderate Match"?"#FEF3C7":"#FEE2E2",color:match.verdict==="Strong Match"?"#16A34A":match.verdict==="Moderate Match"?"#B45309":"#DC2626"}}>
                    {match.verdict==="Strong Match"?"✅ ":match.verdict==="Moderate Match"?"⚠️ ":"❌ "}{match.verdict}
                  </div>
                </div>
                <div style={{backgroundColor:"#EFE4D3",borderRadius:"6px",height:"9px",marginBottom:"6px",overflow:"hidden"}}>
                  <div style={{height:"100%",width:match.match_score+"%",backgroundColor:getScoreColor(match.match_score),borderRadius:"6px"}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"14px"}}>
                  <span style={{color:"#8D6E63",fontSize:"12px"}}>Match Score</span>
                  <span style={{fontWeight:"700",color:getScoreColor(match.match_score),fontSize:"12px"}}>{match.match_score}%</span>
                </div>
                {match.missing_skills.length > 0 && (
                  <div style={{marginBottom:"10px"}}>
                    <p style={{color:"#8D6E63",fontSize:"12px",marginBottom:"6px"}}>Missing skills:</p>
                    <div style={{display:"flex",flexWrap:"wrap",gap:"5px"}}>
                      {match.missing_skills.map((skill,i) => (
                        <span key={i} style={{backgroundColor:"#FEE2E2",color:"#DC2626",padding:"3px 9px",borderRadius:"6px",fontSize:"11px",fontWeight:"500"}}>{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
                {match.matched_skills.length > 0 && (
                  <div style={{marginBottom:"14px"}}>
                    <p style={{color:"#8D6E63",fontSize:"12px",marginBottom:"6px"}}>Matched skills:</p>
                    <div style={{display:"flex",flexWrap:"wrap",gap:"5px"}}>
                      {match.matched_skills.map((skill,i) => (
                        <span key={i} style={{backgroundColor:"#DCFCE7",color:"#16A34A",padding:"3px 9px",borderRadius:"6px",fontSize:"11px",fontWeight:"500"}}>{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => navigate("/roadmap/"+resumeId+"/"+getRoleKey(match.role))}
                  style={{width:"100%",backgroundColor:"#5C4033",color:"white",border:"none",padding:"10px",borderRadius:"8px",fontSize:"13px",fontWeight:"600",cursor:"pointer"}}
                >
                  🗺️ Get Roadmap for {match.role}
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "tips" && score && (
          <div style={{backgroundColor:"#FFFDF9",borderRadius:"16px",padding:"24px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
            <h3 style={{fontSize:"16px",fontWeight:"700",color:"#5C4033",marginBottom:"18px"}}>💡 Recommendations</h3>
            <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
              {score.recommendations.map((rec, index) => (
                <div key={index} style={{display:"flex",gap:"12px",alignItems:"flex-start",backgroundColor:"#F5EDE0",padding:"13px 15px",borderRadius:"10px",borderLeft:"3px solid #C89B6D"}}>
                  <span style={{color:"#C89B6D",fontWeight:"700",fontSize:"14px",flexShrink:0}}>→</span>
                  <span style={{color:"#5C4033",fontSize:"13px",lineHeight:"1.6"}}>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => navigate("/dashboard")}
          style={{width:"100%",marginTop:"16px",backgroundColor:"#C89B6D",color:"white",border:"none",padding:"13px",borderRadius:"10px",fontSize:"14px",fontWeight:"700",cursor:"pointer"}}
        >
          Back to Dashboard
        </button>

      </div>
    </Layout>
  )
}

export default Results