import { useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import logo from "../assets/logo.jpeg"

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
      setDisplay(Math.round(eased * target))
      if (progress < 1) frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [value, duration])

  return <>{display}</>
}

function Home() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [openFaq, setOpenFaq] = useState(0)

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({behavior:"smooth"})
  }

  const features = [
    {icon:"📊", title:"ATS Score Analysis", desc:"Transparent category-wise scoring with detailed reasoning"},
    {icon:"💼", title:"Real Job Matching", desc:"Browse internships and see your exact match score"},
    {icon:"🔍", title:"JD Analyzer", desc:"Paste any LinkedIn job and know if you should apply"},
    {icon:"💰", title:"Salary Intelligence", desc:"Know your market value and what skills boost your pay"},
    {icon:"🎤", title:"Interview Preparation", desc:"Practice with MNC-specific questions and aptitude tests"},
    {icon:"🎯", title:"Self Introduction", desc:"AI generates your personalized interview introduction"},
    {icon:"📝", title:"Cover Letter Generator", desc:"Professional cover letter in seconds"},
    {icon:"✏️", title:"Bullet Improver", desc:"AI rewrites weak resume points into achievement statements"},
    {icon:"🚩", title:"Red Flag Detector", desc:"Find and fix issues hurting your resume"},
    {icon:"🕐", title:"Resume Time Machine", desc:"Compare old vs new resume and see your improvement"},
    {icon:"🗺️", title:"Learning Roadmap", desc:"Week by week personalized plan to become job ready"},
    {icon:"👔", title:"Recruiter Dashboard", desc:"Batch analyze and rank multiple candidates"}
  ]

  const reviews = [
    {name:"Priya Sharma", role:"CSE Student, Anna University", review:"InternSight helped me understand why my resume was rejected. After following the roadmap I got my first internship at TCS!", avatar:"P"},
    {name:"Rahul Kumar", role:"MSc Software Systems", review:"The JD Analyzer is amazing! I pasted a LinkedIn job and instantly knew I needed Docker. Got the job after adding it!", avatar:"R"},
    {name:"Ananya Krishnan", role:"ECE Student, KCT", review:"The mock interview with MNC companies is so helpful. The aptitude test really helped me prepare for campus placements.", avatar:"A"},
    {name:"Mohammed Zaid", role:"IT Student, PSG Tech", review:"Salary intelligence was eye-opening. I learned which skills give the highest salary boost and focused on those.", avatar:"M"},
    {name:"Swetha Rajan", role:"MCA Student", review:"Time Machine showed how much I improved in 3 months. My ATS score went from 42 to 78! Highly recommend!", avatar:"S"},
    {name:"Karthik Vel", role:"B.Tech Final Year", review:"Recruiter dashboard helped our placement cell screen 50+ resumes in minutes instead of hours. Game changing!", avatar:"K"}
  ]

  const faqs = [
    {q:"Is InternSight really free to use?", a:"Yes. Every feature — ATS scoring, job matching, interview prep, cover letter generation and more — is completely free. No hidden tiers, no credit card required."},
    {q:"How is my resume score calculated?", a:"We break your resume down into categories like skills match, experience relevance, formatting and keyword coverage, and show you the reasoning behind every point — not just a black-box number."},
    {q:"Does InternSight store my resume data?", a:"Your resume is stored securely against your account so you can revisit past analyses, use Resume Time Machine to track improvement, and access your data anytime from Settings."},
    {q:"Can I use this if I'm not a CS/IT student?", a:"Absolutely. The JD Analyzer, salary intelligence and interview prep tools adapt to whatever role or job description you're targeting, across branches."}
  ]

  const pricingFeatures = [
    "Unlimited ATS resume analysis",
    "Real job matching with match scores",
    "JD Analyzer for any job posting",
    "AI interview preparation & aptitude tests",
    "Cover letter & self-introduction generator",
    "Learning roadmap personalized to you",
    "Resume red flag detector & bullet improver",
    "Resume Time Machine progress tracking"
  ]

  return (
    <div style={{fontFamily:"'Segoe UI',sans-serif",backgroundColor:"#FDF8F0",overflowX:"hidden"}}>

      {/* Navbar */}
      <nav style={{backgroundColor:"#FFFDF9",padding:"14px 60px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 1px 6px rgba(92,64,51,0.08)",position:"sticky",top:0,zIndex:100}}>
        <img src={logo} alt="InternSight" style={{height:"44px",objectFit:"contain"}}/>
        <div style={{display:"flex",alignItems:"center",gap:"24px"}}>
          {[
            {label:"Features",id:"features"},
            {label:"How it works",id:"howitworks"},
            {label:"Pricing",id:"pricing"},
            {label:"Reviews",id:"reviews"},
            {label:"FAQ",id:"faq"},
            {label:"Contact",id:"contact"}
          ].map(item => (
            <span key={item.id} onClick={() => scrollTo(item.id)} style={{color:"#5C4033",cursor:"pointer",fontWeight:"500",fontSize:"14px",transition:"color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.color="#C89B6D"} onMouseLeave={e=>e.currentTarget.style.color="#5C4033"}>{item.label}</span>
          ))}
          <button onClick={() => navigate("/login")} className="btn btn-ghost">Login</button>
          <button onClick={() => navigate("/register")} className="btn btn-accent">Get Started Free</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{position:"relative",background:"linear-gradient(135deg, #F5EDE0 0%, #F0E4D3 50%, #FBEDD3 100%)",padding:"100px 60px 80px",textAlign:"center",overflow:"hidden"}}>

        {/* Floating decorative illustrations */}
        <div className="animate-float" style={{position:"absolute",top:"60px",left:"8%",fontSize:"38px",opacity:0.5,animationDelay:"0.2s"}}>📄</div>
        <div className="animate-float" style={{position:"absolute",top:"140px",right:"10%",fontSize:"34px",opacity:0.5,animationDelay:"0.8s"}}>🎯</div>
        <div className="animate-float" style={{position:"absolute",bottom:"60px",left:"14%",fontSize:"30px",opacity:0.5,animationDelay:"1.4s"}}>💼</div>
        <div className="animate-float" style={{position:"absolute",bottom:"110px",right:"16%",fontSize:"32px",opacity:0.5,animationDelay:"0.5s"}}>🚀</div>
        <div style={{position:"absolute",top:"-80px",right:"-80px",width:"320px",height:"320px",borderRadius:"50%",background:"radial-gradient(circle, rgba(198,139,89,0.18) 0%, rgba(198,139,89,0) 70%)"}}/>
        <div style={{position:"absolute",bottom:"-100px",left:"-100px",width:"360px",height:"360px",borderRadius:"50%",background:"radial-gradient(circle, rgba(92,64,51,0.10) 0%, rgba(92,64,51,0) 70%)"}}/>

        <div className="animate-fadeUp" style={{display:"inline-block",backgroundColor:"#FFFDF9",color:"#C89B6D",padding:"6px 16px",borderRadius:"20px",fontSize:"13px",fontWeight:"600",marginBottom:"24px",boxShadow:"0 2px 10px rgba(92,64,51,0.08)",position:"relative"}}>
          ✨ AI-Powered Career Intelligence Platform
        </div>
        <h1 className="animate-fadeUp stagger-1" style={{fontSize:"58px",fontWeight:"900",color:"#5C4033",margin:"0 0 16px",lineHeight:"1.15",position:"relative"}}>
          From Resume to<span className="gradient-text"> Placed.</span>
        </h1>
        <p className="animate-fadeUp stagger-2" style={{color:"#6B5B4D",fontSize:"18px",maxWidth:"620px",margin:"0 auto 16px",lineHeight:"1.7",position:"relative"}}>
          The most complete AI career platform for students. Get ATS score, job matches, salary insights, interview prep, cover letters and more — all in one place.
        </p>
        <p className="animate-fadeUp stagger-3" style={{color:"#A08D7C",fontSize:"14px",marginBottom:"40px",position:"relative"}}>
          Unlike Jobscan and Teal HQ — InternSight is 100% free and has 12+ unique features
        </p>
        <div className="animate-fadeUp stagger-4" style={{display:"flex",maxWidth:"560px",margin:"0 auto 20px",backgroundColor:"#FFFDF9",borderRadius:"12px",padding:"6px",boxShadow:"0 8px 30px rgba(92,64,51,0.15)",position:"relative"}}>
          <input
            type="text"
            placeholder="Search role... e.g. Data Analyst, React Developer"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{flex:1,border:"none",outline:"none",padding:"10px 14px",fontSize:"14px",color:"#4A3728",backgroundColor:"transparent"}}
          />
          <button onClick={() => navigate("/register")} className="btn btn-accent">
            Analyze →
          </button>
        </div>
        <p className="animate-fadeUp stagger-5" style={{color:"#B3A292",fontSize:"12px",position:"relative",marginBottom:"18px"}}>Free · No credit card · Instant results</p>
        <div className="animate-fadeUp stagger-5" style={{position:"relative"}}>
          <span
            onClick={() => navigate("/career-discovery")}
            style={{color:"#5C4033",fontSize:"13px",fontWeight:"600",cursor:"pointer",textDecoration:"underline",textUnderlineOffset:"3px"}}
          >
            🧭 Not sure what role fits you? Take our 2-minute quiz
          </span>
        </div>
      </div>

      {/* Stats */}
      <div style={{backgroundColor:"#FFFDF9",padding:"28px 60px",display:"flex",justifyContent:"center",gap:"60px",boxShadow:"0 2px 8px rgba(92,64,51,0.06)",flexWrap:"wrap"}}>
        <div style={{textAlign:"center"}}>
          <p style={{fontSize:"24px",fontWeight:"800",color:"#5C4033",margin:"0 0 4px"}}><AnimatedNumber value={12} duration={1200}/>+</p>
          <p style={{color:"#A08D7C",fontSize:"13px",margin:0}}>AI Features</p>
        </div>
        {[
          {n:"Free",l:"Always"},
          {n:"ATS",l:"Score Analysis"},
          {n:"MNC",l:"Interview Prep"}
        ].map((s,i) => (
          <div key={i} style={{textAlign:"center"}}>
            <p style={{fontSize:"24px",fontWeight:"800",color:"#5C4033",margin:"0 0 4px"}}>{s.n}</p>
            <p style={{color:"#A08D7C",fontSize:"13px",margin:0}}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <div id="howitworks" style={{padding:"70px 60px",textAlign:"center",scrollMarginTop:"80px"}}>
        <p style={{color:"#C89B6D",fontWeight:"600",fontSize:"13px",letterSpacing:"1px",marginBottom:"10px"}}>HOW IT WORKS</p>
        <h2 style={{fontSize:"36px",fontWeight:"800",color:"#5C4033",marginBottom:"50px"}}>3 Simple Steps</h2>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"24px",maxWidth:"800px",margin:"0 auto"}}>
          {[
            {step:"01",icon:"📄",title:"Upload Resume",desc:"Upload your PDF resume once. AI extracts everything automatically.",color:"#F0E4D3",accent:"#C89B6D"},
            {step:"02",icon:"🔍",title:"Get Full Analysis",desc:"See ATS score, job matches, salary range, red flags instantly.",color:"#F5EDE0",accent:"#5C4033"},
            {step:"03",icon:"🚀",title:"Get Placed",desc:"Use roadmap, interview prep and cover letters to land your job.",color:"#FBEDD3",accent:"#5C4033"}
          ].map((item,i) => (
            <div key={i} className={`card card-hover animate-fadeUp stagger-${i+1}`} style={{padding:"28px",textAlign:"left"}}>
              <div style={{backgroundColor:item.color,width:"44px",height:"44px",borderRadius:"12px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",marginBottom:"16px"}}>{item.icon}</div>
              <p style={{color:item.accent,fontSize:"11px",fontWeight:"700",letterSpacing:"1px",marginBottom:"6px"}}>STEP {item.step}</p>
              <h3 style={{fontSize:"17px",fontWeight:"700",color:"#5C4033",marginBottom:"8px"}}>{item.title}</h3>
              <p style={{color:"#8D6E63",fontSize:"13px",lineHeight:"1.6",margin:0}}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div id="features" style={{backgroundColor:"#FFFDF9",padding:"70px 60px",scrollMarginTop:"80px"}}>
        <div style={{maxWidth:"1000px",margin:"0 auto"}}>
          <p style={{color:"#C89B6D",fontWeight:"600",fontSize:"13px",letterSpacing:"1px",marginBottom:"10px",textAlign:"center"}}>FEATURES</p>
          <h2 style={{fontSize:"36px",fontWeight:"800",color:"#5C4033",marginBottom:"50px",textAlign:"center"}}>12 Powerful AI Features</h2>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"16px"}}>
            {features.map((f,i) => (
              <div key={i} className={`card-clickable animate-fadeUp stagger-${(i%6)+1}`} style={{display:"flex",gap:"14px",padding:"20px",borderRadius:"14px",border:"1px solid #EFE4D3",alignItems:"flex-start",backgroundColor:"#FFFDF9"}}>
                <div style={{backgroundColor:"#F0E4D3",width:"40px",height:"40px",borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",flexShrink:0}}>{f.icon}</div>
                <div>
                  <h3 style={{fontSize:"14px",fontWeight:"700",color:"#5C4033",marginBottom:"4px"}}>{f.title}</h3>
                  <p style={{color:"#8D6E63",fontSize:"12px",lineHeight:"1.5",margin:0}}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About */}
      <div id="about" style={{padding:"70px 60px",scrollMarginTop:"80px",maxWidth:"800px",margin:"0 auto",textAlign:"center"}}>
        <p style={{color:"#C89B6D",fontWeight:"600",fontSize:"13px",letterSpacing:"1px",marginBottom:"10px"}}>ABOUT</p>
        <h2 style={{fontSize:"36px",fontWeight:"800",color:"#5C4033",marginBottom:"20px"}}>Why InternSight?</h2>
        <p style={{color:"#7A6A5D",fontSize:"16px",lineHeight:"1.8",marginBottom:"16px"}}>
          InternSight was built specifically for engineering and MSc students who are frustrated with generic resume scores that do not tell them what to actually do next.
        </p>
        <p style={{color:"#7A6A5D",fontSize:"16px",lineHeight:"1.8",marginBottom:"16px"}}>
          Unlike Jobscan and Teal HQ which just give you a score, InternSight gives you a complete career intelligence platform — from resume analysis to interview preparation to cover letter generation.
        </p>
        <p style={{color:"#7A6A5D",fontSize:"16px",lineHeight:"1.8"}}>
          Built with FastAPI, React, PostgreSQL and AI-powered NLP as a full-stack MSc project demonstrating real-world software engineering skills.
        </p>
      </div>

      {/* Pricing */}
      <div id="pricing" style={{backgroundColor:"#FFFDF9",padding:"70px 60px",scrollMarginTop:"80px"}}>
        <p style={{color:"#C89B6D",fontWeight:"600",fontSize:"13px",letterSpacing:"1px",marginBottom:"10px",textAlign:"center"}}>PRICING</p>
        <h2 style={{fontSize:"36px",fontWeight:"800",color:"#5C4033",marginBottom:"14px",textAlign:"center"}}>Simple, Honest Pricing</h2>
        <p style={{color:"#8D6E63",fontSize:"15px",textAlign:"center",marginBottom:"46px"}}>No tiers, no paywalls. Everything, for everyone.</p>
        <div className="card card-hover" style={{maxWidth:"420px",margin:"0 auto",padding:"36px",border:"2px solid #C89B6D",position:"relative"}}>
          <div style={{position:"absolute",top:"-14px",left:"50%",transform:"translateX(-50%)",backgroundColor:"#C89B6D",color:"#FFFDF9",padding:"4px 16px",borderRadius:"20px",fontSize:"11px",fontWeight:"700",letterSpacing:"0.5px"}}>MOST POPULAR</div>
          <p style={{color:"#8D6E63",fontSize:"13px",fontWeight:"700",letterSpacing:"1px",marginBottom:"8px",marginTop:"8px"}}>FREE PLAN</p>
          <p style={{fontSize:"44px",fontWeight:"900",color:"#5C4033",margin:"0 0 4px"}}>₹0<span style={{fontSize:"15px",fontWeight:"600",color:"#A08D7C"}}> / forever</span></p>
          <p style={{color:"#8D6E63",fontSize:"13px",marginBottom:"24px"}}>Everything InternSight offers, always free for students.</p>
          <div style={{display:"flex",flexDirection:"column",gap:"12px",marginBottom:"28px"}}>
            {pricingFeatures.map((f,i) => (
              <div key={i} style={{display:"flex",alignItems:"center",gap:"10px"}}>
                <span style={{color:"#22C55E",fontWeight:"700",fontSize:"14px"}}>✓</span>
                <span style={{color:"#5C4A3D",fontSize:"13px"}}>{f}</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/register")} className="btn btn-accent" style={{width:"100%",padding:"14px"}}>Get Started Free →</button>
        </div>
      </div>

      {/* Reviews */}
      <div id="reviews" style={{padding:"70px 60px",scrollMarginTop:"80px"}}>
        <div style={{maxWidth:"1000px",margin:"0 auto"}}>
          <p style={{color:"#C89B6D",fontWeight:"600",fontSize:"13px",letterSpacing:"1px",marginBottom:"10px",textAlign:"center"}}>REVIEWS</p>
          <h2 style={{fontSize:"36px",fontWeight:"800",color:"#5C4033",marginBottom:"50px",textAlign:"center"}}>What Students Say</h2>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"20px"}}>
            {reviews.map((review,i) => (
              <div key={i} className={`card card-hover animate-fadeUp stagger-${(i%6)+1}`} style={{backgroundColor:"#FFFDF9",padding:"22px",border:"1px solid #EFE4D3"}}>
                <div style={{display:"flex",gap:"4px",marginBottom:"10px"}}>
                  {[1,2,3,4,5].map(s => <span key={s} style={{color:"#F59E0B",fontSize:"16px"}}>★</span>)}
                </div>
                <p style={{color:"#5C4A3D",fontSize:"13px",lineHeight:"1.7",marginBottom:"14px",fontStyle:"italic"}}>"{review.review}"</p>
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                  <div style={{width:"36px",height:"36px",backgroundColor:"#5C4033",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:"700",fontSize:"14px",flexShrink:0}}>
                    {review.avatar}
                  </div>
                  <div>
                    <p style={{color:"#5C4033",fontWeight:"700",fontSize:"13px",margin:0}}>{review.name}</p>
                    <p style={{color:"#8D6E63",fontSize:"11px",margin:0}}>{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div id="faq" style={{backgroundColor:"#FFFDF9",padding:"70px 60px",scrollMarginTop:"80px"}}>
        <div style={{maxWidth:"700px",margin:"0 auto"}}>
          <p style={{color:"#C89B6D",fontWeight:"600",fontSize:"13px",letterSpacing:"1px",marginBottom:"10px",textAlign:"center"}}>FAQ</p>
          <h2 style={{fontSize:"36px",fontWeight:"800",color:"#5C4033",marginBottom:"46px",textAlign:"center"}}>Frequently Asked Questions</h2>
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            {faqs.map((item,i) => (
              <div key={i} style={{border:"1px solid #EFE4D3",borderRadius:"14px",overflow:"hidden",backgroundColor:"#FDF8F0"}}>
                <div
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  style={{padding:"18px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}
                >
                  <p style={{color:"#5C4033",fontWeight:"700",fontSize:"14px",margin:0}}>{item.q}</p>
                  <span style={{color:"#C89B6D",fontSize:"18px",fontWeight:"700",transition:"transform 0.25s",transform:openFaq===i?"rotate(45deg)":"rotate(0deg)"}}>+</span>
                </div>
                {openFaq === i && (
                  <div className="animate-fadeIn" style={{padding:"0 22px 18px"}}>
                    <p style={{color:"#8D6E63",fontSize:"13px",lineHeight:"1.7",margin:0}}>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div id="contact" style={{padding:"70px 60px",scrollMarginTop:"80px"}}>
        <div style={{maxWidth:"500px",margin:"0 auto",textAlign:"center"}}>
          <p style={{color:"#C89B6D",fontWeight:"600",fontSize:"13px",letterSpacing:"1px",marginBottom:"10px"}}>CONTACT</p>
          <h2 style={{fontSize:"36px",fontWeight:"800",color:"#5C4033",marginBottom:"12px"}}>Get In Touch</h2>
          <p style={{color:"#8D6E63",fontSize:"15px",marginBottom:"32px"}}>Have questions or feedback? We would love to hear from you.</p>

          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            <input type="text" placeholder="Your Name" className="input"/>
            <input type="email" placeholder="Your Email" className="input"/>
            <textarea placeholder="Your Message" rows={4} className="input" style={{resize:"none"}}/>
            <button className="btn btn-primary" style={{padding:"13px"}}>Send Message</button>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{background:"linear-gradient(135deg, #5C4033 0%, #C89B6D 100%)",padding:"70px 60px",textAlign:"center"}}>
        <h2 style={{fontSize:"40px",fontWeight:"800",color:"white",marginBottom:"12px"}}>Ready to Get Placed?</h2>
        <p style={{color:"rgba(255,255,255,0.8)",fontSize:"17px",marginBottom:"36px"}}>Join thousands of students using InternSight to land their dream internship.</p>
        <button onClick={() => navigate("/register")} style={{backgroundColor:"#FFFDF9",color:"#5C4033",border:"none",padding:"14px 36px",borderRadius:"12px",fontSize:"16px",fontWeight:"700",cursor:"pointer"}}>
          Start Free Analysis →
        </button>
      </div>

      {/* Footer */}
      <footer style={{backgroundColor:"#3D2F25",padding:"56px 60px 28px"}}>
        <div style={{maxWidth:"1100px",margin:"0 auto",display:"grid",gridTemplateColumns:"1.4fr 1fr 1fr 1fr",gap:"32px",marginBottom:"40px"}}>
          <div>
            <img src={logo} alt="InternSight" style={{height:"36px",objectFit:"contain",marginBottom:"14px"}}/>
            <p style={{color:"#B39C89",fontSize:"13px",lineHeight:"1.7",maxWidth:"260px"}}>The complete AI career intelligence platform, built to get students from resume to placed — free, always.</p>
          </div>
          <div>
            <p style={{color:"#F0E4D3",fontWeight:"700",fontSize:"13px",marginBottom:"14px"}}>Product</p>
            {[{label:"Features",id:"features"},{label:"How it works",id:"howitworks"},{label:"Pricing",id:"pricing"}].map(item => (
              <p key={item.id} onClick={() => scrollTo(item.id)} style={{color:"#B39C89",fontSize:"13px",marginBottom:"10px",cursor:"pointer"}}>{item.label}</p>
            ))}
          </div>
          <div>
            <p style={{color:"#F0E4D3",fontWeight:"700",fontSize:"13px",marginBottom:"14px"}}>Company</p>
            {[{label:"About",id:"about"},{label:"Reviews",id:"reviews"},{label:"FAQ",id:"faq"}].map(item => (
              <p key={item.id} onClick={() => scrollTo(item.id)} style={{color:"#B39C89",fontSize:"13px",marginBottom:"10px",cursor:"pointer"}}>{item.label}</p>
            ))}
          </div>
          <div>
            <p style={{color:"#F0E4D3",fontWeight:"700",fontSize:"13px",marginBottom:"14px"}}>Get Started</p>
            <p onClick={() => navigate("/login")} style={{color:"#B39C89",fontSize:"13px",marginBottom:"10px",cursor:"pointer"}}>Login</p>
            <p onClick={() => navigate("/register")} style={{color:"#B39C89",fontSize:"13px",marginBottom:"10px",cursor:"pointer"}}>Create account</p>
            <p onClick={() => scrollTo("contact")} style={{color:"#B39C89",fontSize:"13px",marginBottom:"10px",cursor:"pointer"}}>Contact us</p>
          </div>
        </div>
        <div style={{maxWidth:"1100px",margin:"0 auto",borderTop:"1px solid #4A3728",paddingTop:"20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
          <p style={{color:"#8D7A6A",fontSize:"12px",margin:0}}>Built for MSc Software Systems · AI-Powered Career Intelligence · 2026</p>
          <p style={{color:"#8D7A6A",fontSize:"12px",margin:0}}>© 2026 InternSight. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}

export default Home