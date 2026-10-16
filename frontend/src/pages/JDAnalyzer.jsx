import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
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
        <p style={{fontSize:"36px",fontWeight:"900",color,margin:0,lineHeight:1}}>{value}%</p>
      </div>
    </div>
  )
}

function JDAnalyzer() {
  const navigate = useNavigate()
  const [jdText, setJdText] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const resumeId = localStorage.getItem("resume_id")

  const handleAnalyze = async () => {
    if (!jdText.trim()) return
    if (!resumeId) { alert("Please upload your resume first!"); return }
    setLoading(true)
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/resume/" + resumeId + "/analyze-jd",
        { jd_text: jdText }
      )
      setResult(res.data)
    } catch (err) {
      console.error("Failed")
    }
    setLoading(false)
  }

  const getScoreColor = (s) => {
    if (s >= 70) return "#22C55E"
    if (s >= 45) return "#F59E0B"
    return "#EF4444"
  }

  const getConfidenceScore = () => {
    if (!result) return null

    const matchComponent = result.match_score || 0

    const totalSkills = result.matched_skills.length + result.missing_skills.length
    const skillComponent = totalSkills > 0 ? Math.round((result.matched_skills.length / totalSkills) * 100) : 0

    const atsComponent = result.ats_risk === "Low" ? 100 : result.ats_risk === "Medium" ? 60 : 20

    const composite = Math.round(matchComponent * 0.5 + skillComponent * 0.3 + atsComponent * 0.2)

    const label = composite >= 70
      ? "You look well-prepared to apply"
      : composite >= 45
      ? "Worth applying — a few gaps to note"
      : "This role may be a stretch right now"

    return {composite, label, breakdown: [
      {label:"Overall Match", value:matchComponent},
      {label:"Skill Coverage", value:skillComponent},
      {label:"ATS Pass Likelihood", value:atsComponent}
    ]}
  }

  const confidenceScore = getConfidenceScore()

  return (
    <Layout>
      <div style={{maxWidth:"800px",margin:"0 auto"}}>

        <div style={{marginBottom:"24px"}}>
          <h2 style={{fontSize:"26px",fontWeight:"800",color:"#5C4033",marginBottom:"6px"}}>🔍 JD Analyzer</h2>
          <p style={{color:"#8D6E63",fontSize:"14px"}}>Paste any job description and know instantly if you should apply!</p>
        </div>

        <div style={{backgroundColor:"#FFFDF9",borderRadius:"20px",padding:"24px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",marginBottom:"20px"}}>
          <label style={{fontSize:"13px",fontWeight:"700",color:"#5C4033",marginBottom:"10px",display:"block"}}>
            Paste Job Description Here:
          </label>
          <textarea
            value={jdText}
            onChange={e => setJdText(e.target.value)}
            placeholder="Copy and paste the full job description from LinkedIn, Naukri, Internshala..."
            rows={8}
            style={{width:"100%",padding:"14px",borderRadius:"10px",border:"1px solid #E8D9C5",fontSize:"13px",outline:"none",resize:"none",boxSizing:"border-box",fontFamily:"'Segoe UI',sans-serif",marginBottom:"14px",lineHeight:"1.6"}}
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !jdText.trim()}
            style={{width:"100%",backgroundColor:jdText.trim()?"#5C4033":"#ccc",color:"white",border:"none",padding:"13px",borderRadius:"10px",fontSize:"15px",fontWeight:"700",cursor:jdText.trim()?"pointer":"not-allowed"}}
          >
            {loading ? "⏳ Analyzing..." : "🔍 Analyze This Job"}
          </button>
        </div>

        {result && (
          <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>

            <div className="animate-fadeUp" style={{backgroundColor:"#FFFDF9",borderRadius:"20px",padding:"32px",textAlign:"center",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
              <p style={{color:"#8D6E63",fontSize:"13px",marginBottom:"14px"}}>Match Score</p>
              <CircularScore value={result.match_score} color={getScoreColor(result.match_score)}/>
              <div style={{display:"inline-block",backgroundColor:result.verdict_color==="green"?"#DCFCE7":result.verdict_color==="yellow"?"#FEF3C7":"#FEE2E2",color:result.verdict_color==="green"?"#16A34A":result.verdict_color==="yellow"?"#B45309":"#DC2626",padding:"8px 20px",borderRadius:"20px",fontWeight:"700",fontSize:"15px",marginTop:"16px",marginBottom:"10px"}}>
                {result.verdict}
              </div>
              <p style={{color:"#7A6A5D",fontSize:"14px",margin:0}}>{result.advice}</p>
            </div>

            {confidenceScore && (
              <div className="animate-fadeUp stagger-1" style={{backgroundColor:"#FFFDF9",borderRadius:"16px",padding:"20px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px",flexWrap:"wrap",gap:"6px"}}>
                  <h3 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",margin:0}}>📋 Application Confidence</h3>
                  <span style={{fontSize:"20px",fontWeight:"900",color:getScoreColor(confidenceScore.composite)}}>{confidenceScore.composite}%</span>
                </div>
                <p style={{color:"#7A6A5D",fontSize:"13px",marginBottom:"14px"}}>{confidenceScore.label} — based on match, skill coverage and ATS risk for this specific posting.</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"12px"}}>
                  {confidenceScore.breakdown.map((b,i) => (
                    <div key={i}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                        <span style={{fontSize:"10px",color:"#6B5B4D",fontWeight:"600"}}>{b.label}</span>
                        <span style={{fontSize:"10px",fontWeight:"700",color:getScoreColor(b.value)}}>{b.value}%</span>
                      </div>
                      <div style={{backgroundColor:"#EFE4D3",borderRadius:"6px",height:"6px",overflow:"hidden"}}>
                        <div style={{height:"100%",width:b.value+"%",backgroundColor:getScoreColor(b.value),borderRadius:"6px"}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="animate-fadeUp stagger-1" style={{backgroundColor:"#FFFDF9",borderRadius:"16px",padding:"20px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
              <h3 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",marginBottom:"12px"}}>🛠️ Required Technologies</h3>
              <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                {[...result.matched_skills, ...result.missing_skills].map((s,i) => {
                  const isMatched = result.matched_skills.includes(s)
                  return (
                    <span key={i} style={{backgroundColor:isMatched?"#DCFCE7":"#F5EDE0",color:isMatched?"#16A34A":"#6B5B4D",padding:"3px 10px",borderRadius:"20px",fontSize:"12px",fontWeight:"600"}}>
                      {isMatched?"✓ ":""}{s}
                    </span>
                  )
                })}
              </div>
            </div>

            <div className="animate-fadeUp stagger-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
              <div style={{backgroundColor:"#FFFDF9",borderRadius:"16px",padding:"20px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
                <h3 style={{fontSize:"15px",fontWeight:"700",color:"#16A34A",marginBottom:"12px"}}>💪 Strengths</h3>
                {result.strengths.map((s,i) => (
                  <div key={i} style={{display:"flex",gap:"8px",marginBottom:"8px"}}>
                    <span style={{color:"#16A34A",fontWeight:"700",flexShrink:0}}>✓</span>
                    <span style={{color:"#5C4A3D",fontSize:"13px"}}>{s}</span>
                  </div>
                ))}
              </div>
              <div style={{backgroundColor:"#FFFDF9",borderRadius:"16px",padding:"20px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
                <h3 style={{fontSize:"15px",fontWeight:"700",color:"#DC2626",marginBottom:"12px"}}>⚠️ Weaknesses</h3>
                {result.weaknesses.map((w,i) => (
                  <div key={i} style={{display:"flex",gap:"8px",marginBottom:"8px"}}>
                    <span style={{color:"#DC2626",fontWeight:"700",flexShrink:0}}>✗</span>
                    <span style={{color:"#5C4A3D",fontSize:"13px"}}>{w}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{backgroundColor:"#FFFDF9",borderRadius:"16px",padding:"20px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
              <h3 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",marginBottom:"14px"}}>🎯 Skills Analysis</h3>
              {result.matched_skills.length > 0 && (
                <div style={{marginBottom:"12px"}}>
                  <p style={{color:"#8D6E63",fontSize:"12px",marginBottom:"6px"}}>✅ You have:</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                    {result.matched_skills.map((s,i) => (
                      <span key={i} style={{backgroundColor:"#DCFCE7",color:"#16A34A",padding:"3px 10px",borderRadius:"20px",fontSize:"12px",fontWeight:"600"}}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {result.missing_skills.length > 0 && (
                <div>
                  <p style={{color:"#8D6E63",fontSize:"12px",marginBottom:"6px"}}>❌ Missing:</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                    {result.missing_skills.map((s,i) => (
                      <span key={i} style={{backgroundColor:"#FEE2E2",color:"#DC2626",padding:"3px 10px",borderRadius:"20px",fontSize:"12px",fontWeight:"600"}}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
              <div style={{backgroundColor:result.ats_risk==="High"?"#FEE2E2":result.ats_risk==="Medium"?"#FEF3C7":"#DCFCE7",borderRadius:"16px",padding:"20px"}}>
                <h3 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",marginBottom:"6px"}}>⚡ ATS Risk</h3>
                <p style={{fontSize:"20px",fontWeight:"800",color:result.ats_risk==="High"?"#DC2626":result.ats_risk==="Medium"?"#B45309":"#16A34A",margin:"0 0 6px"}}>{result.ats_risk} Risk</p>
                <p style={{color:"#6B5B4D",fontSize:"12px",margin:0}}>
                  {result.ats_risk==="High"?"Add more matching keywords to pass ATS filters":result.ats_risk==="Medium"?"Some ATS risk. Add missing keywords":"Low risk. Should pass most ATS filters."}
                </p>
              </div>
              <div style={{backgroundColor:"#F5EDE0",borderRadius:"16px",padding:"20px"}}>
                <h3 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",marginBottom:"6px"}}>👔 Recruiter Note</h3>
                <p style={{color:"#5C4033",fontSize:"13px",lineHeight:"1.6",margin:0,fontStyle:"italic"}}>"{result.recruiter_note}"</p>
              </div>
            </div>

            <div style={{display:"flex",gap:"10px"}}>
              <button onClick={() => { setResult(null); setJdText("") }} style={{flex:1,backgroundColor:"#FFFDF9",color:"#5C4033",border:"1px solid #5C4033",padding:"12px",borderRadius:"10px",fontSize:"13px",fontWeight:"700",cursor:"pointer"}}>
                Analyze Another
              </button>
              <button onClick={() => navigate("/bullet-improver")} style={{flex:1,backgroundColor:"#5C4033",color:"white",border:"none",padding:"12px",borderRadius:"10px",fontSize:"13px",fontWeight:"700",cursor:"pointer"}}>
                Fix My Resume →
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default JDAnalyzer