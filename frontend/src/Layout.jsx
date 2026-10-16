import { useNavigate, useLocation } from "react-router-dom"
import logo from "./assets/logo.jpeg"
import { useTheme } from "./ThemeContext"

function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const fullName = localStorage.getItem("full_name") || "Student"
  const resumeId = localStorage.getItem("resume_id") || "1"
  const mode = localStorage.getItem("mode") || "student"
  const avatar = localStorage.getItem("avatar") || ""
  const { darkMode, toggleDarkMode } = useTheme()

  const bg = darkMode ? "#241B14" : "#5C4033"
  const cardBg = darkMode ? "#2A1F18" : "#FFFDF9"
  const pageBg = darkMode ? "#1F1712" : "#FAF3E8"
  const textColor = darkMode ? "#F0E4D3" : "#5C4033"
  const subText = darkMode ? "#B39C89" : "#8D6E63"


const studentMenu = [
  {icon:"🏠", label:"Dashboard", path:"/dashboard"},
  {icon:"🧭", label:"Career Discovery", path:"/career-discovery"},
  {icon:"📊", label:"ATS Score", path:"/results/"+resumeId},
  {icon:"🧩", label:"Skill Gap Analysis", path:"/skill-gap"},
  {icon:"📁", label:"Resume Versions", path:"/resume-versions"},
  {icon:"🌐", label:"Portfolio", path:"/portfolio"},
  {icon:"💼", label:"Browse Jobs", path:"/jobs"},
  {icon:"🔍", label:"JD Analyzer", path:"/jd-analyzer"},
  {icon:"💰", label:"Salary Intel", path:"/salary"},
  {icon:"🎯", label:"Self Intro", path:"/self-intro"},
  {icon:"📝", label:"Cover Letter", path:"/cover-letter"},
  {icon:"✏️", label:"Bullet Improver", path:"/bullet-improver"},
  {icon:"🚩", label:"Red Flags", path:"/red-flags"},
  {icon:"🕐", label:"Time Machine", path:"/time-machine"},
  {icon:"🗺️", label:"Roadmap", path:"/roadmap/"+resumeId+"/frontend_developer"},
  {icon:"📝", label:"Resume Builder", path:"/resume-builder"},
]

const interviewMenu = [
  {icon:"🏠", label:"Dashboard", path:"/dashboard"},
  {icon:"🎤", label:"Interview Prep", path:"/interview/"+resumeId},
  {icon:"🎯", label:"Self Intro", path:"/self-intro"},
  {icon:"📝", label:"Cover Letter", path:"/cover-letter"},
  {icon:"🗺️", label:"Roadmap", path:"/roadmap/"+resumeId+"/frontend_developer"},
]

