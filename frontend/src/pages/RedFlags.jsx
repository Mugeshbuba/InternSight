import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Layout from "../Layout"

function RedFlags() {
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("High")
  const resumeId = localStorage.getItem("resume_id")

  useEffect(() => {
    if (!resumeId) { setLoading(false); return }
    axios.get("http://127.0.0.1:8000/resume/" + resumeId + "/redflags")
      .then(res => { setResult(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const getColor = (s) => {
    if (s === "High") return {bg:"#FEE2E2",color:"#DC2626",badge:"#EF4444"}
    if (s === "Medium") return {bg:"#FEF3C7",color:"#B45309",badge:"#FBBF24"}
    return {bg:"#F0E4D3",color:"#5C4033",badge:"#FCD34D"}
  }

  const filteredFlags = result?.flags?.filter(f => f.severity === activeTab) || []
  const tabs = ["High","Medium","Low"]

  if (loading) {
    return (
      <Layout>
        <div style={{maxWidth:"800px",margin:"0 auto"}}>
          <div className="skeleton" style={{height:"32px",width:"300px",borderRadius:"8px",marginBottom:"24px"}}/>
          <div className="skeleton" style={{height:"180px",borderRadius:"20px",marginBottom:"20px"}}/>
          <div className="skeleton" style={{height:"44px",borderRadius:"12px",marginBottom:"16px"}}/>
          <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{height:"160px",borderRadius:"16px"}}/>)}
          </div>
        </div>
      </Layout>
    )
  }

  if (!resumeId) {
    return (
      <Layout>
        <div style={{textAlign:"center",backgroundColor:"#FFFDF9",padding:"48px",borderRadius:"20px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
          <div style={{fontSize:"48px",marginBottom:"12px"}}>📄</div>
          <h3 style={{fontSize:"20px",fontWeight:"700",color:"#5C4033",marginBottom:"10px"}}>No Resume Found</h3>
          <button onClick={() => navigate("/upload")} style={{backgroundColor:"#5C4033",color:"white",border:"none",padding:"10px 24px",borderRadius:"8px",cursor:"pointer",fontWeight:"600"}}>Upload Resume →</button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{maxWidth:"800px",margin:"0 auto"}}>

        <div style={{marginBottom:"24px"}}>
          <h2 style={{fontSize:"26px",fontWeight:"800",color:"#5C4033",marginBottom:"6px"}}>🚩 Improvement Suggestions</h2>
          <p style={{color:"#8D6E63",fontSize:"14px"}}>Prioritized recommendations with before/after examples</p>
        </div>

        <div className="animate-fadeUp" style={{
          background:result?.resume_health_score >= 70
            ? "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)"
            : result?.resume_health_score >= 40
            ? "linear-gradient(135deg, #B45309 0%, #F59E0B 100%)"
            : "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)",
          borderRadius:"20px",padding:"28px",textAlign:"center",color:"white",marginBottom:"20px"
        }}>
          <p style={{fontSize:"12px",opacity:0.85,marginBottom:"6px"}}>Resume Health Score</p>
          <p style={{fontSize:"56px",fontWeight:"900",margin:"0 0 6px",lineHeight:1}}>{result?.resume_health_score}</p>
          <p style={{fontSize:"15px",fontWeight:"600",margin:"0 0 6px"}}>
            {result?.resume_health_score >= 70 ? "Healthy Resume! 🎉" : result?.resume_health_score >= 40 ? "Needs Improvement ⚠️" : "Critical Issues Found ❌"}
          </p>
          <p style={{opacity:0.85,fontSize:"13px",margin:0}}>{result?.summary}</p>
        </div>

        {result?.total_flags > 0 && (
          <>
            <div style={{display:"flex",backgroundColor:"#FFFDF9",borderRadius:"12px",padding:"5px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",marginBottom:"16px"}}>
              {tabs.map(tab => {
                const count = result?.flags?.filter(f => f.severity === tab).length || 0
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{flex:1,padding:"9px",borderRadius:"8px",border:"none",cursor:"pointer",fontWeight:"600",fontSize:"13px",backgroundColor:activeTab===tab?"#5C4033":"transparent",color:activeTab===tab?"white":"#8D6E63",transition:"all 0.2s"}}
                  >
                    {tab} Priority ({count})
                  </button>
                )
              })}
            </div>

            <div style={{backgroundColor:activeTab==="High"?"#FEE2E2":activeTab==="Medium"?"#FEF3C7":"#F0E4D3",borderRadius:"10px",padding:"12px 16px",marginBottom:"16px"}}>
              <p style={{color:activeTab==="High"?"#DC2626":activeTab==="Medium"?"#B45309":"#5C4033",fontSize:"13px",fontWeight:"500",margin:0}}>
                {activeTab==="High" ? "🔴 High priority items have the most significant impact on recruiter perception and ATS compatibility. Address these first." :
                 activeTab==="Medium" ? "🟡 Medium priority items improve your resume quality and help you stand out from other candidates." :
                 "🔵 Low priority items are nice to have improvements that can give you an extra edge."}
              </p>
            </div>

            {filteredFlags.length === 0 ? (
              <div style={{backgroundColor:"#DCFCE7",borderRadius:"14px",padding:"24px",textAlign:"center"}}>
                <p style={{color:"#16A34A",fontWeight:"700",fontSize:"15px",margin:0}}>🎉 No {activeTab} priority issues found!</p>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
                {filteredFlags.map((flag, index) => {
                  const colors = getColor(flag.severity)
                  return (
                    <div key={index} className={`animate-fadeUp stagger-${(index%6)+1}`} style={{backgroundColor:"#FFFDF9",borderRadius:"16px",padding:"22px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",borderLeft:"4px solid "+colors.badge}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
                        <h4 style={{fontSize:"16px",fontWeight:"700",color:"#5C4033",margin:0}}>⚠️ {flag.type}</h4>
                        <div style={{display:"flex",gap:"6px"}}>
                          <span style={{backgroundColor:colors.bg,color:colors.color,padding:"3px 10px",borderRadius:"20px",fontSize:"11px",fontWeight:"700"}}>{flag.severity} priority</span>
                        </div>
                      </div>
                      <p style={{color:"#7A6A5D",fontSize:"13px",marginBottom:"14px",lineHeight:"1.6"}}>{flag.detail}</p>

                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"14px"}}>
                        <div style={{backgroundColor:"#FEE2E2",borderRadius:"8px",padding:"12px"}}>
                          <p style={{color:"#DC2626",fontSize:"10px",fontWeight:"700",margin:"0 0 6px",textTransform:"uppercase"}}>❌ Before (Wrong)</p>
                          <p style={{color:"#7A6A5D",fontSize:"12px",margin:0,lineHeight:"1.5",fontStyle:"italic"}}>
                            {flag.type === "Vague Language" ? "Responsible for developing the company website and worked on projects." :
                             flag.type === "Missing Metrics" ? "Improved the application performance significantly." :
                             flag.type === "No Projects Found" ? "I have worked on various projects during my studies." :
                             "Missing important information in your resume."}
                          </p>
                        </div>
                        <div style={{backgroundColor:"#DCFCE7",borderRadius:"8px",padding:"12px"}}>
                          <p style={{color:"#16A34A",fontSize:"10px",fontWeight:"700",margin:"0 0 6px",textTransform:"uppercase"}}>✅ After (Correct)</p>
                          <p style={{color:"#5C4A3D",fontSize:"12px",margin:0,lineHeight:"1.5",fontStyle:"italic"}}>
                            {flag.type === "Vague Language" ? "Developed company website using React and Node.js, increasing traffic by 30%." :
                             flag.type === "Missing Metrics" ? "Optimized application performance, reducing load time by 45% for 500+ users." :
                             flag.type === "No Projects Found" ? "Built InternSight: AI resume analyzer using FastAPI, React and PostgreSQL." :
                             flag.fix}
                          </p>
                        </div>
                      </div>

                      <div style={{backgroundColor:"#F5EDE0",borderRadius:"8px",padding:"10px 14px",display:"flex",gap:"10px"}}>
                        <span style={{color:"#C89B6D",fontWeight:"700",flexShrink:0}}>💡 Fix:</span>
                        <span style={{color:"#5C4033",fontSize:"13px"}}>{flag.fix}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {result?.total_flags === 0 && (
          <div style={{backgroundColor:"#DCFCE7",borderRadius:"16px",padding:"32px",textAlign:"center"}}>
            <div style={{fontSize:"40px",marginBottom:"12px"}}>🎉</div>
            <h3 style={{fontSize:"18px",fontWeight:"700",color:"#16A34A",marginBottom:"6px"}}>No Red Flags Found!</h3>
            <p style={{color:"#5C4A3D",fontSize:"14px"}}>Your resume looks clean and professional!</p>
          </div>
        )}

        <div style={{display:"flex",gap:"10px",marginTop:"20px"}}>
          <button onClick={() => navigate("/bullet-improver")} style={{flex:1,backgroundColor:"#5C4033",color:"white",border:"none",padding:"12px",borderRadius:"10px",fontSize:"13px",fontWeight:"700",cursor:"pointer"}}>✏️ Fix Bullets</button>
          <button onClick={() => navigate("/resume-chat")} style={{flex:1,backgroundColor:"#C89B6D",color:"white",border:"none",padding:"12px",borderRadius:"10px",fontSize:"13px",fontWeight:"700",cursor:"pointer"}}>🤖 Ask AI Coach</button>
        </div>
      </div>
    </Layout>
  )
}

export default RedFlags