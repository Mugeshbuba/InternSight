import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Layout from "../Layout"

function Salary() {
  const navigate = useNavigate()
  const [salary, setSalary] = useState(null)
  const [benchmark, setBenchmark] = useState(null)
  const [predictor, setPredictor] = useState(null)
  const [loading, setLoading] = useState(true)
  const resumeId = localStorage.getItem("resume_id")

  useEffect(() => {
    if (!resumeId) { setLoading(false); return }
    Promise.all([
      axios.get("http://127.0.0.1:8000/resume/" + resumeId + "/salary"),
      axios.get("http://127.0.0.1:8000/resume/" + resumeId + "/benchmark/data_analyst"),
      axios.get("http://127.0.0.1:8000/resume/" + resumeId + "/score-predictor")
    ]).then(([sRes, bRes, pRes]) => {
      setSalary(sRes.data)
      setBenchmark(bRes.data)
      setPredictor(pRes.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const getScoreColor = (s) => {
    if (s >= 80) return "#22C55E"
    if (s >= 60) return "#F59E0B"
    if (s >= 40) return "#F97316"
    return "#EF4444"
  }

  if (loading) {
    return (
      <Layout>
        <div style={{maxWidth:"900px",margin:"0 auto"}}>
          <div className="skeleton" style={{height:"32px",width:"260px",borderRadius:"8px",marginBottom:"24px"}}/>
          <div className="skeleton" style={{height:"200px",borderRadius:"20px",marginBottom:"20px"}}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
            <div className="skeleton" style={{height:"220px",borderRadius:"16px"}}/>
            <div className="skeleton" style={{height:"220px",borderRadius:"16px"}}/>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{maxWidth:"900px",margin:"0 auto"}}>

        <div style={{marginBottom:"24px"}}>
          <h2 style={{fontSize:"26px",fontWeight:"800",color:"#5C4033",marginBottom:"6px"}}>💰 Salary Intelligence</h2>
          <p style={{color:"#8D6E63",fontSize:"14px"}}>Your market value based on current skills</p>
        </div>

        {salary && (
          <div className="animate-fadeUp" style={{background:"linear-gradient(135deg, #5C4033 0%, #C89B6D 100%)",borderRadius:"20px",padding:"32px",color:"white",textAlign:"center",marginBottom:"20px"}}>
            <p style={{opacity:0.85,fontSize:"14px",marginBottom:"8px"}}>Your Estimated Salary Range</p>
            <p style={{fontSize:"48px",fontWeight:"900",margin:"0 0 6px"}}>Rs.{salary.min_salary} - Rs.{salary.max_salary} LPA</p>
            <div style={{display:"inline-block",backgroundColor:"rgba(255,255,255,0.2)",padding:"5px 18px",borderRadius:"20px",marginBottom:"12px"}}>
              <span style={{fontWeight:"700",fontSize:"13px"}}>{salary.level} Level</span>
            </div>
            <p style={{opacity:0.85,fontSize:"14px",margin:0}}>{salary.message}</p>
            {salary.top_skill_to_learn && (
              <div style={{marginTop:"16px",backgroundColor:"rgba(255,255,255,0.15)",borderRadius:"10px",padding:"12px"}}>
                <p style={{fontWeight:"700",margin:"0 0 2px",fontSize:"13px"}}>🚀 Learn {salary.top_skill_to_learn} → {salary.salary_boost_if_learned} boost!</p>
                <p style={{opacity:0.8,fontSize:"11px",margin:0}}>Single skill with biggest pay increase</p>
              </div>
            )}
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"20px"}}>

          {salary && (
            <div className="animate-fadeUp stagger-1" style={{backgroundColor:"#FFFDF9",borderRadius:"16px",padding:"22px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
              <h3 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",marginBottom:"16px"}}>💎 High Value Skills</h3>
              {salary.high_value_skills_found.length > 0 ? (
                <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"14px"}}>
                  {salary.high_value_skills_found.map((s,i) => (
                    <span key={i} style={{backgroundColor:"#DCFCE7",color:"#16A34A",padding:"4px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:"600"}}>{s}</span>
                  ))}
                </div>
              ) : (
                <p style={{color:"#8D6E63",fontSize:"13px",marginBottom:"14px"}}>No high-value skills detected yet</p>
              )}
              <h4 style={{color:"#DC2626",fontWeight:"700",fontSize:"13px",marginBottom:"10px"}}>🎯 Add for Higher Pay:</h4>
              <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                {salary.skills_to_add_for_higher_pay.map((s,i) => (
                  <span key={i} style={{backgroundColor:"#FEE2E2",color:"#DC2626",padding:"4px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:"600"}}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {benchmark && (
            <div className="animate-fadeUp stagger-2" style={{backgroundColor:"#FFFDF9",borderRadius:"16px",padding:"22px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
              <h3 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",marginBottom:"16px"}}>👥 Peer Benchmarking</h3>
              <div style={{textAlign:"center",marginBottom:"16px"}}>
                <p style={{fontSize:"44px",fontWeight:"900",color:"#5C4033",margin:"0 0 4px"}}>{benchmark.percentile}%</p>
                <p style={{color:"#8D6E63",fontSize:"12px",margin:0}}>Better than {benchmark.percentile}% of applicants</p>
              </div>
              <div style={{backgroundColor:benchmark.percentile>=75?"#DCFCE7":benchmark.percentile>=50?"#FEF3C7":"#FEE2E2",borderRadius:"8px",padding:"10px 14px",marginBottom:"10px"}}>
                <p style={{color:benchmark.percentile>=75?"#16A34A":benchmark.percentile>=50?"#B45309":"#DC2626",fontWeight:"700",fontSize:"13px",margin:"0 0 2px"}}>{benchmark.standing}</p>
                <p style={{color:"#6B5B4D",fontSize:"12px",margin:0}}>{benchmark.message}</p>
              </div>
              <p style={{color:"#8D6E63",fontSize:"12px",margin:0}}>💡 {benchmark.tip}</p>
            </div>
          )}
        </div>

        {predictor && predictor.suggestions.length > 0 && (
          <div style={{backgroundColor:"#FFFDF9",borderRadius:"16px",padding:"22px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
            <h3 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",marginBottom:"6px"}}>📈 Score Predictor</h3>
            <p style={{color:"#8D6E63",fontSize:"12px",marginBottom:"16px"}}>These changes boost your ATS score the most!</p>
            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              {predictor.suggestions.map((s,i) => (
                <div key={i} className="card-hover" style={{display:"flex",alignItems:"center",gap:"14px",backgroundColor:"#FDF8F0",borderRadius:"10px",padding:"13px 16px",border:"1px solid #EFE4D3"}}>
                  <div style={{width:"36px",height:"36px",backgroundColor:s.impact==="High"?"#DCFCE7":s.impact==="Medium"?"#FEF3C7":"#F5EDE0",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:"16px"}}>
                    {s.impact==="High"?"🚀":s.impact==="Medium"?"⚡":"💡"}
                  </div>
                  <div style={{flex:1}}>
                    <p style={{color:"#5C4033",fontWeight:"600",fontSize:"13px",margin:"0 0 2px"}}>{s.action}</p>
                    <p style={{color:"#8D6E63",fontSize:"11px",margin:0}}>{s.current_score} → {s.new_score} points</p>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <p style={{color:"#16A34A",fontWeight:"800",fontSize:"16px",margin:"0 0 2px"}}>+{s.improvement}</p>
                    <p style={{color:"#8D6E63",fontSize:"10px",margin:0}}>{s.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Salary