const recruiterMenu = [
  {icon:"🏠", label:"Dashboard", path:"/dashboard"},
  {icon:"👔", label:"Recruiter Panel", path:"/recruiter"},
]


  const menuItems = mode === "interview" ? interviewMenu : mode === "recruiter" ? recruiterMenu : studentMenu
  const modeColor = mode === "interview" ? "#F59E0B" : mode === "recruiter" ? "#22C55E" : "#C89B6D"
  const modeLabel = mode === "interview" ? "Interview Mode" : mode === "recruiter" ? "Recruiter Mode" : "Student Mode"

  const isActive = (path) => {
    const base = path.split("/").slice(0,2).join("/")
    return location.pathname.startsWith(base)
  }

  return (
    <div style={{display:"flex",minHeight:"100vh",fontFamily:"'Segoe UI',sans-serif",backgroundColor:pageBg,transition:"background 0.3s"}}>

      {/* Sidebar */}
      <div style={{width:"230px",backgroundColor:bg,display:"flex",flexDirection:"column",position:"fixed",top:0,left:0,height:"100vh",zIndex:100,overflowY:"auto",transition:"background 0.3s"}}>

        <div style={{padding:"16px",borderBottom:"1px solid rgba(255,255,255,0.08)",textAlign:"center"}}>
          <img src={logo} alt="InternSight" style={{height:"44px",objectFit:"contain"}}/>
        </div>

        <div style={{padding:"12px 14px",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px"}}>
            <div
              onClick={() => navigate("/settings")}
              style={{width:"34px",height:"34px",borderRadius:"50%",backgroundColor:modeColor,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden",flexShrink:0}}
            >
              {avatar ? (
                <img src={avatar} alt="avatar" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              ) : (
                <span style={{color:"white",fontWeight:"700",fontSize:"14px"}}>{fullName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <p style={{color:"white",fontWeight:"600",fontSize:"12px",margin:0}}>{fullName}</p>
              <p style={{color:"rgba(255,255,255,0.4)",fontSize:"10px",margin:0}}>{modeLabel}</p>
            </div>
          </div>
          <div style={{backgroundColor:modeColor+"25",borderRadius:"6px",padding:"3px 8px",textAlign:"center"}}>
            <span style={{color:modeColor,fontSize:"10px",fontWeight:"700"}}>{modeLabel}</span>
          </div>
        </div>

        <div style={{flex:1,padding:"8px",overflowY:"auto"}}>
          {menuItems.map((item, i) => (
            <div
              key={i}
              onClick={() => navigate(item.path)}
              className="sidebar-item"
              style={{
                display:"flex",
                alignItems:"center",
                gap:"10px",
                padding:"9px 12px",
                borderRadius:"8px",
                cursor:"pointer",
                marginBottom:"2px",
                backgroundColor:isActive(item.path)?modeColor+"dd":"transparent",
                transition:"all 0.15s ease"
              }}
              onMouseEnter={e => { if (!isActive(item.path)) e.currentTarget.style.backgroundColor="rgba(255,255,255,0.08)" }}
              onMouseLeave={e => { if (!isActive(item.path)) e.currentTarget.style.backgroundColor="transparent" }}
            >
              <span style={{fontSize:"15px",flexShrink:0}}>{item.icon}</span>
              <span style={{color:"white",fontSize:"12px",fontWeight:isActive(item.path)?"700":"400"}}>{item.label}</span>
            </div>
          ))}
        </div>

        <div style={{padding:"8px",borderTop:"1px solid rgba(255,255,255,0.08)"}}>
          <div
            onClick={() => navigate("/settings")}
            style={{display:"flex",alignItems:"center",gap:"10px",padding:"9px 12px",borderRadius:"8px",cursor:"pointer",marginBottom:"4px"}}
            onMouseEnter={e => e.currentTarget.style.backgroundColor="rgba(255,255,255,0.08)"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor="transparent"}
          >
            <span style={{fontSize:"15px"}}>⚙️</span>
            <span style={{color:"rgba(255,255,255,0.6)",fontSize:"12px"}}>Settings</span>
          </div>
          <div
            onClick={() => navigate("/upload")}
            style={{display:"flex",alignItems:"center",gap:"10px",padding:"9px 12px",borderRadius:"8px",cursor:"pointer",backgroundColor:"rgba(0,180,216,0.12)",marginBottom:"4px"}}
          >
            <span style={{fontSize:"15px"}}>🔄</span>
            <span style={{color:"#C89B6D",fontSize:"12px",fontWeight:"600"}}>Switch Mode</span>
          </div>
          <div
            onClick={() => { localStorage.clear(); navigate("/") }}
            style={{display:"flex",alignItems:"center",gap:"10px",padding:"9px 12px",borderRadius:"8px",cursor:"pointer"}}
            onMouseEnter={e => e.currentTarget.style.backgroundColor="rgba(255,255,255,0.08)"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor="transparent"}
          >
            <span style={{fontSize:"15px"}}>🚪</span>
            <span style={{color:"rgba(255,255,255,0.4)",fontSize:"12px"}}>Logout</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{marginLeft:"230px",flex:1,display:"flex",flexDirection:"column",minHeight:"100vh",transition:"background 0.3s"}}>

        {/* Top Bar */}
        <div style={{backgroundColor:cardBg,padding:"11px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 1px 4px rgba(92,64,51,0.08)",position:"sticky",top:0,zIndex:99,transition:"background 0.3s"}}>
          <h2 style={{color:textColor,fontWeight:"700",fontSize:"16px",margin:0}}>InternSight</h2>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <div
              onClick={toggleDarkMode}
              style={{cursor:"pointer",fontSize:"18px",padding:"4px 8px",borderRadius:"8px",backgroundColor:darkMode?"rgba(255,255,255,0.1)":"#F5EDE0"}}
              title="Toggle dark mode"
            >
              {darkMode ? "☀️" : "🌙"}
            </div>
            <span style={{backgroundColor:"#F0E4D3",color:"#5C4033",padding:"5px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:"600"}}>
              👋 {fullName}
            </span>
            <button
              onClick={() => navigate("/settings")}
              style={{backgroundColor:darkMode?"rgba(255,255,255,0.1)":"#F5EDE0",color:textColor,border:"none",padding:"7px 12px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"12px"}}
            >
              ⚙️
            </button>
            <button
              onClick={() => navigate("/upload")}
              style={{backgroundColor:"#5C4033",color:"white",border:"none",padding:"7px 14px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"12px"}}
              className="btn-primary"
            >
              + New Analysis
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div style={{padding:"24px",flex:1,backgroundColor:pageBg}} className="page-enter">
          {children}
        </div>
      </div>

      {/* Floating AI Chat Button */}
      <div
        onClick={() => navigate("/resume-chat")}
        style={{
          position:"fixed",
          bottom:"24px",
          right:"24px",
          width:"56px",
          height:"56px",
          backgroundColor:"#5C4033",
          borderRadius:"50%",
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          cursor:"pointer",
          boxShadow:"0 4px 20px rgba(92,64,51,0.4)",
          zIndex:1000,
          fontSize:"24px",
          transition:"all 0.3s"
        }}
        className="float-animation"
        title="AI Resume Coach"
        onMouseEnter={e => { e.currentTarget.style.transform="scale(1.1)"; e.currentTarget.style.boxShadow="0 6px 28px rgba(92,64,51,0.5)" }}
        onMouseLeave={e => { e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.boxShadow="0 4px 20px rgba(92,64,51,0.4)" }}
      >
        🤖
      </div>

    </div>
  )
}

export default Layout