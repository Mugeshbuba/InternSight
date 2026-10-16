import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Layout from "../Layout"

const ROLES = {
  frontend_developer: {label:"Frontend Developer", icon:"🎨", desc:"You care how things look and feel. You'd rather turn a design into something people actually click through than argue about server architecture."},
  backend_developer: {label:"Backend Developer", icon:"⚙️", desc:"You like systems that hold up under pressure — the logic behind the scenes matters more to you than the pixels on screen."},
  data_analyst: {label:"Data Analyst", icon:"📊", desc:"You're the one who notices the pattern in the spreadsheet everyone else scrolled past. Numbers telling a story is your kind of puzzle."},
  ml_engineer: {label:"ML Engineer", icon:"🤖", desc:"You're drawn to problems that don't have a fixed answer yet — teaching a system to get better over time genuinely excites you."},
  devops_engineer: {label:"DevOps Engineer", icon:"🔧", desc:"You're the one who wants everything automated, reliable, and never breaking at 2am. Infrastructure is where you find flow."}
}

const QUESTIONS = [
  {
    q: "A project just shipped. What part are you proudest of?",
    options: [
      {text:"The interface — it feels smooth and looks great", weights:{frontend_developer:2}},
      {text:"It never went down, even under heavy load", weights:{devops_engineer:2, backend_developer:1}},
      {text:"The insight we pulled from the data changed the plan", weights:{data_analyst:2}},
      {text:"The model actually got smarter the more it ran", weights:{ml_engineer:2}}
    ]
  },
  {
    q: "Pick a weekend project you'd actually be excited to start.",
    options: [
      {text:"A slick portfolio site with animations", weights:{frontend_developer:2}},
      {text:"An API that a dozen other apps could plug into", weights:{backend_developer:2}},
      {text:"A dashboard that tracks something you're curious about", weights:{data_analyst:2}},
      {text:"A script that auto-deploys itself when you push code", weights:{devops_engineer:2}}
    ]
  },
  {
    q: "In a group project, you naturally end up...",
    options: [
      {text:"Making sure the UI doesn't feel clunky", weights:{frontend_developer:2}},
      {text:"Designing how the pieces talk to each other", weights:{backend_developer:2}},
      {text:"Digging into 'wait, do we actually know that's true?'", weights:{data_analyst:2}},
      {text:"Setting up the environment so nobody's blocked", weights:{devops_engineer:1, backend_developer:1}}
    ]
  },
  {
    q: "Which subject did you actually enjoy in college, not just pass?",
    options: [
      {text:"Design / HCI / anything visual", weights:{frontend_developer:2}},
      {text:"Databases / systems / networking", weights:{backend_developer:2}},
      {text:"Statistics / probability", weights:{data_analyst:2}},
      {text:"AI / machine learning theory", weights:{ml_engineer:2}}
    ]
  },
  {
    q: "What's most satisfying to fix?",
    options: [
      {text:"A layout that finally looks right on every screen size", weights:{frontend_developer:2}},
      {text:"A bug that was silently corrupting data for weeks", weights:{backend_developer:2, data_analyst:1}},
      {text:"A deploy pipeline that kept randomly failing", weights:{devops_engineer:2}},
      {text:"A model that was overfitting and finally generalizes", weights:{ml_engineer:2}}
    ]
  },
  {
    q: "Pick the tool that sounds most fun to get good at.",
    options: [
      {text:"React / Figma / animation libraries", weights:{frontend_developer:2}},
      {text:"Docker / Kubernetes / CI pipelines", weights:{devops_engineer:2}},
      {text:"Pandas / SQL / Power BI", weights:{data_analyst:2}},
      {text:"PyTorch / TensorFlow", weights:{ml_engineer:2}}
    ]
  },
  {
    q: "When something breaks in production, your instinct is to...",
    options: [
      {text:"Check if a recent UI change caused it", weights:{frontend_developer:2}},
      {text:"Check the logs and trace the request path", weights:{backend_developer:2}},
      {text:"Check if the deployment or infra changed", weights:{devops_engineer:2}},
      {text:"Check if the data going in looks off", weights:{data_analyst:1, ml_engineer:1}}
    ]
  }
]

