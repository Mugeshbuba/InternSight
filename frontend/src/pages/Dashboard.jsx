import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Layout from "../Layout"

function AnimatedNumber({ value, duration = 1500 }) {
  const [display, setDisplay] = useState(0)
  const frameRef = useRef(null)

  useEffect(() => {
    const target = parseFloat(value) || 0
    let start = null

    const animate = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * target * 10) / 10)
      if (progress < 1) frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [value])

  return <span>{display}</span>
}

function ProgressBar({ value, color, delay = 0 }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setWidth(value || 0), 400 + delay)
    return () => clearTimeout(t)
  }, [value])

  return (
    <div style={{backgroundColor:"#EFE4D3",borderRadius:"8px",height:"9px",overflow:"hidden"}}>
      <div style={{height:"100%",width:width+"%",backgroundColor:color,borderRadius:"8px",transition:"width 1.2s cubic-bezier(0.4,0,0.2,1)"}}/>
    </div>
  )
}

function CircularScore({ value, size = 96, stroke = 9, color = "#5C4033" }) {
  const [progress, setProgress] = useState(0)
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    const t = setTimeout(() => setProgress(value || 0), 300)
    return () => clearTimeout(t)
  }, [value])

  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={stroke}/>
      <circle
        cx={size/2} cy={size/2} r={radius} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - (progress/100)*circumference}
        style={{transition:"stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)"}}
      />
    </svg>
  )
}

