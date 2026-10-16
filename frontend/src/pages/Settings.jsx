import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Layout from "../Layout"
import { useTheme } from "../ThemeContext"

const ROLE_OPTIONS = [
  {value:"", label:"Not decided yet"},
  {value:"frontend_developer", label:"Frontend Developer"},
  {value:"backend_developer", label:"Backend Developer"},
  {value:"data_analyst", label:"Data Analyst"},
  {value:"ml_engineer", label:"ML Engineer"},
  {value:"devops_engineer", label:"DevOps Engineer"}
]

function Settings() {
  const navigate = useNavigate()
  const fileRef = useRef()
  const { darkMode, toggleDarkMode } = useTheme()
  const [saved, setSaved] = useState(false)
  const [dataCleared, setDataCleared] = useState(false)
  const userId = localStorage.getItem("user_id")
  const [careerProfile, setCareerProfile] = useState({
    target_role: "", dream_company: "", expected_salary: "",
    work_style: "", company_type: "", location_preference: ""
  })
  const [careerProfileLoading, setCareerProfileLoading] = useState(false)
  const [careerProfileSaved, setCareerProfileSaved] = useState(false)

  useEffect(() => {
    if (!userId) return
    setCareerProfileLoading(true)
    axios.get("http://127.0.0.1:8000/career-profile/" + userId)
      .then(res => {
        setCareerProfile({
          target_role: res.data.target_role || "",
          dream_company: res.data.dream_company || "",
          expected_salary: res.data.expected_salary || "",
          work_style: res.data.work_style || "",
          company_type: res.data.company_type || "",
          location_preference: res.data.location_preference || ""
        })
      })
      .catch(() => {})
      .finally(() => setCareerProfileLoading(false))
  }, [userId])

  const saveCareerProfile = async () => {
    if (!userId) return
    try {
      await axios.patch("http://127.0.0.1:8000/career-profile/" + userId, careerProfile)
      setCareerProfileSaved(true)
      setTimeout(() => setCareerProfileSaved(false), 2000)
    } catch {
      alert("Couldn't save your career goals — please try again.")
    }
  }
  const [notifPrefs, setNotifPrefs] = useState({
    streakReminders: localStorage.getItem("pref_streak_reminders") !== "false",
    completionSounds: localStorage.getItem("pref_completion_sounds") === "true",
    weeklyDigestBanner: localStorage.getItem("pref_weekly_digest") !== "false"
  })
  const [profile, setProfile] = useState({
    full_name: localStorage.getItem("full_name") || "",
    email: localStorage.getItem("email") || "",
    dob: localStorage.getItem("dob") || "",
    phone: localStorage.getItem("phone") || "",
    location: localStorage.getItem("location") || "",
    bio: localStorage.getItem("bio") || "",
    linkedin: localStorage.getItem("linkedin") || "",
    github: localStorage.getItem("github") || "",
    apaar_id: localStorage.getItem("apaar_id") || "",
    avatar: localStorage.getItem("avatar") || ""
  })

  const apaarValid = /^\d{12}$/.test(profile.apaar_id)
  const apaarTouched = profile.apaar_id.length > 0
  const [apaarSaving, setApaarSaving] = useState(false)
  const [apaarResult, setApaarResult] = useState(null)

  const saveApaarId = async () => {
    if (!userId) return
    setApaarSaving(true)
    setApaarResult(null)
    try {
      const res = await axios.post("http://127.0.0.1:8000/career-profile/" + userId + "/verify-apaar", {apaar_id: profile.apaar_id})
      setApaarResult(res.data)
    } catch {
      setApaarResult({message: "Couldn't save right now — please try again."})
    }
    setApaarSaving(false)
  }

  const handleChange = (e) => {
    setProfile({...profile, [e.target.name]: e.target.value})
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setProfile({...profile, avatar: ev.target.result})
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    Object.entries(profile).forEach(([key, val]) => {
      localStorage.setItem(key, val)
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggleNotifPref = (key, storageKey) => {
    const next = !notifPrefs[key]
    setNotifPrefs(prev => ({...prev, [key]: next}))
    localStorage.setItem(storageKey, next.toString())
  }

  const downloadMyData = () => {
    const data = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      data[key] = localStorage.getItem(key)
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"})
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "internsight_my_data.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearAllLocalData = () => {
    if (!window.confirm("This clears all locally stored data (profile, progress, chat history, preferences) on this device. This cannot be undone. Continue?")) return
    localStorage.clear()
    setDataCleared(true)
    setTimeout(() => navigate("/"), 1500)
  }

  return (
    <Layout>
      <div style={{maxWidth:"700px",margin:"0 auto"}} className="page-enter">

        <div style={{marginBottom:"24px"}}>
          <h2 style={{fontSize:"26px",fontWeight:"800",color:"#5C4033",marginBottom:"4px"}}>⚙️ Settings</h2>
          <p style={{color:"#8D6E63",fontSize:"13px"}}>Manage your profile and preferences</p>
        </div>

        {/* Profile Photo */}
        <div style={{backgroundColor:"#FFFDF9",borderRadius:"20px",padding:"24px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",marginBottom:"16px"}}>
          <h3 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",marginBottom:"20px"}}>👤 Profile Photo</h3>
          <div style={{display:"flex",alignItems:"center",gap:"20px"}}>
            <div
              onClick={() => fileRef.current.click()}
              style={{width:"80px",height:"80px",borderRadius:"50%",backgroundColor:profile.avatar?"transparent":"#5C4033",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden",border:"3px solid #F0E4D3",flexShrink:0}}
            >
              {profile.avatar ? (
                <img src={profile.avatar} alt="avatar" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              ) : (
                <span style={{color:"white",fontSize:"28px",fontWeight:"700"}}>{profile.full_name.charAt(0).toUpperCase() || "U"}</span>
              )}
            </div>
            <div>
              <button
                onClick={() => fileRef.current.click()}
                style={{backgroundColor:"#5C4033",color:"white",border:"none",padding:"8px 18px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"13px",marginBottom:"6px",display:"block"}}
              >
                Upload Photo
              </button>
              <p style={{color:"#B3A292",fontSize:"11px",margin:0}}>JPG, PNG up to 5MB</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleImageUpload}/>
          </div>
        </div>

        {/* Personal Info */}
        <div style={{backgroundColor:"#FFFDF9",borderRadius:"20px",padding:"24px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",marginBottom:"16px"}}>
          <h3 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",marginBottom:"20px"}}>📋 Personal Information</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
            {[
              {label:"Full Name",name:"full_name",type:"text",placeholder:"Your full name"},
              {label:"Email Address",name:"email",type:"email",placeholder:"your@email.com"},
              {label:"Date of Birth",name:"dob",type:"date",placeholder:""},
              {label:"Phone Number",name:"phone",type:"tel",placeholder:"+91 98765 43210"},
              {label:"Location",name:"location",type:"text",placeholder:"City, State"},
              {label:"LinkedIn URL",name:"linkedin",type:"text",placeholder:"linkedin.com/in/yourname"},
              {label:"GitHub URL",name:"github",type:"text",placeholder:"github.com/yourname"},
            ].map((field,i) => (
              <div key={i} style={field.name==="linkedin"||field.name==="github"?{gridColumn:"span 1"}:{}}>
                <label style={{fontSize:"12px",fontWeight:"600",color:"#6B5B4D",marginBottom:"6px",display:"block"}}>{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  value={profile[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  style={{width:"100%",padding:"10px 14px",borderRadius:"8px",border:"1px solid #E8D9C5",fontSize:"13px",outline:"none",boxSizing:"border-box",transition:"all 0.2s"}}
                />
              </div>
            ))}
            <div style={{gridColumn:"span 2"}}>
              <label style={{fontSize:"12px",fontWeight:"600",color:"#6B5B4D",marginBottom:"6px",display:"block"}}>Bio</label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                rows={3}
                style={{width:"100%",padding:"10px 14px",borderRadius:"8px",border:"1px solid #E8D9C5",fontSize:"13px",outline:"none",resize:"none",boxSizing:"border-box",fontFamily:"'Segoe UI',sans-serif"}}
              />
            </div>
          </div>
        </div>

        {/* Academic ID */}
        <div style={{backgroundColor:"#FFFDF9",borderRadius:"20px",padding:"24px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",marginBottom:"16px"}}>
          <h3 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",marginBottom:"6px"}}>🎓 Academic ID</h3>
          <p style={{color:"#8D6E63",fontSize:"12px",marginBottom:"16px",lineHeight:"1.6"}}>
            Add your APAAR ID for your own reference. <strong>This is not verified against any government database</strong> — InternSight doesn't currently have official DigiLocker/APAAR API access, so we only check that it's a valid 12-digit format.
          </p>
          <label style={{fontSize:"12px",fontWeight:"600",color:"#6B5B4D",marginBottom:"6px",display:"block"}}>APAAR ID</label>
          <input
            type="text"
            name="apaar_id"
            value={profile.apaar_id}
            onChange={e => {
              const digitsOnly = e.target.value.replace(/\D/g,"").slice(0,12)
              setProfile({...profile, apaar_id: digitsOnly})
            }}
            placeholder="12-digit APAAR ID"
            maxLength={12}
            style={{width:"100%",maxWidth:"280px",padding:"10px 14px",borderRadius:"8px",border:"1px solid "+(apaarTouched?(apaarValid?"#22C55E":"#EF4444"):"#E8D9C5"),fontSize:"13px",outline:"none",boxSizing:"border-box",fontFamily:"monospace",letterSpacing:"1px"}}
          />
          {apaarTouched && (
            <p style={{fontSize:"11px",marginTop:"6px",color:apaarValid?"#16A34A":"#DC2626",fontWeight:"600"}}>
              {apaarValid ? "✓ Valid 12-digit format" : `${profile.apaar_id.length}/12 digits`}
            </p>
          )}
          {userId && apaarValid && (
            <button
              onClick={saveApaarId}
              disabled={apaarSaving}
              style={{marginTop:"10px",backgroundColor:apaarResult?"#DCFCE7":"#5C4033",color:apaarResult?"#16A34A":"white",border:"none",padding:"8px 18px",borderRadius:"8px",fontSize:"12px",fontWeight:"700",cursor:"pointer"}}
            >
              {apaarSaving ? "Saving..." : apaarResult ? "✅ Saved to profile" : "Save APAAR ID"}
            </button>
          )}
          {apaarResult && (
            <p style={{fontSize:"11px",marginTop:"8px",color:"#8D6E63"}}>{apaarResult.message}</p>
          )}
        </div>

        {/* Career Goals */}
        <div style={{backgroundColor:"#FFFDF9",borderRadius:"20px",padding:"24px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",marginBottom:"16px"}}>
          <h3 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",marginBottom:"6px"}}>🎯 Career Goals</h3>
          <p style={{color:"#8D6E63",fontSize:"12px",marginBottom:"16px",lineHeight:"1.6"}}>
            Set once, remembered everywhere — your target role feeds into Roadmap, Interview Prep and Dashboard automatically.
          </p>

          {!userId ? (
            <p style={{color:"#B45309",fontSize:"12px",backgroundColor:"#FEF3C7",padding:"10px 14px",borderRadius:"8px"}}>
              Log in again to sync career goals to your account.
            </p>
          ) : careerProfileLoading ? (
            <div className="skeleton" style={{height:"140px",borderRadius:"10px"}}/>
          ) : (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
              <div>
                <label style={{fontSize:"12px",fontWeight:"600",color:"#6B5B4D",marginBottom:"6px",display:"block"}}>Target Role</label>
                <select
                  value={careerProfile.target_role}
                  onChange={e => setCareerProfile({...careerProfile, target_role:e.target.value})}
                  style={{width:"100%",padding:"9px 12px",borderRadius:"8px",border:"1px solid #E8D9C5",fontSize:"13px",outline:"none",backgroundColor:"#FFFDF9",boxSizing:"border-box"}}
                >
                  {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:"12px",fontWeight:"600",color:"#6B5B4D",marginBottom:"6px",display:"block"}}>Dream Company</label>
                <input type="text" value={careerProfile.dream_company} onChange={e => setCareerProfile({...careerProfile, dream_company:e.target.value})}
                  placeholder="e.g. Google" style={{width:"100%",padding:"9px 12px",borderRadius:"8px",border:"1px solid #E8D9C5",fontSize:"13px",outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div>
                <label style={{fontSize:"12px",fontWeight:"600",color:"#6B5B4D",marginBottom:"6px",display:"block"}}>Expected Salary</label>
                <input type="text" value={careerProfile.expected_salary} onChange={e => setCareerProfile({...careerProfile, expected_salary:e.target.value})}
                  placeholder="e.g. ₹8 LPA" style={{width:"100%",padding:"9px 12px",borderRadius:"8px",border:"1px solid #E8D9C5",fontSize:"13px",outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div>
                <label style={{fontSize:"12px",fontWeight:"600",color:"#6B5B4D",marginBottom:"6px",display:"block"}}>Work Style</label>
                <select
                  value={careerProfile.work_style}
                  onChange={e => setCareerProfile({...careerProfile, work_style:e.target.value})}
                  style={{width:"100%",padding:"9px 12px",borderRadius:"8px",border:"1px solid #E8D9C5",fontSize:"13px",outline:"none",backgroundColor:"#FFFDF9",boxSizing:"border-box"}}
                >
                  <option value="">No preference</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="office">Office</option>
                </select>
              </div>
              <div>
                <label style={{fontSize:"12px",fontWeight:"600",color:"#6B5B4D",marginBottom:"6px",display:"block"}}>Company Type</label>
                <select
                  value={careerProfile.company_type}
                  onChange={e => setCareerProfile({...careerProfile, company_type:e.target.value})}
                  style={{width:"100%",padding:"9px 12px",borderRadius:"8px",border:"1px solid #E8D9C5",fontSize:"13px",outline:"none",backgroundColor:"#FFFDF9",boxSizing:"border-box"}}
                >
                  <option value="">No preference</option>
                  <option value="startup">Startup</option>
                  <option value="mnc">MNC</option>
                  <option value="govt">Government</option>
                </select>
              </div>
              <div>
                <label style={{fontSize:"12px",fontWeight:"600",color:"#6B5B4D",marginBottom:"6px",display:"block"}}>Preferred Location</label>
                <input type="text" value={careerProfile.location_preference} onChange={e => setCareerProfile({...careerProfile, location_preference:e.target.value})}
                  placeholder="e.g. Bengaluru" style={{width:"100%",padding:"9px 12px",borderRadius:"8px",border:"1px solid #E8D9C5",fontSize:"13px",outline:"none",boxSizing:"border-box"}}/>
              </div>
            </div>
          )}

          {userId && !careerProfileLoading && (
            <button
              onClick={saveCareerProfile}
              style={{marginTop:"16px",backgroundColor:careerProfileSaved?"#DCFCE7":"#5C4033",color:careerProfileSaved?"#16A34A":"white",border:"none",padding:"10px 20px",borderRadius:"8px",fontSize:"13px",fontWeight:"700",cursor:"pointer"}}
            >
              {careerProfileSaved ? "✅ Saved" : "Save Career Goals"}
            </button>
          )}
        </div>

        {/* Appearance */}
        <div style={{backgroundColor:"#FFFDF9",borderRadius:"20px",padding:"24px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",marginBottom:"16px"}}>
          <h3 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",marginBottom:"20px"}}>🎨 Appearance</h3>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",backgroundColor:"#FDF8F0",borderRadius:"12px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
              <span style={{fontSize:"22px"}}>{darkMode ? "🌙" : "☀️"}</span>
              <div>
                <p style={{fontWeight:"600",color:"#5C4033",margin:"0 0 2px",fontSize:"14px"}}>{darkMode ? "Dark Mode" : "Light Mode"}</p>
                <p style={{color:"#8D6E63",fontSize:"12px",margin:0}}>Switch between light and dark themes</p>
              </div>
            </div>
            <div
              onClick={toggleDarkMode}
              style={{
                width:"48px",height:"26px",borderRadius:"13px",
                backgroundColor:darkMode?"#5C4033":"#E8D9C5",
                position:"relative",cursor:"pointer",
                transition:"background 0.3s"
              }}
            >
              <div style={{
                position:"absolute",top:"3px",
                left:darkMode?"22px":"3px",
                width:"20px",height:"20px",
                borderRadius:"50%",backgroundColor:"#FFFDF9",
                transition:"left 0.3s",
                boxShadow:"0 1px 4px rgba(92,64,51,0.20)"
              }}/>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div style={{backgroundColor:"#FFFDF9",borderRadius:"20px",padding:"24px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",marginBottom:"16px"}}>
          <h3 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",marginBottom:"16px"}}>🔔 Notifications</h3>
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            {[
              {key:"streakReminders",storageKey:"pref_streak_reminders",label:"Streak Reminders",desc:"Get reminded to keep your study streak alive"},
              {key:"completionSounds",storageKey:"pref_completion_sounds",label:"Completion Sounds",desc:"Play a sound when you finish a task or module"},
              {key:"weeklyDigestBanner",storageKey:"pref_weekly_digest",label:"Weekly Digest",desc:"Show a weekly summary banner on your dashboard"}
            ].map(pref => (
              <div key={pref.key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",backgroundColor:"#FDF8F0",borderRadius:"12px"}}>
                <div>
                  <p style={{fontWeight:"600",color:"#5C4033",margin:"0 0 2px",fontSize:"13px"}}>{pref.label}</p>
                  <p style={{color:"#8D6E63",fontSize:"11px",margin:0}}>{pref.desc}</p>
                </div>
                <div
                  onClick={() => toggleNotifPref(pref.key, pref.storageKey)}
                  style={{width:"44px",height:"24px",borderRadius:"12px",backgroundColor:notifPrefs[pref.key]?"#5C4033":"#E8D9C5",position:"relative",cursor:"pointer",transition:"background 0.3s",flexShrink:0}}
                >
                  <div style={{position:"absolute",top:"3px",left:notifPrefs[pref.key]?"23px":"3px",width:"18px",height:"18px",borderRadius:"50%",backgroundColor:"#FFFDF9",transition:"left 0.3s",boxShadow:"0 1px 4px rgba(92,64,51,0.20)"}}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account */}
        <div style={{backgroundColor:"#FFFDF9",borderRadius:"20px",padding:"24px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",marginBottom:"20px"}}>
          <h3 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",marginBottom:"16px"}}>🔒 Account</h3>
          <div style={{display:"flex",gap:"10px"}}>
            <button
              onClick={() => navigate("/upload")}
              style={{flex:1,backgroundColor:"#F5EDE0",color:"#5C4033",border:"none",padding:"10px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"13px"}}
            >
              📄 Upload New Resume
            </button>
            <button
              onClick={() => { localStorage.clear(); navigate("/") }}
              style={{flex:1,backgroundColor:"#FEE2E2",color:"#DC2626",border:"none",padding:"10px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"13px"}}
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Privacy */}
        <div style={{backgroundColor:"#FFFDF9",borderRadius:"20px",padding:"24px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",marginBottom:"20px"}}>
          <h3 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",marginBottom:"16px"}}>🛡️ Privacy</h3>
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",backgroundColor:"#FDF8F0",borderRadius:"12px",flexWrap:"wrap",gap:"10px"}}>
              <div>
                <p style={{fontWeight:"600",color:"#5C4033",margin:"0 0 2px",fontSize:"13px"}}>Download Your Data</p>
                <p style={{color:"#8D6E63",fontSize:"11px",margin:0}}>Export everything stored on this device as JSON</p>
              </div>
              <button onClick={downloadMyData} style={{backgroundColor:"#F0E4D3",color:"#5C4033",border:"none",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"12px"}}>
                📥 Export
              </button>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",backgroundColor:"#FEE2E2",borderRadius:"12px",flexWrap:"wrap",gap:"10px"}}>
              <div>
                <p style={{fontWeight:"600",color:"#DC2626",margin:"0 0 2px",fontSize:"13px"}}>Clear All Local Data</p>
                <p style={{color:"#DC2626",fontSize:"11px",margin:0,opacity:0.8}}>Permanently erase profile, progress and chat history on this device</p>
              </div>
              <button onClick={clearAllLocalData} style={{backgroundColor:"#DC2626",color:"white",border:"none",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"12px",flexShrink:0}}>
                {dataCleared ? "✅ Cleared" : "🗑️ Clear Data"}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          style={{width:"100%",backgroundColor:saved?"#22C55E":"#5C4033",color:"white",border:"none",padding:"14px",borderRadius:"12px",fontSize:"15px",fontWeight:"700",cursor:"pointer",transition:"all 0.3s"}}
          className="btn-primary"
        >
          {saved ? "✅ Saved Successfully!" : "Save Changes"}
        </button>

      </div>
    </Layout>
  )
}

export default Settings