function CareerDiscovery() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [scores, setScores] = useState({})
  const [answered, setAnswered] = useState([])
  const [showResult, setShowResult] = useState(false)
  const [narratives, setNarratives] = useState(null)
  const [narrativeLoading, setNarrativeLoading] = useState(false)
  const [narrativeError, setNarrativeError] = useState(false)

  const resumeId = localStorage.getItem("resume_id")

  const answer = async (option) => {
    const newScores = {...scores}
    Object.entries(option.weights).forEach(([role, pts]) => {
      newScores[role] = (newScores[role] || 0) + pts
    })
    setScores(newScores)
    setAnswered(prev => [...prev, option.text])

    if (step + 1 < QUESTIONS.length) {
      setStep(step + 1)
      return
    }

    localStorage.setItem("career_discovery_scores", JSON.stringify(newScores))
    setShowResult(true)

    if (resumeId) {
      setNarrativeLoading(true)
      setNarrativeError(false)
      try {
        const res = await axios.post(
          "http://127.0.0.1:8000/resume/" + resumeId + "/career-narrative",
          {quiz_scores: newScores}
        )
        setNarratives(res.data.narratives)

        const userId = localStorage.getItem("user_id")
        const topRoleKey = res.data.narratives?.[0]?.role_key
        if (userId && topRoleKey) {
          axios.patch("http://127.0.0.1:8000/career-profile/" + userId, {target_role: topRoleKey}).catch(() => {})
        }
      } catch {
        setNarrativeError(true)
      }
      setNarrativeLoading(false)
    } else {
      const userId = localStorage.getItem("user_id")
      const topRoleKey = Object.entries(newScores).sort((a,b) => b[1]-a[1])[0]?.[0]
      if (userId && topRoleKey) {
        axios.patch("http://127.0.0.1:8000/career-profile/" + userId, {target_role: topRoleKey}).catch(() => {})
      }
    }
  }

  const goBack = () => {
    if (step === 0) return
    setStep(step - 1)
    setAnswered(prev => prev.slice(0, -1))
  }

  const restart = () => {
    setStep(0)
    setScores({})
    setAnswered([])
    setShowResult(false)
    setNarratives(null)
    setNarrativeError(false)
  }

  const rankedRoles = Object.entries(scores).sort((a,b) => b[1] - a[1])
  const maxScore = rankedRoles[0]?.[1] || 1
  const usingNarratives = narratives && narratives.length > 0

  if (showResult) {
    return (
      <Layout>
        <div style={{maxWidth:"700px",margin:"0 auto"}}>

          <div className="animate-fadeUp" style={{textAlign:"center",marginBottom:"28px"}}>
            <p style={{color:"#C89B6D",fontWeight:"700",fontSize:"12px",letterSpacing:"1px",marginBottom:"8px"}}>YOUR RESULTS</p>
            <h2 style={{fontSize:"28px",fontWeight:"800",color:"#5C4033",marginBottom:"8px"}}>
              {usingNarratives ? "Here's what your quiz and resume agree on" : "Here's where your instincts point"}
            </h2>
            <p style={{color:"#8D6E63",fontSize:"14px"}}>
              {usingNarratives ? "Blended from your answers and what's actually on your resume." : "Based on how you answered — not a life sentence, just a starting point."}
            </p>
          </div>

          {narrativeLoading && (
            <div style={{display:"flex",flexDirection:"column",gap:"14px",marginBottom:"20px"}}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{height:"140px",borderRadius:"18px"}}/>)}
            </div>
          )}

          {!resumeId && !narrativeLoading && (
            <div className="animate-fadeUp" style={{backgroundColor:"#F0E4D3",borderRadius:"14px",padding:"14px 18px",marginBottom:"18px",fontSize:"13px",color:"#5C4033"}}>
              💡 This is based on your quiz answers alone. <strong onClick={() => navigate("/upload")} style={{cursor:"pointer",textDecoration:"underline"}}>Upload your resume</strong> for a deeper analysis that also checks which skills you already have.
            </div>
          )}

          {narrativeError && !narrativeLoading && (
            <div className="animate-fadeUp" style={{backgroundColor:"#FEE2E2",borderRadius:"14px",padding:"14px 18px",marginBottom:"18px",fontSize:"13px",color:"#DC2626"}}>
              ⚠️ Couldn't reach the deeper analysis right now — showing quiz-only results below instead.
            </div>
          )}

          {!narrativeLoading && usingNarratives && narratives.map((n, i) => (
            <div
              key={n.role_key}
              className={`card-hover animate-fadeUp stagger-${i+1}`}
              style={{
                backgroundColor:"#FFFDF9",borderRadius:"18px",padding:"22px",marginBottom:"14px",
                boxShadow: i===0 ? "0 4px 20px rgba(92,64,51,0.15)" : "0 2px 12px rgba(92,64,51,0.08)",
                border: i===0 ? "2px solid #C89B6D" : "1px solid #EFE4D3",
                position:"relative"
              }}
            >
              {i === 0 && (
                <div style={{position:"absolute",top:"-12px",left:"20px",backgroundColor:"#C89B6D",color:"white",padding:"3px 14px",borderRadius:"20px",fontSize:"10px",fontWeight:"700",letterSpacing:"0.5px"}}>
                  STRONGEST MATCH
                </div>
              )}
              <div style={{display:"flex",gap:"16px",alignItems:"flex-start"}}>
                <div style={{fontSize:"32px",flexShrink:0}}>{ROLES[n.role_key]?.icon}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px",flexWrap:"wrap",gap:"6px"}}>
                    <h3 style={{fontSize:"17px",fontWeight:"700",color:"#5C4033",margin:0}}>{n.title}</h3>
                    <span style={{color:"#A08D7C",fontSize:"11px",fontWeight:"600"}}>{n.combined_score}% overall match</span>
                  </div>
                  <p style={{color:"#4A3728",fontSize:"13px",lineHeight:"1.7",margin:"0 0 12px"}}>{n.narrative}</p>
                  <div style={{display:"flex",gap:"14px",marginBottom:"12px",fontSize:"11px",color:"#8D6E63"}}>
                    <span>🧭 Quiz fit: <strong style={{color:"#5C4033"}}>{n.quiz_pct}%</strong></span>
                    <span>📄 Resume match: <strong style={{color:"#5C4033"}}>{n.resume_pct}%</strong></span>
                  </div>
                  {n.matched_skills.length > 0 && (
                    <div style={{display:"flex",flexWrap:"wrap",gap:"5px",marginBottom:"12px"}}>
                      {n.matched_skills.map(s => (
                        <span key={s} style={{backgroundColor:"#DCFCE7",color:"#16A34A",padding:"2px 9px",borderRadius:"20px",fontSize:"10px",fontWeight:"600"}}>✓ {s}</span>
                      ))}
                    </div>
                  )}
                  {i === 0 && (
                    <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                      <button
                        onClick={() => navigate("/roadmap/" + resumeId + "/" + n.role_key)}
                        className="btn btn-primary"
                        style={{padding:"9px 18px",fontSize:"12px"}}
                      >
                        See {n.title} Roadmap →
                      </button>
                      <button
                        onClick={() => navigate("/interview/" + resumeId)}
                        className="btn btn-ghost"
                        style={{padding:"9px 18px",fontSize:"12px"}}
                      >
                        Practice Interview Qs
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {!narrativeLoading && !usingNarratives && rankedRoles.slice(0,3).map(([role, score], i) => (
            <div
              key={role}
              className={`card-hover animate-fadeUp stagger-${i+1}`}
              style={{
                backgroundColor:"#FFFDF9",borderRadius:"18px",padding:"22px",marginBottom:"14px",
                boxShadow: i===0 ? "0 4px 20px rgba(92,64,51,0.15)" : "0 2px 12px rgba(92,64,51,0.08)",
                border: i===0 ? "2px solid #C89B6D" : "1px solid #EFE4D3",
                position:"relative"
              }}
            >
              {i === 0 && (
                <div style={{position:"absolute",top:"-12px",left:"20px",backgroundColor:"#C89B6D",color:"white",padding:"3px 14px",borderRadius:"20px",fontSize:"10px",fontWeight:"700",letterSpacing:"0.5px"}}>
                  STRONGEST MATCH
                </div>
              )}
              <div style={{display:"flex",gap:"16px",alignItems:"flex-start"}}>
                <div style={{fontSize:"32px",flexShrink:0}}>{ROLES[role].icon}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px",flexWrap:"wrap",gap:"6px"}}>
                    <h3 style={{fontSize:"17px",fontWeight:"700",color:"#5C4033",margin:0}}>{ROLES[role].label}</h3>
                    <span style={{color:"#A08D7C",fontSize:"11px",fontWeight:"600"}}>{Math.round((score/maxScore)*100)}% match</span>
                  </div>
                  <p style={{color:"#7A6A5D",fontSize:"13px",lineHeight:"1.6",margin:"0 0 12px"}}>{ROLES[role].desc}</p>
                  {i === 0 && (
                    <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                      <button
                        onClick={() => navigate("/roadmap/" + (resumeId || "1") + "/" + role)}
                        className="btn btn-primary"
                        style={{padding:"9px 18px",fontSize:"12px"}}
                      >
                        See {ROLES[role].label} Roadmap →
                      </button>
                      {resumeId && (
                        <button
                          onClick={() => navigate("/interview/" + resumeId)}
                          className="btn btn-ghost"
                          style={{padding:"9px 18px",fontSize:"12px"}}
                        >
                          Practice Interview Qs
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div style={{display:"flex",gap:"10px",marginTop:"20px"}}>
            <button onClick={restart} style={{flex:1,backgroundColor:"#F5EDE0",color:"#5C4033",border:"none",padding:"12px",borderRadius:"10px",fontSize:"13px",fontWeight:"600",cursor:"pointer"}}>
              🔄 Retake Quiz
            </button>
            {!resumeId && (
              <button onClick={() => navigate("/upload")} style={{flex:1,backgroundColor:"#5C4033",color:"white",border:"none",padding:"12px",borderRadius:"10px",fontSize:"13px",fontWeight:"700",cursor:"pointer"}}>
                Upload Resume →
              </button>
            )}
          </div>
        </div>
      </Layout>
    )
  }

  const current = QUESTIONS[step]

  return (
    <Layout>
      <div style={{maxWidth:"640px",margin:"0 auto"}}>

        <div style={{marginBottom:"20px"}}>
          <h2 style={{fontSize:"24px",fontWeight:"800",color:"#5C4033",marginBottom:"6px"}}>🧭 Not sure what role fits you?</h2>
          <p style={{color:"#8D6E63",fontSize:"13px"}}>Answer honestly — there's no wrong answer, just data about you.</p>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"24px"}}>
          <div style={{flex:1,backgroundColor:"#EFE4D3",borderRadius:"8px",height:"8px",overflow:"hidden"}}>
            <div style={{height:"100%",width:((step)/QUESTIONS.length*100)+"%",backgroundColor:"#C89B6D",borderRadius:"8px",transition:"width 0.4s ease"}}/>
          </div>
          <span style={{color:"#A08D7C",fontSize:"12px",fontWeight:"600",flexShrink:0}}>{step+1} / {QUESTIONS.length}</span>
        </div>

        <div key={step} className="animate-fadeUp" style={{backgroundColor:"#FFFDF9",borderRadius:"20px",padding:"28px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
          <h3 style={{fontSize:"17px",fontWeight:"700",color:"#5C4033",marginBottom:"20px",lineHeight:"1.5"}}>{current.q}</h3>
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            {current.options.map((opt, i) => (
              <div
                key={i}
                onClick={() => answer(opt)}
                className="card-clickable"
                style={{padding:"14px 18px",borderRadius:"12px",border:"1.5px solid #EFE4D3",cursor:"pointer",fontSize:"14px",color:"#4A3728",backgroundColor:"#FDF8F0"}}
              >
                {opt.text}
              </div>
            ))}
          </div>
        </div>

        {step > 0 && (
          <button onClick={goBack} style={{marginTop:"16px",background:"none",border:"none",color:"#8D6E63",fontSize:"13px",cursor:"pointer",fontWeight:"600"}}>
            ← Back to previous question
          </button>
        )}
      </div>
    </Layout>
  )
}

export default CareerDiscovery