function Dashboard() {
  const navigate = useNavigate()
  const [atsScore, setAtsScore] = useState(null)
  const [redFlags, setRedFlags] = useState(null)
  const [matches, setMatches] = useState(null)
  const [salary, setSalary] = useState(null)
  const [careerProfile, setCareerProfile] = useState(null)
  const [versionCount, setVersionCount] = useState(0)
  const [resumeVersionsList, setResumeVersionsList] = useState([])
  const [interviewHistory, setInterviewHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [hoveredCard, setHoveredCard] = useState(null)
  const [streak, setStreak] = useState(1)
  const resumeId = localStorage.getItem("resume_id")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { navigate("/login"); return }
    if (!resumeId) { navigate("/upload"); return }

    const today = new Date().toDateString()
    const lastLogin = localStorage.getItem("lastLoginDate")
    const currentStreak = parseInt(localStorage.getItem("loginStreak") || "0")
    if (lastLogin !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const newStreak = lastLogin === yesterday.toDateString() ? currentStreak + 1 : 1
      localStorage.setItem("loginStreak", newStreak)
      localStorage.setItem("lastLoginDate", today)
      setStreak(newStreak)
    } else {
      setStreak(currentStreak || 1)
    }

    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      const userId = localStorage.getItem("user_id")
      const calls = [
        axios.get("http://127.0.0.1:8000/resume/" + resumeId + "/score"),
        axios.get("http://127.0.0.1:8000/resume/" + resumeId + "/redflags"),
        axios.get("http://127.0.0.1:8000/resume/" + resumeId + "/match-all"),
        axios.get("http://127.0.0.1:8000/resume/" + resumeId + "/salary")
      ]
      if (userId) {
        calls.push(axios.get("http://127.0.0.1:8000/career-profile/" + userId))
        calls.push(axios.get("http://127.0.0.1:8000/resume/user/" + userId + "/versions"))
        calls.push(axios.get("http://127.0.0.1:8000/interview-history/" + userId))
      }

      const results = await Promise.all(calls.map(p => p.catch(() => null)))
      const [scoreRes, flagsRes, matchRes, salaryRes, profileRes, versionsRes, historyRes] = results

      if (scoreRes) setAtsScore(scoreRes.data)
      if (flagsRes) setRedFlags(flagsRes.data)
      if (matchRes) setMatches(matchRes.data.matches)
      if (salaryRes) setSalary(salaryRes.data)
      if (profileRes) setCareerProfile(profileRes.data)
      if (versionsRes) { setVersionCount(versionsRes.data.length); setResumeVersionsList(versionsRes.data) }
      if (historyRes) setInterviewHistory(historyRes.data)
    } catch (err) {
      console.error("Failed to fetch data")
    }
    setLoading(false)
  }

  const getReadinessScore = () => {
    if (!atsScore) return null

    const atsComponent = atsScore.total_score || 0

    const roadmapEntries = careerProfile?.roadmap_progress ? Object.values(careerProfile.roadmap_progress) : []
    const roadmapComponent = roadmapEntries.length > 0
      ? Math.round((roadmapEntries.filter(Boolean).length / roadmapEntries.length) * 100)
      : 0

    const flagCount = redFlags?.total_flags || 0
    const healthComponent = Math.max(0, 100 - flagCount * 15)

    const profileFields = careerProfile
      ? [careerProfile.target_role, careerProfile.dream_company, careerProfile.work_style, careerProfile.company_type, careerProfile.location_preference]
      : []
    const profileComponent = profileFields.length > 0
      ? Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100)
      : 0

    const composite = Math.round(
      atsComponent * 0.40 + roadmapComponent * 0.25 + healthComponent * 0.20 + profileComponent * 0.15
    )

    return {
      composite,
      breakdown: [
        {label:"ATS Score", value:atsComponent, weight:"40%"},
        {label:"Roadmap Progress", value:roadmapComponent, weight:"25%"},
        {label:"Resume Health", value:healthComponent, weight:"20%"},
        {label:"Career Profile", value:profileComponent, weight:"15%"}
      ]
    }
  }

  const getBadges = () => {
    const roadmapEntries = careerProfile?.roadmap_progress ? Object.values(careerProfile.roadmap_progress) : []
    const roadmapComplete = roadmapEntries.length > 0 && roadmapEntries.every(Boolean)
    const roadmapStarted = roadmapEntries.some(Boolean)

    return [
      {
        icon:"🎯", label:"80+ Club", desc:"Score 80 or above on ATS",
        earned: (atsScore?.total_score || 0) >= 80
      },
      {
        icon:"✨", label:"Clean Resume", desc:"Zero red flags detected",
        earned: (redFlags?.total_flags ?? 1) === 0
      },
      {
        icon:"🧭", label:"Goal Setter", desc:"Set a target role in Career Profile",
        earned: !!careerProfile?.target_role
      },
      {
        icon:"🗺️", label:"Roadmap Starter", desc:"Complete your first roadmap week",
        earned: roadmapStarted
      },
      {
        icon:"🏆", label:"Roadmap Champion", desc:"Complete 100% of your roadmap",
        earned: roadmapComplete
      },
      {
        icon:"📁", label:"Multi-Version", desc:"Maintain 2+ resume versions",
        earned: versionCount >= 2
      },
      {
        icon:"🎓", label:"Fully Profiled", desc:"Fill out dream company, work style and company type",
        earned: !!(careerProfile?.dream_company && careerProfile?.work_style && careerProfile?.company_type)
      }
    ]
  }

  const getScoreColor = (s) => {
    if (!s && s !== 0) return "#8D6E63"
    if (s >= 80) return "#22C55E"
    if (s >= 60) return "#F59E0B"
    if (s >= 40) return "#F97316"
    return "#EF4444"
  }

  if (loading) {
    return (
      <Layout>
        <div style={{maxWidth:"1200px",margin:"0 auto"}}>
          <div className="skeleton" style={{height:"156px",borderRadius:"20px",marginBottom:"24px"}}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"14px",marginBottom:"24px"}}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{height:"110px",borderRadius:"14px"}}/>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"}}>
            <div className="skeleton" style={{height:"220px",borderRadius:"18px"}}/>
            <div className="skeleton" style={{height:"220px",borderRadius:"18px"}}/>
          </div>
        </div>
      </Layout>
    )
  }

  const getSmartInsights = () => {
    const insights = []

    if (redFlags?.total_flags > 0) {
      insights.push({
        icon:"🚩", tone:"warning",
        text: `You have ${redFlags.total_flags} unresolved red flag${redFlags.total_flags>1?"s":""} on your resume.`,
        action:"Fix now", path:"/red-flags"
      })
    }

    if (interviewHistory.length === 0) {
      insights.push({
        icon:"🎤", tone:"neutral",
        text:"You haven't logged a practice interview session yet.",
        action:"Start practicing", path:"/interview/"+resumeId
      })
    } else {
      const lastSession = new Date(interviewHistory[0].created_at)
      const daysSince = Math.floor((Date.now() - lastSession) / 86400000)
      if (daysSince >= 7) {
        insights.push({
          icon:"⏰", tone:"warning",
          text:`It's been ${daysSince} days since your last interview practice.`,
          action:"Practice now", path:"/interview/"+resumeId
        })
      }
    }

    if (!careerProfile?.target_role) {
      insights.push({
        icon:"🧭", tone:"neutral",
        text:"You haven't set a target role yet — this personalizes your whole dashboard.",
        action:"Take the quiz", path:"/career-discovery"
      })
    }

    if (versionCount === 1) {
      insights.push({
        icon:"📁", tone:"tip",
        text:"You're on one resume version — consider a second tailored to a specific role.",
        action:"Create version", path:"/upload"
      })
    }

    if (atsScore?.total_score >= 80 && !interviewHistory.length) {
      insights.push({
        icon:"🎯", tone:"positive",
        text:"Strong ATS score! You're in good shape to start applying.",
        action:"Browse jobs", path:"/jobs"
      })
    }

    return insights.slice(0,3)
  }

  const getActivityTimeline = () => {
    const events = []

    resumeVersionsList.forEach(v => {
      events.push({
        icon:"📁", type:"Resume uploaded",
        text: v.version_label || v.filename.replace(".pdf",""),
        date: v.created_at
      })
    })

    interviewHistory.forEach(s => {
      events.push({
        icon:"🎤", type:"Interview practice",
        text: (s.company || "General practice") + (s.role ? " · "+s.role.replace(/_/g," ") : ""),
        date: s.created_at,
        strongCount: s.strong_count,
        weakCount: s.weak_count,
        minutes: Math.floor(s.elapsed_seconds/60)
      })
    })

    return events.sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0,6)
  }

  const readinessScore = getReadinessScore()
  const badges = getBadges()
  const earnedCount = badges.filter(b => b.earned).length
  const insights = getSmartInsights()
  const activityTimeline = getActivityTimeline()

  return (
    <Layout>
      <div style={{maxWidth:"1200px",margin:"0 auto"}}>

      {/* Hero Banner */}
      <div className="animate-fadeUp" style={{background:"linear-gradient(135deg, #5C4033 0%, #7A5233 60%, #C89B6D 100%)",borderRadius:"20px",padding:"28px 32px",color:"white",marginBottom:"24px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:"-20px",top:"-20px",width:"140px",height:"140px",borderRadius:"50%",backgroundColor:"rgba(255,255,255,0.04)"}}/>
        <div style={{position:"relative",zIndex:1}}>
          <h2 style={{fontSize:"22px",fontWeight:"800",margin:"0 0 4px"}}>Welcome back! 🎯</h2>
          <p style={{opacity:0.8,fontSize:"13px",margin:"0 0 14px"}}>Your complete career intelligence dashboard</p>
          <div style={{display:"flex",gap:"10px",flexWrap:"wrap",marginBottom:"14px"}}>
            <button onClick={() => window.open("http://127.0.0.1:8000/resume/"+resumeId+"/download-original")}
              style={{backgroundColor:"rgba(255,255,255,0.15)",color:"white",border:"1px solid rgba(255,255,255,0.3)",padding:"7px 14px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"12px"}}>
              📥 Download Resume
            </button>
            <button onClick={() => navigate("/upload")}
              style={{backgroundColor:"rgba(255,255,255,0.15)",color:"white",border:"1px solid rgba(255,255,255,0.3)",padding:"7px 14px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"12px"}}>
              + Upload New
            </button>
          </div>
          <div style={{display:"flex",gap:"12px"}}>
            <div style={{backgroundColor:"rgba(255,255,255,0.12)",borderRadius:"10px",padding:"8px 14px",display:"flex",alignItems:"center",gap:"8px"}}>
              <span style={{fontSize:"16px"}}>🔥</span>
              <div>
                <p style={{color:"white",fontWeight:"700",fontSize:"13px",margin:0}}>{streak} Day Streak</p>
                <p style={{color:"rgba(255,255,255,0.6)",fontSize:"10px",margin:0}}>Keep it up!</p>
              </div>
            </div>
            <div style={{backgroundColor:"rgba(255,255,255,0.12)",borderRadius:"10px",padding:"8px 14px",display:"flex",alignItems:"center",gap:"8px"}}>
              <span style={{fontSize:"16px"}}>📅</span>
              <div>
                <p style={{color:"white",fontWeight:"700",fontSize:"13px",margin:0}}>Today</p>
                <p style={{color:"rgba(255,255,255,0.6)",fontSize:"10px",margin:0}}>{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
        <div style={{textAlign:"right",position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"}}>
          <div style={{position:"relative",width:"96px",height:"96px",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{position:"absolute",inset:0}}>
              <CircularScore value={atsScore?.total_score} color="#FFFDF9"/>
            </div>
            <div style={{fontSize:"28px",fontWeight:"900",lineHeight:1,color:"white"}}>
              <AnimatedNumber value={atsScore?.total_score} duration={1500}/>
            </div>
          </div>
          <p style={{opacity:0.8,fontSize:"12px",margin:"4px 0 0"}}>ATS Score · {atsScore?.grade}</p>
        </div>
      </div>

      {/* Smart Insights */}
      {insights.length > 0 && (
        <div className="animate-fadeUp" style={{display:"flex",flexDirection:"column",gap:"10px",marginBottom:"24px"}}>
          {insights.map((ins,i) => (
            <div key={i} style={{
              display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"10px",
              padding:"14px 20px",borderRadius:"14px",
              backgroundColor: ins.tone==="warning"?"#FEF3C7":ins.tone==="positive"?"#DCFCE7":ins.tone==="tip"?"#F0E4D3":"#FFFDF9",
              boxShadow:"0 2px 12px rgba(92,64,51,0.06)"
            }}>
              <p style={{margin:0,fontSize:"13px",color:"#4A3728",fontWeight:"600"}}>
                <span style={{marginRight:"8px"}}>{ins.icon}</span>{ins.text}
              </p>
              <button onClick={() => navigate(ins.path)} style={{backgroundColor:"#5C4033",color:"white",border:"none",padding:"6px 16px",borderRadius:"8px",fontSize:"11px",fontWeight:"700",cursor:"pointer",flexShrink:0}}>
                {ins.action} →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Career Readiness Score */}
      {readinessScore && (
        <div className="animate-fadeUp" style={{backgroundColor:"#FFFDF9",borderRadius:"18px",padding:"22px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",marginBottom:"24px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",flexWrap:"wrap",gap:"8px"}}>
            <div>
              <h3 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",margin:"0 0 2px"}}>🎯 Career Readiness Score</h3>
              <p style={{color:"#8D6E63",fontSize:"12px",margin:0}}>How ready you are to apply, based on everything InternSight knows about you</p>
            </div>
            <div style={{textAlign:"center"}}>
              <p style={{fontSize:"32px",fontWeight:"900",color:getScoreColor(readinessScore.composite),margin:0,lineHeight:1}}>
                {readinessScore.composite}
              </p>
              <p style={{color:"#A08D7C",fontSize:"10px",margin:0}}>/ 100</p>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"12px"}}>
            {readinessScore.breakdown.map((b,i) => (
              <div key={i}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                  <span style={{fontSize:"10px",color:"#6B5B4D",fontWeight:"600"}}>{b.label}</span>
                  <span style={{fontSize:"10px",color:"#A08D7C"}}>{b.weight}</span>
                </div>
                <div style={{backgroundColor:"#EFE4D3",borderRadius:"6px",height:"6px",overflow:"hidden",marginBottom:"3px"}}>
                  <div style={{height:"100%",width:b.value+"%",backgroundColor:getScoreColor(b.value),borderRadius:"6px",transition:"width 1s ease"}}/>
                </div>
                <span style={{fontSize:"10px",fontWeight:"700",color:getScoreColor(b.value)}}>{b.value}%</span>
              </div>
            ))}
          </div>
          {readinessScore.breakdown.some(b => b.value < 50) && (
            <p style={{color:"#B45309",fontSize:"11px",marginTop:"14px",backgroundColor:"#FEF3C7",padding:"8px 12px",borderRadius:"8px"}}>
              💡 Your weakest area is <strong>{[...readinessScore.breakdown].sort((a,b)=>a.value-b.value)[0].label}</strong> — focus there for the biggest readiness boost.
            </p>
          )}
        </div>
      )}

      {/* Achievement Badges */}
      <div className="animate-fadeUp" style={{backgroundColor:"#FFFDF9",borderRadius:"18px",padding:"22px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",marginBottom:"24px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
          <h3 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",margin:0}}>🏅 Achievements</h3>
          <span style={{color:"#A08D7C",fontSize:"12px",fontWeight:"600"}}>{earnedCount}/{badges.length} earned</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(130px, 1fr))",gap:"12px"}}>
          {badges.map((b,i) => (
            <div key={i} title={b.desc} style={{
              textAlign:"center",padding:"14px 8px",borderRadius:"12px",
              backgroundColor: b.earned ? "#F0E4D3" : "#FDF8F0",
              opacity: b.earned ? 1 : 0.5,
              border: b.earned ? "1px solid #C89B6D" : "1px solid #EFE4D3"
            }}>
              <div style={{fontSize:"26px",marginBottom:"6px",filter: b.earned ? "none" : "grayscale(1)"}}>{b.icon}</div>
              <p style={{fontSize:"11px",fontWeight:"700",color: b.earned ? "#5C4033" : "#A08D7C",margin:0}}>{b.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {activityTimeline.length > 0 && (
        <div className="animate-fadeUp" style={{backgroundColor:"#FFFDF9",borderRadius:"18px",padding:"22px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",marginBottom:"24px"}}>
          <h3 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",marginBottom:"16px"}}>🕐 Recent Activity</h3>
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            {activityTimeline.map((e,i) => (
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",backgroundColor:"#FDF8F0",borderRadius:"10px",padding:"10px 16px",flexWrap:"wrap",gap:"8px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                  <span style={{fontSize:"18px"}}>{e.icon}</span>
                  <div>
                    <p style={{fontSize:"13px",fontWeight:"700",color:"#5C4033",margin:0}}>{e.type}: {e.text}</p>
                    <p style={{fontSize:"11px",color:"#A08D7C",margin:0}}>
                      {new Date(e.date).toLocaleDateString(undefined,{day:"numeric",month:"short"})}
                      {e.minutes !== undefined ? " · "+e.minutes+"m practiced" : ""}
                    </p>
                  </div>
                </div>
                {e.strongCount !== undefined && (
                  <div style={{display:"flex",gap:"6px"}}>
                    {e.strongCount > 0 && <span style={{backgroundColor:"#DCFCE7",color:"#16A34A",padding:"2px 9px",borderRadius:"20px",fontSize:"10px",fontWeight:"700"}}>{e.strongCount} Strong</span>}
                    {e.weakCount > 0 && <span style={{backgroundColor:"#FEE2E2",color:"#DC2626",padding:"2px 9px",borderRadius:"20px",fontSize:"10px",fontWeight:"700"}}>{e.weakCount} Weak</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="animate-fadeUp stagger-1" style={{display:"flex",gap:"12px",marginBottom:"24px",flexWrap:"wrap"}}>
        {[
          {icon:"📄",label:"Upload Resume",path:"/upload"},
          {icon:"💼",label:"Browse Jobs",path:"/jobs"},
          {icon:"🎤",label:"Interview Prep",path:"/interview/"+resumeId},
          {icon:"📝",label:"Cover Letter",path:"/cover-letter"},
          {icon:"🗺️",label:"Roadmap",path:"/roadmap/"+resumeId+"/frontend_developer"}
        ].map((qa,i) => (
          <div
            key={i}
            onClick={() => navigate(qa.path)}
            className="card-clickable"
            style={{backgroundColor:"#FFFDF9",borderRadius:"12px",padding:"10px 16px",display:"flex",alignItems:"center",gap:"8px",boxShadow:"0 2px 10px rgba(92,64,51,0.06)",border:"1px solid #EFE4D3"}}
          >
            <span style={{fontSize:"16px"}}>{qa.icon}</span>
            <span style={{color:"#5C4033",fontSize:"12px",fontWeight:"600"}}>{qa.label}</span>
          </div>
        ))}
      </div>

      {/* Stats Row */}
      <div className="animate-fadeUp stagger-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"14px",marginBottom:"24px"}}>
        {[
          {label:"ATS Score",value:atsScore?.total_score,sub:atsScore?.grade,color:"#F0E4D3",icon:"📊",path:"/results/"+resumeId,
           popup:atsScore?Object.entries(atsScore.breakdown).map(([k,v])=>k+": "+v.score+"/100"):[]},
          {label:"Resume Health",value:redFlags?.resume_health_score,sub:(redFlags?.total_flags||0)+" issues",color:"#DCFCE7",icon:"🏥",path:"/red-flags",
           popup:redFlags?.flags?.slice(0,3).map(f=>f.type)||[]},
          {label:"Best Match",value:(matches?.[0]?.match_score||0)+"%",sub:matches?.[0]?.role||"",color:"#FEF3C7",icon:"💼",path:"/jobs",
           popup:matches?.slice(0,3).map(m=>m.role+": "+m.match_score+"%")||[]},
          {label:"Salary Range",value:salary?"₹"+salary.min_salary+"-"+salary.max_salary:"N/A",sub:(salary?.level||"")+" Level",color:"#F5EDE0",icon:"💰",path:"/salary",
           popup:salary?["Level: "+salary.level,"Top "+salary.market_percentile+"%","Boost: +"+salary.salary_boost_if_learned]:[]}
        ].map((stat,i) => (
          <div key={i} style={{position:"relative"}} onMouseEnter={() => setHoveredCard(i)} onMouseLeave={() => setHoveredCard(null)}>
            <div onClick={() => navigate(stat.path)} style={{backgroundColor:"#FFFDF9",borderRadius:"14px",padding:"18px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",cursor:"pointer",transition:"transform 0.2s",transform:hoveredCard===i?"translateY(-3px)":"translateY(0)"}}>
              <div style={{backgroundColor:stat.color,width:"38px",height:"38px",borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",marginBottom:"12px"}}>{stat.icon}</div>
              <p style={{color:"#8D6E63",fontSize:"11px",margin:"0 0 4px"}}>{stat.label}</p>
              <p style={{fontSize:"20px",fontWeight:"800",color:"#5C4033",margin:"0 0 2px"}}>
                {i===0 ? <AnimatedNumber value={stat.value} duration={1200}/> : stat.value}
              </p>
              <p style={{color:"#B3A292",fontSize:"11px",margin:0}}>{stat.sub}</p>
            </div>
            {hoveredCard===i && stat.popup.length>0 && (
              <div style={{position:"absolute",top:"105%",left:0,right:0,backgroundColor:"#FFFDF9",borderRadius:"12px",padding:"14px",boxShadow:"0 12px 40px rgba(92,64,51,0.16)",zIndex:200,border:"1px solid #EFE4D3"}}>
                {stat.popup.map((item,j) => (
                  <p key={j} style={{color:"#6B5B4D",fontSize:"12px",margin:"0 0 6px",paddingBottom:"6px",borderBottom:j<stat.popup.length-1?"1px solid #f5f5f5":"none"}}>→ {item}</p>
                ))}
                <button onClick={() => navigate(stat.path)} style={{width:"100%",backgroundColor:"#5C4033",color:"white",border:"none",padding:"7px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"12px",marginTop:"8px"}}>
                  See More →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Score Breakdown + Red Flags */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px",marginBottom:"24px"}}>

        <div style={{backgroundColor:"#FFFDF9",borderRadius:"18px",padding:"22px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px"}}>
            <h3 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",margin:0}}>📊 ATS Score Breakdown</h3>
            <button onClick={() => navigate("/results/"+resumeId)} style={{color:"#C89B6D",background:"none",border:"none",cursor:"pointer",fontSize:"12px",fontWeight:"600"}}>See More →</button>
          </div>
          {atsScore && Object.entries(atsScore.breakdown).map(([key,value],i) => (
            <div key={key} style={{marginBottom:"14px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
                <span style={{color:"#6B5B4D",fontSize:"12px",fontWeight:"600",textTransform:"capitalize"}}>{key}</span>
                <span style={{color:getScoreColor(value.score),fontSize:"12px",fontWeight:"700"}}>
                  <AnimatedNumber value={value.score} duration={1000+i*200}/>/100
                </span>
              </div>
              <ProgressBar value={value.score} color={getScoreColor(value.score)} delay={i*150}/>
              <p style={{color:"#bbb",fontSize:"11px",marginTop:"3px"}}>{value.reason}</p>
            </div>
          ))}
        </div>

        <div style={{backgroundColor:"#FFFDF9",borderRadius:"18px",padding:"22px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px"}}>
            <h3 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",margin:0}}>🚩 Resume Issues</h3>
            <button onClick={() => navigate("/red-flags")} style={{color:"#C89B6D",background:"none",border:"none",cursor:"pointer",fontSize:"12px",fontWeight:"600"}}>See All →</button>
          </div>
          {redFlags?.total_flags === 0 ? (
            <div style={{textAlign:"center",padding:"20px 0"}}>
              <div style={{fontSize:"36px",marginBottom:"10px"}}>🎉</div>
              <p style={{color:"#16A34A",fontWeight:"700",fontSize:"15px",margin:"0 0 4px"}}>No issues found!</p>
              <p style={{color:"#8D6E63",fontSize:"12px",margin:0}}>Your resume looks great!</p>
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {redFlags?.flags?.slice(0,4).map((flag,i) => (
                <div key={i} style={{backgroundColor:flag.severity==="High"?"#FEE2E2":flag.severity==="Medium"?"#FEF3C7":"#F0E4D3",borderRadius:"8px",padding:"9px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{color:"#4A3728",fontSize:"12px",fontWeight:"600"}}>{flag.type}</span>
                  <span style={{color:flag.severity==="High"?"#DC2626":flag.severity==="Medium"?"#B45309":"#5C4033",fontSize:"10px",fontWeight:"700",backgroundColor:"#FFFDF9",padding:"2px 7px",borderRadius:"10px"}}>{flag.severity}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Job Matches */}
      <div style={{backgroundColor:"#FFFDF9",borderRadius:"18px",padding:"22px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",marginBottom:"24px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
          <h3 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",margin:0}}>💼 Job Role Matches</h3>
          <button onClick={() => navigate("/jobs")} style={{color:"#C89B6D",background:"none",border:"none",cursor:"pointer",fontSize:"12px",fontWeight:"600"}}>Browse All →</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",gap:"10px"}}>
          {matches?.map((match,i) => (
            <div key={i} onClick={() => navigate("/results/"+resumeId)} style={{backgroundColor:match.match_score>=70?"#DCFCE7":match.match_score>=40?"#FEF3C7":"#FEE2E2",borderRadius:"12px",padding:"14px",textAlign:"center",cursor:"pointer",transition:"transform 0.2s"}}
              onMouseEnter={e => e.currentTarget.style.transform="translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform="translateY(0)"}>
              <p style={{fontSize:"22px",fontWeight:"900",color:getScoreColor(match.match_score),margin:"0 0 3px"}}>
                <AnimatedNumber value={match.match_score} duration={1000+i*100}/>%
              </p>
              <p style={{color:"#4A3728",fontSize:"11px",fontWeight:"600",margin:"0 0 3px"}}>{match.role}</p>
              <p style={{color:match.match_score>=70?"#16A34A":match.match_score>=40?"#B45309":"#DC2626",fontSize:"10px",fontWeight:"700",margin:0}}>
                {match.match_score>=70?"✅ Apply!":match.match_score>=40?"⚠️ Almost":"❌ Not Yet"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div style={{backgroundColor:"#FFFDF9",borderRadius:"18px",padding:"22px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
        <h3 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",marginBottom:"14px"}}>💡 Top Recommendations</h3>
        <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
          {atsScore?.recommendations?.map((rec,i) => (
            <div key={i} style={{display:"flex",gap:"12px",alignItems:"flex-start",backgroundColor:"#F5EDE0",padding:"12px 14px",borderRadius:"10px",borderLeft:"3px solid #C89B6D"}}>
              <span style={{color:"#C89B6D",fontWeight:"700",flexShrink:0}}>→</span>
              <span style={{color:"#5C4033",fontSize:"13px",lineHeight:"1.6"}}>{rec}</span>
            </div>
          ))}
        </div>
      </div>

      </div>
    </Layout>
  )
}

export default Dashboard
