import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Upload from "./pages/Upload"
import Dashboard from "./pages/Dashboard"
import Results from "./pages/Results"
import Roadmap from "./pages/Roadmap"
import Jobs from "./pages/Jobs"
import BulletImprover from "./pages/BulletImprover"
import RedFlags from "./pages/RedFlags"
import Recruiter from "./pages/Recruiter"
import Interview from "./pages/Interview"
import Salary from "./pages/Salary"
import JDAnalyzer from "./pages/JDAnalyzer"
import SelfIntro from "./pages/SelfIntro"
import CoverLetter from "./pages/CoverLetter"
import TimeMachine from "./pages/TimeMachine"
import ResumeChat from "./pages/ResumeChat"
import Settings from "./pages/Settings"
import ResumeBuilder from "./pages/ResumeBuilder"
import CareerDiscovery from "./pages/CareerDiscovery"
import ResumeVersions from "./pages/Resumeversions"
import CompareVersions from "./pages/Compareversions"
import Portfolio from "./pages/Portfolio"
import SkillGapAnalysis from "./pages/Skillgapanalysis"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/results/:id" element={<Results />} />
      <Route path="/roadmap/:id/:role" element={<Roadmap />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/bullet-improver" element={<BulletImprover />} />
      <Route path="/red-flags" element={<RedFlags />} />
      <Route path="/recruiter" element={<Recruiter />} />
      <Route path="/interview/:id" element={<Interview />} />
      <Route path="/salary" element={<Salary />} />
      <Route path="/jd-analyzer" element={<JDAnalyzer />} />
      <Route path="/self-intro" element={<SelfIntro />} />
      <Route path="/cover-letter" element={<CoverLetter />} />
      <Route path="/time-machine" element={<TimeMachine />} />
      <Route path="/resume-chat" element={<ResumeChat />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/resume-builder" element={<ResumeBuilder />} />
      <Route path="/career-discovery" element={<CareerDiscovery />} />
      <Route path="/resume-versions" element={<ResumeVersions />} />
      <Route path="/resume-versions/compare/:idA/:idB" element={<CompareVersions />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/skill-gap" element={<SkillGapAnalysis />} />
    </Routes>
  )
}

export default App