import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Layout from "../Layout"

function ResumeChat() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [resumeData, setResumeData] = useState(null)
  const [atsScore, setAtsScore] = useState(null)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [typingIndex, setTypingIndex] = useState(null)
  const [typedText, setTypedText] = useState("")
  const bottomRef = useRef(null)
  const typingRef = useRef(null)
  const resumeId = localStorage.getItem("resume_id")
  const historyKey = "chatHistory_" + resumeId

  useEffect(() => {
    if (!resumeId) { setInitializing(false); return }

    const saved = localStorage.getItem(historyKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed)
      } catch { /* ignore corrupt cache, fall through to fresh welcome */ }
    }

    Promise.all([
      axios.get("http://127.0.0.1:8000/resume/" + resumeId),
      axios.get("http://127.0.0.1:8000/resume/" + resumeId + "/score"),
      axios.get("http://127.0.0.1:8000/resume/" + resumeId + "/redflags")
    ]).then(([rRes, sRes, fRes]) => {
      setResumeData(rRes.data)
      setAtsScore(sRes.data)
      if (!saved) {
        const welcome = {
          role: "bot",
          text: "Hi! I am your AI Resume Coach 🤖\n\nI have analyzed your resume and found:\n• ATS Score: " + sRes.data.total_score + " (" + sRes.data.grade + ")\n• " + fRes.data.total_flags + " issues detected\n\nHow can I help you today? You can ask me:\n• 'How can I improve my skills section?'\n• 'What jobs am I best suited for?'\n• 'Rewrite my experience section'\n• 'What are my weaknesses?'\n• 'How to increase my ATS score?'"
        }
        setMessages([welcome])
      }
    }).catch(() => {
      if (!saved) setMessages([{role:"bot", text:"Hi! I am your AI Resume Coach 🤖\n\nPlease upload your resume first to get personalized advice!\n\nType 'help' to see what I can do."}])
    }).finally(() => setInitializing(false))
  }, [])

  useEffect(() => {
    if (resumeId && messages.length > 0) localStorage.setItem(historyKey, JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({behavior:"smooth"})
  }, [messages, typedText])

  const getAIResponse = (userMsg) => {
    const msg = userMsg.toLowerCase()
    const score = atsScore?.total_score || 0
    const breakdown = atsScore?.breakdown || {}
    const recs = atsScore?.recommendations || []

    if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
      return "Hello! I am here to help you improve your resume and get placed faster! 😊\n\nWhat would you like to work on today?"
    }

    if (msg.includes("score") || msg.includes("ats")) {
      return "Your current ATS Score is " + score + "/100 (" + (atsScore?.grade || "N/A") + ")\n\n" +
        "Breakdown:\n" +
        "• Skills: " + (breakdown.skills?.score || 0) + "/100\n" +
        "• Education: " + (breakdown.education?.score || 0) + "/100\n" +
        "• Experience: " + (breakdown.experience?.score || 0) + "/100\n" +
        "• Keywords: " + (breakdown.keywords?.score || 0) + "/100\n\n" +
        (score < 60 ? "Your score needs improvement. Let me help you!" : "Good score! Let's make it even better!")
    }

    if (msg.includes("skill")) {
      const skillScore = breakdown.skills?.score || 0
      return "Your Skills Score: " + skillScore + "/100\n\n" +
        (skillScore < 50 ?
          "Your skills section needs work! Here is what to add:\n\n• Python, SQL, Git (must have for most roles)\n• React or Node.js (for web development)\n• Docker, AWS (for cloud/devops)\n• Pandas, NumPy (for data roles)\n\nTip: Create a dedicated 'Technical Skills' section and list skills in categories like Programming, Frameworks, Tools, Databases." :
          "Your skills section is decent! To improve further:\n\n• Add proficiency levels (Expert/Intermediate/Beginner)\n• Group skills by category\n• Add any certifications related to your skills\n• Include tools you use daily at work/projects")
    }

    if (msg.includes("experience") || msg.includes("internship") || msg.includes("work")) {
      const expScore = breakdown.experience?.score || 0
      return "Your Experience Score: " + expScore + "/100\n\n" +
        "To improve your experience section:\n\n" +
        "❌ Weak: 'Responsible for developing website'\n" +
        "✅ Strong: 'Developed responsive React website that increased user engagement by 40%'\n\n" +
        "**Key rules:**\n" +
        "• Start every bullet with **action verb** (Developed, Built, Led)\n" +
        "• Add **numbers and metrics** (%, users, time saved)\n" +
        "• Mention specific technologies used\n" +
        "• Show impact, not just tasks\n\n" +
        "Would you like me to help rewrite any specific bullet point?"
    }

    if (msg.includes("weak") || msg.includes("problem") || msg.includes("issue") || msg.includes("improve")) {
      const recText = recs.length > 0 ? recs.map((r,i) => (i+1)+". "+r).join("\n") : "No specific issues found - great job!"
      return "Here are your top improvement areas:\n\n" + recText + "\n\nWhich one would you like to tackle first?"
    }

    if (msg.includes("job") || msg.includes("apply") || msg.includes("suitable")) {
      return "Based on your resume analysis, here are the best roles for you:\n\n" +
        "Check the 💼 Browse Jobs section in the sidebar to see your exact match % for each internship!\n\n" +
        "Quick tip: Apply for jobs where you have 70%+ match score. For jobs with 40-70% match, use the Roadmap feature to fill your skill gaps first."
    }

    if (msg.includes("roadmap") || msg.includes("learn") || msg.includes("study")) {
      return "Your personalized learning roadmap is available in the 🗺️ Roadmap section!\n\n" +
        "It will show you:\n" +
        "• Which skills you are missing\n" +
        "• Week by week study plan\n" +
        "• Free resources for each skill\n" +
        "• How to track your progress\n\n" +
        "Go to Results page → Job Match tab → Click 'Get Roadmap' for your target role!"
    }

    if (msg.includes("keyword") || msg.includes("ats") || msg.includes("filter")) {
      return "To improve your keyword score:\n\n" +
        "Must-have keywords:\n" +
        "• GitHub or LinkedIn profile link\n" +
        "• Certification names\n" +
        "• Hackathon or competition mentions\n" +
        "• Open source contributions\n" +
        "• Leadership or team project mentions\n\n" +
        "Also match keywords from the job description! Use our JD Analyzer to find exact missing keywords."
    }

    if (msg.includes("education") || msg.includes("degree") || msg.includes("college")) {
      const eduScore = breakdown.education?.score || 0
      return "Your Education Score: " + eduScore + "/100\n\n" +
        "To improve:\n" +
        "• Add your CGPA or percentage clearly\n" +
        "• Mention relevant coursework\n" +
        "• Add academic achievements or rankings\n" +
        "• Include certifications under education\n" +
        "• List college clubs or student activities\n\n" +
        "Format: Degree Name | College Name | Year | CGPA"
    }

    if (msg.includes("project")) {
      return "To improve your projects section:\n\n" +
        "Each project should have:\n" +
        "1. Project Name (clear and descriptive)\n" +
        "2. Technologies Used: React, Python, MongoDB etc.\n" +
        "3. What you built (1 line)\n" +
        "4. Impact or results (users, performance, metrics)\n" +
        "5. GitHub link\n\n" +
        "Example:\n" +
        "```\n" +
        "InternSight - AI Career Platform\n" +
        "Tech: React, FastAPI, PostgreSQL, Python\n" +
        "Built an AI-powered resume analyzer serving 500+ students\n" +
        "GitHub: github.com/yourname/internsight\n" +
        "```"
    }

    if (msg.includes("download") || msg.includes("pdf") || msg.includes("save")) {
      return "You can download your original resume by clicking the '📥 Download Resume' button in your Dashboard!\n\n" +
        "After improving your resume based on my suggestions:\n" +
        "1. Update your resume in Word or Google Docs\n" +
        "2. Download as PDF\n" +
        "3. Upload again to InternSight\n" +
        "4. Use Time Machine to compare your improvement!"
    }

    if (msg.includes("interview")) {
      return "Great! Let me help you prepare for interviews!\n\n" +
        "Go to 🎤 Interview Prep in the sidebar!\n\n" +
        "You can:\n" +
        "• Choose from 10 top MNC companies (Google, TCS, Infosys etc.)\n" +
        "• Practice technical questions for your role\n" +
        "• Do a mock interview with AI feedback\n" +
        "• Take an aptitude test\n" +
        "• See your career path\n\n" +
        "Which company are you targeting?"
    }

    if (msg.includes("salary") || msg.includes("pay") || msg.includes("lpa")) {
      return "Check your Salary Intelligence in the 💰 Salary Intel section!\n\n" +
        "It will show you:\n" +
        "• Your estimated salary range based on current skills\n" +
        "• Which single skill gives the biggest pay boost\n" +
        "• Your market percentile vs other candidates\n" +
        "• Peer benchmarking data\n\n" +
        "Want tips on how to negotiate salary?"
    }

    if (msg.includes("help") || msg.includes("what can you")) {
      return "Here is everything I can help you with:\n\n" +
        "📊 Resume Analysis:\n" +
        "• 'Show my ATS score'\n" +
        "• 'What are my weaknesses?'\n" +
        "• 'How to improve skills section?'\n\n" +
        "✏️ Resume Writing:\n" +
        "• 'How to write better experience?'\n" +
        "• 'How to improve projects section?'\n" +
        "• 'What keywords am I missing?'\n\n" +
        "🎯 Career Guidance:\n" +
        "• 'What jobs suit me?'\n" +
        "• 'How to prepare for interviews?'\n" +
        "• 'What should I learn next?'\n\n" +
        "Just type your question!"
    }

    return "That is a great question! Based on your resume analysis:\n\n" +
      "Your ATS Score is " + score + "/100. " +
      (recs.length > 0 ? "My top recommendation: " + recs[0] : "Keep improving your profile!") +
      "\n\nTry asking me:\n• How to improve my skills?\n• What are my weaknesses?\n• Which jobs suit me?\n• How to prepare for interviews?"
  }

  const typeOutMessage = (fullText, msgIndex) => {
    clearInterval(typingRef.current)
    setTypingIndex(msgIndex)
    setTypedText("")
    let i = 0
    typingRef.current = setInterval(() => {
      i += 3
      setTypedText(fullText.slice(0, i))
      if (i >= fullText.length) {
        clearInterval(typingRef.current)
        setTypingIndex(null)
      }
    }, 12)
  }

  useEffect(() => () => clearInterval(typingRef.current), [])

  const sendMessage = async (overrideText) => {
    const userMsg = (overrideText ?? input).trim()
    if (!userMsg) return
    setInput("")
    const historyForAI = messages.slice(-6).map(m => ({role: m.role, text: m.text}))
    setMessages(prev => [...prev, {role:"user", text:userMsg}])
    setLoading(true)

    let response = null
    try {
      const res = await axios.post("http://127.0.0.1:8000/resume/" + resumeId + "/chat", {
        message: userMsg,
        conversation_history: historyForAI,
        ats_score: atsScore || {}
      })
      response = res.data.response
    } catch { /* falls through to rule-based response below */ }

    if (!response) {
      await new Promise(r => setTimeout(r, 500))
      response = getAIResponse(userMsg)
    }

    setMessages(prev => {
      const next = [...prev, {role:"bot", text:response}]
      typeOutMessage(response, next.length - 1)
      return next
    })
    setLoading(false)
  }

  const copyMessage = (text, index) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  const regenerate = async (index) => {
    const priorUserMsg = [...messages].slice(0, index).reverse().find(m => m.role === "user")
    if (!priorUserMsg) return
    setLoading(true)

    let response = null
    try {
      const historyForAI = messages.slice(Math.max(0,index-6), index).map(m => ({role: m.role, text: m.text}))
      const res = await axios.post("http://127.0.0.1:8000/resume/" + resumeId + "/chat", {
        message: priorUserMsg.text,
        conversation_history: historyForAI,
        ats_score: atsScore || {}
      })
      response = res.data.response
    } catch { /* falls through */ }

    if (!response) {
      await new Promise(r => setTimeout(r, 500))
      response = getAIResponse(priorUserMsg.text)
    }

    setMessages(prev => prev.map((m, i) => i === index ? {role:"bot", text:response} : m))
    setLoading(false)
    typeOutMessage(response, index)
  }

  const quickQuestions = [
    "Show my ATS score",
    "What are my weaknesses?",
    "How to improve skills?",
    "Which jobs suit me?",
    "Interview tips"
  ]

  const renderInline = (line) => {
    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    return parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={j}>{part.slice(2, -2)}</strong>
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={j} style={{backgroundColor:"#E8D9C5",padding:"2px 6px",borderRadius:"4px",fontFamily:"monospace",fontSize:"12px"}}>{part.slice(1, -1)}</code>
      }
      return part
    })
  }

  const renderMessageText = (text) => {
    const lines = text.split("\n")
    const blocks = []
    let i = 0
    while (i < lines.length) {
      const line = lines[i]
      if (line.trim().startsWith("```")) {
        const codeLines = []
        i++
        while (i < lines.length && !lines[i].trim().startsWith("```")) { codeLines.push(lines[i]); i++ }
        i++
        blocks.push(
          <pre key={i} style={{backgroundColor:"#3D2F25",color:"#F0E4D3",padding:"12px 14px",borderRadius:"8px",fontSize:"12px",overflowX:"auto",margin:"6px 0",fontFamily:"monospace"}}>
            {codeLines.join("\n")}
          </pre>
        )
        continue
      }
      const trimmed = line.trim()
      if (trimmed.startsWith("•")) {
        blocks.push(<div key={i} style={{paddingLeft:"4px",marginBottom:"2px"}}>{renderInline(line)}</div>)
      } else if (trimmed === "") {
        blocks.push(<div key={i} style={{height:"6px"}}/>)
      } else {
        blocks.push(<div key={i}>{renderInline(line)}</div>)
      }
      i++
    }
    return blocks
  }

  return (
    <Layout>
      <div style={{maxWidth:"800px",margin:"0 auto",display:"flex",flexDirection:"column",height:"calc(100vh - 120px)"}}>

        <div style={{marginBottom:"16px"}}>
          <h2 style={{fontSize:"26px",fontWeight:"800",color:"#5C4033",marginBottom:"4px"}}>🤖 AI Resume Coach</h2>
          <p style={{color:"#8D6E63",fontSize:"13px"}}>Chat with AI to improve your resume and get career advice</p>
        </div>

        {initializing ? (
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:"14px"}}>
            <div className="skeleton" style={{height:"56px",borderRadius:"12px"}}/>
            <div className="skeleton" style={{flex:1,borderRadius:"16px"}}/>
            <div className="skeleton" style={{height:"48px",borderRadius:"10px"}}/>
          </div>
        ) : (
        <>
        {atsScore && (
          <div style={{backgroundColor:"#F0E4D3",borderRadius:"12px",padding:"12px 16px",marginBottom:"14px",display:"flex",gap:"20px",alignItems:"center"}}>
            <div style={{textAlign:"center"}}>
              <p style={{fontSize:"22px",fontWeight:"800",color:"#5C4033",margin:0}}>{atsScore.total_score}</p>
              <p style={{color:"#8D6E63",fontSize:"10px",margin:0}}>ATS Score</p>
            </div>
            <div style={{width:"1px",backgroundColor:"#E8D9C5",height:"30px"}}/>
            <div style={{textAlign:"center"}}>
              <p style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",margin:0}}>{atsScore.grade}</p>
              <p style={{color:"#8D6E63",fontSize:"10px",margin:0}}>Grade</p>
            </div>
            <div style={{width:"1px",backgroundColor:"#E8D9C5",height:"30px"}}/>
            <p style={{color:"#5C4033",fontSize:"12px",margin:0,flex:1}}>{atsScore.message}</p>
          </div>
        )}

        <div style={{flex:1,backgroundColor:"#FFFDF9",borderRadius:"16px",padding:"16px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",overflowY:"auto",marginBottom:"14px",display:"flex",flexDirection:"column",gap:"12px"}}>
          {messages.map((msg, i) => (
            <div key={i} className="animate-fadeIn" style={{display:"flex",flexDirection:"column",alignItems:msg.role==="user"?"flex-end":"flex-start"}}>
              <div style={{display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start",width:"100%"}}>
                {msg.role === "bot" && (
                  <div style={{width:"32px",height:"32px",backgroundColor:"#5C4033",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",flexShrink:0,marginRight:"8px",marginTop:"2px"}}>
                    🤖
                  </div>
                )}
                <div style={{
                  maxWidth:"75%",
                  backgroundColor:msg.role==="user"?"#5C4033":"#FDF8F0",
                  color:msg.role==="user"?"white":"#4A3728",
                  padding:"12px 16px",
                  borderRadius:msg.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",
                  fontSize:"13px",
                  lineHeight:"1.7",
                  boxShadow:"0 1px 4px rgba(92,64,51,0.08)"
                }}>
                  {i === typingIndex ? renderMessageText(typedText) : renderMessageText(msg.text)}
                </div>
                {msg.role === "user" && (
                  <div style={{width:"32px",height:"32px",backgroundColor:"#C89B6D",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:"700",color:"white",flexShrink:0,marginLeft:"8px",marginTop:"2px"}}>
                    Me
                  </div>
                )}
              </div>
              {msg.role === "bot" && i !== typingIndex && (
                <div style={{display:"flex",gap:"10px",marginLeft:"40px",marginTop:"4px"}}>
                  <button
                    onClick={() => copyMessage(msg.text, i)}
                    style={{background:"none",border:"none",cursor:"pointer",fontSize:"11px",color:"#A08D7C",padding:"2px 4px",fontWeight:"600"}}
                  >
                    {copiedIndex === i ? "✅ Copied" : "📋 Copy"}
                  </button>
                  {i === messages.length - 1 && !loading && (
                    <button
                      onClick={() => regenerate(i)}
                      style={{background:"none",border:"none",cursor:"pointer",fontSize:"11px",color:"#A08D7C",padding:"2px 4px",fontWeight:"600"}}
                    >
                      🔄 Regenerate
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <div style={{width:"32px",height:"32px",backgroundColor:"#5C4033",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px"}}>🤖</div>
              <div style={{backgroundColor:"#FDF8F0",padding:"14px 16px",borderRadius:"16px",display:"flex",gap:"4px",alignItems:"center"}}>
                <span className="animate-bounce" style={{width:"6px",height:"6px",borderRadius:"50%",backgroundColor:"#C89B6D",display:"inline-block",animationDelay:"0s"}}/>
                <span className="animate-bounce" style={{width:"6px",height:"6px",borderRadius:"50%",backgroundColor:"#C89B6D",display:"inline-block",animationDelay:"0.15s"}}/>
                <span className="animate-bounce" style={{width:"6px",height:"6px",borderRadius:"50%",backgroundColor:"#C89B6D",display:"inline-block",animationDelay:"0.3s"}}/>
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        <div style={{display:"flex",gap:"6px",marginBottom:"10px",flexWrap:"wrap"}}>
          {quickQuestions.map((q,i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              disabled={loading || initializing}
              style={{backgroundColor:"#F5EDE0",color:"#5C4033",border:"none",padding:"6px 12px",borderRadius:"20px",cursor:loading||initializing?"not-allowed":"pointer",fontSize:"12px",fontWeight:"500",opacity:loading||initializing?0.5:1}}
            >
              {q}
            </button>
          ))}
        </div>

        <div style={{display:"flex",gap:"10px"}}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key==="Enter" && sendMessage()}
            placeholder="Ask me anything about your resume..."
            style={{flex:1,padding:"12px 16px",borderRadius:"10px",border:"1px solid #E8D9C5",fontSize:"14px",outline:"none",fontFamily:"'Segoe UI',sans-serif"}}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{backgroundColor:input.trim()?"#5C4033":"#ccc",color:"white",border:"none",padding:"12px 24px",borderRadius:"10px",cursor:input.trim()?"pointer":"not-allowed",fontWeight:"700",fontSize:"14px"}}
          >
            Send →
          </button>
        </div>
        </>
        )}

      </div>
    </Layout>
  )
}

export default ResumeChat