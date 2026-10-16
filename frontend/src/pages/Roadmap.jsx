import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import Layout from "../Layout"

function Roadmap() {
  const { id, role } = useParams()
  const navigate = useNavigate()
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [completed, setCompleted] = useState({})
  const [expandedWeek, setExpandedWeek] = useState(null)
  const [streak, setStreak] = useState(0)
  const resumeId = id || localStorage.getItem("resume_id")
  const userId = localStorage.getItem("user_id")

  useEffect(() => {
    const saved = localStorage.getItem("roadmap_progress")
    if (saved) setCompleted(JSON.parse(saved))
    const savedStreak = localStorage.getItem("study_streak")
    if (savedStreak) setStreak(parseInt(savedStreak))

    if (userId) {
      axios.get("http://127.0.0.1:8000/career-profile/" + userId)
        .then(res => {
          if (res.data.roadmap_progress && Object.keys(res.data.roadmap_progress).length > 0) {
            setCompleted(res.data.roadmap_progress)
            localStorage.setItem("roadmap_progress", JSON.stringify(res.data.roadmap_progress))
          }
        })
        .catch(() => {})
    }

    const roleMap = {
      "frontend_developer":"frontend_developer",
      "data_analyst":"data_analyst",
      "ml_engineer":"ml_engineer",
      "backend_developer":"backend_developer",
      "devops_engineer":"devops_engineer",
      "Frontend Developer":"frontend_developer",
      "Data Analyst":"data_analyst",
      "ML Engineer":"ml_engineer",
      "Backend Developer":"backend_developer",
      "DevOps Engineer":"devops_engineer"
    }
    const cleanRole = (role || "frontend_developer").trim()
    const finalRole = roleMap[cleanRole] || "frontend_developer"

    axios.get("http://127.0.0.1:8000/resume/" + resumeId + "/roadmap/" + finalRole)
      .then(res => { setRoadmap(res.data); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [id, role])

  const toggleComplete = (weekNum) => {
    const wasCompleted = completed[weekNum]
    const newCompleted = {...completed, [weekNum]: !wasCompleted}
    setCompleted(newCompleted)
    localStorage.setItem("roadmap_progress", JSON.stringify(newCompleted))

    if (userId) {
      axios.patch("http://127.0.0.1:8000/career-profile/" + userId, {roadmap_progress: newCompleted}).catch(() => {})
    }

    if (!wasCompleted) {
      const today = new Date().toDateString()
      const lastDate = localStorage.getItem("study_last_date")
      if (lastDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString()
        const priorStreak = parseInt(localStorage.getItem("study_streak") || "0")
        const newStreak = lastDate === yesterday ? priorStreak + 1 : 1
        localStorage.setItem("study_last_date", today)
        localStorage.setItem("study_streak", newStreak.toString())
        setStreak(newStreak)
      }
    }
  }

  const completedCount = Object.values(completed).filter(Boolean).length
  const totalWeeks = roadmap?.roadmap?.length || 0
  const progressPercent = totalWeeks > 0 ? Math.round((completedCount / totalWeeks) * 100) : 0

  if (loading) {
    return (
      <Layout>
        <div style={{maxWidth:"800px",margin:"0 auto"}}>
          <div className="skeleton" style={{height:"32px",width:"280px",borderRadius:"8px",marginBottom:"24px"}}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"12px",marginBottom:"20px"}}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{height:"90px",borderRadius:"14px"}}/>)}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{height:"110px",borderRadius:"16px"}}/>)}
          </div>
        </div>
      </Layout>
    )
  }

  if (error || !roadmap) {
    return (
      <Layout>
        <div style={{textAlign:"center",backgroundColor:"#FFFDF9",padding:"48px",borderRadius:"20px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
          <div style={{fontSize:"48px",marginBottom:"12px"}}>😕</div>
          <h3 style={{fontSize:"20px",fontWeight:"700",color:"#5C4033",marginBottom:"10px"}}>Could not load roadmap</h3>
          <button onClick={() => navigate(-1)} style={{backgroundColor:"#5C4033",color:"white",border:"none",padding:"10px 24px",borderRadius:"8px",cursor:"pointer",fontWeight:"600"}}>Go Back</button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{maxWidth:"800px",margin:"0 auto"}}>

        <div style={{marginBottom:"24px"}}>
          <h2 style={{fontSize:"26px",fontWeight:"800",color:"#5C4033",marginBottom:"6px"}}>🗺️ {roadmap.role} Roadmap</h2>
          <p style={{color:"#8D6E63",fontSize:"14px"}}>{roadmap.summary}</p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"12px",marginBottom:"20px"}}>
          {[
            {icon:"📅",label:"Total Weeks",value:roadmap.total_weeks,color:"#F0E4D3"},
            {icon:"✅",label:"Completed",value:completedCount,color:"#DCFCE7"},
            {icon:"🔥",label:"Study Streak",value:streak+" days",color:"#FEF3C7"},
            {icon:"📊",label:"Progress",value:progressPercent+"%",color:"#F5EDE0"}
          ].map((stat,i) => (
            <div key={i} style={{backgroundColor:"#FFFDF9",borderRadius:"14px",padding:"16px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",textAlign:"center"}}>
              <div style={{backgroundColor:stat.color,width:"36px",height:"36px",borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",margin:"0 auto 8px"}}>{stat.icon}</div>
              <p style={{fontSize:"18px",fontWeight:"800",color:"#5C4033",margin:"0 0 2px"}}>{stat.value}</p>
              <p style={{color:"#8D6E63",fontSize:"11px",margin:0}}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div style={{backgroundColor:"#FFFDF9",borderRadius:"16px",padding:"16px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",marginBottom:"20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}>
            <span style={{color:"#5C4033",fontWeight:"600",fontSize:"13px"}}>Overall Progress</span>
            <span style={{color:"#C89B6D",fontWeight:"700",fontSize:"13px"}}>{completedCount}/{totalWeeks} weeks</span>
          </div>
          <div style={{backgroundColor:"#EFE4D3",borderRadius:"8px",height:"12px",overflow:"hidden"}}>
            <div style={{height:"100%",width:progressPercent+"%",background:"linear-gradient(90deg, #5C4033, #C89B6D)",borderRadius:"8px",transition:"width 0.5s"}}/>
          </div>
          {progressPercent === 100 && (
            <p style={{color:"#16A34A",fontWeight:"700",fontSize:"13px",margin:"8px 0 0",textAlign:"center"}}>🎉 Roadmap Complete! You are ready to apply!</p>
          )}
        </div>

        {roadmap.matched_skills.length > 0 && (
          <div style={{backgroundColor:"#FFFDF9",borderRadius:"16px",padding:"20px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",marginBottom:"16px"}}>
            <h3 style={{fontSize:"15px",fontWeight:"700",color:"#16A34A",marginBottom:"12px"}}>✅ Skills You Already Have</h3>
            <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
              {roadmap.matched_skills.map((skill,i) => (
                <span key={i} style={{backgroundColor:"#DCFCE7",color:"#16A34A",padding:"4px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:"600"}}>{skill}</span>
              ))}
            </div>
          </div>
        )}

        {roadmap.roadmap.length > 0 && (
          <div>
            <h3 style={{fontSize:"16px",fontWeight:"700",color:"#5C4033",marginBottom:"14px"}}>📅 Week by Week Plan</h3>
            <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
              {roadmap.roadmap.map((item, index) => (
                <div
                  key={index}
                  className={`card-hover animate-fadeUp stagger-${(index%6)+1}`}
                  style={{
                    backgroundColor:"#FFFDF9",
                    borderRadius:"16px",
                    padding:"20px",
                    boxShadow:"0 2px 12px rgba(92,64,51,0.08)",
                    borderLeft:"4px solid "+(completed[item.week]?"#22C55E":"#C89B6D"),
                    opacity: completed[item.week] ? 0.8 : 1
                  }}
                >
                  <div style={{display:"flex",gap:"14px",alignItems:"flex-start"}}>
                    <div style={{backgroundColor:completed[item.week]?"#DCFCE7":"#F0E4D3",color:completed[item.week]?"#16A34A":"#5C4033",width:"48px",height:"48px",borderRadius:"12px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"800",flexShrink:0,flexDirection:"column",fontSize:"11px"}}>
                      <span style={{fontSize:"9px",opacity:0.7}}>WEEK</span>
                      <span style={{fontSize:"18px",lineHeight:1}}>{item.week}</span>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}}>
                        <h4 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",margin:0,textTransform:"capitalize",textDecoration:completed[item.week]?"line-through":"none"}}>{item.skill}</h4>
                        <span style={{backgroundColor:"#F5EDE0",color:"#5C4033",padding:"3px 10px",borderRadius:"20px",fontSize:"11px",fontWeight:"600"}}>⏱️ {item.duration}</span>
                      </div>
                      <p style={{color:"#8D6E63",fontSize:"12px",marginBottom:"12px",lineHeight:"1.5"}}>{item.task}</p>
                      {(item.book || item.practice) && (
                        <div style={{display:"flex",flexDirection:"column",gap:"4px",marginBottom:"12px"}}>
                          {item.book && <p style={{fontSize:"11px",color:"#6B5B4D",margin:0}}>📖 <strong>Book:</strong> {item.book}</p>}
                          {item.practice && <p style={{fontSize:"11px",color:"#6B5B4D",margin:0}}>💪 <strong>Practice:</strong> {item.practice}</p>}
                        </div>
                      )}
                      <div style={{display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap"}}>
                        <a href={item.link} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:"6px",backgroundColor:"#5C4033",color:"white",padding:"7px 14px",borderRadius:"8px",fontSize:"12px",fontWeight:"600",textDecoration:"none"}}>
                          📚 {item.resource} →
                        </a>
                        <button
                          onClick={() => toggleComplete(item.week)}
                          style={{backgroundColor:completed[item.week]?"#DCFCE7":"#F5EDE0",color:completed[item.week]?"#16A34A":"#5C4033",border:"none",padding:"7px 14px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"12px"}}
                        >
                          {completed[item.week] ? "✅ Completed!" : "Mark Complete"}
                        </button>
                        {item.daily_plan && (
                          <button
                            onClick={() => setExpandedWeek(expandedWeek === item.week ? null : item.week)}
                            style={{background:"none",border:"none",color:"#C89B6D",fontSize:"12px",fontWeight:"700",cursor:"pointer"}}
                          >
                            {expandedWeek === item.week ? "▲ Hide daily plan" : "▼ Break into daily plan"}
                          </button>
                        )}
                      </div>
                      {expandedWeek === item.week && item.daily_plan && (
                        <div className="animate-fadeIn" style={{marginTop:"12px",backgroundColor:"#FDF8F0",borderRadius:"10px",padding:"14px"}}>
                          {item.daily_plan.map((d,i) => (
                            <div key={i} style={{display:"flex",gap:"10px",marginBottom:i<item.daily_plan.length-1?"8px":0}}>
                              <span style={{color:"#5C4033",fontWeight:"700",fontSize:"11px",flexShrink:0,minWidth:"52px"}}>{d.day}</span>
                              <span style={{color:"#6B5B4D",fontSize:"12px"}}>{d.focus}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {roadmap.total_weeks === 0 && (
          <div style={{backgroundColor:"#DCFCE7",borderRadius:"16px",padding:"32px",textAlign:"center"}}>
            <div style={{fontSize:"40px",marginBottom:"12px"}}>🎉</div>
            <h3 style={{fontSize:"18px",fontWeight:"700",color:"#16A34A",marginBottom:"6px"}}>You are Already Ready!</h3>
            <p style={{color:"#5C4A3D",fontSize:"14px"}}>You have all required skills! Start applying now.</p>
            <button onClick={() => navigate("/jobs")} style={{marginTop:"16px",backgroundColor:"#16A34A",color:"white",border:"none",padding:"12px 28px",borderRadius:"10px",fontSize:"14px",fontWeight:"700",cursor:"pointer"}}>Browse Internships →</button>
          </div>
        )}

      </div>
    </Layout>
  )
}

export default Roadmap