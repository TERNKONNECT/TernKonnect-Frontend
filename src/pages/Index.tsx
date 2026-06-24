import { Check, Monitor, FileText, Target, School, GraduationCap, UserCheck, Wrench, Handshake, Briefcase, Award, Globe, BookOpen, Volume2, MessageSquare, Type, Keyboard, Brain, Smartphone } from "lucide-react";

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layouts/MainLayout";
import { api } from "@/services/api";
import type { Course } from "@/types";
import { useTTS } from "@/hooks/useTTS";
import "@/assets/academy.css";

const Index = () => {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("learners");
  const navigate = useNavigate();
  const { speak } = useTTS();

  useEffect(() => {
    api.getFeaturedCourses().then((c) => {
      setFeaturedCourses(c);
      setLoading(false);
    });
  }, []);

  const displayCourses = featuredCourses.slice(0, 6);

  return (
    <MainLayout>
      <div className="academy-page">


  {/* HERO */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero-glow-1"></div>
        <div className="hero-glow-2"></div>
        <div className="hero-content relative z-10">
          <p className="hero-eyebrow animate-fade-up">Ternkonnect Digital Inclusive Academy</p>
          <h1 id="hero-heading" className="animate-fade-up delay-100">
            Learn Without<br /><em>Barriers.</em><br />Thrive Without Limits.
          </h1>
          <p className="hero-sub animate-fade-up delay-200">
            An inclusive learning platform equipping persons with disabilities with digital skills and career opportunities — while helping educators build classrooms where every learner succeeds.
          </p>
          <div className="hero-actions animate-fade-up delay-300">
            <Link to="/login" className="btn-primary">Start Learning →</Link>
            {/* <a href="#educators" className="btn-secondary">Teach for Inclusion</a> */}
          </div>
        </div>
        <div className="hero-visual animate-fade-up delay-400 relative z-10" aria-hidden="true">
      <div className="hero-img-wrap">
        <img
          src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80"
          alt="Diverse team collaborating on inclusive digital education"
          loading="eager"
        />
      </div>
      <div className="hero-badge group cursor-pointer">
        <div className="hero-badge-icon relative">
          <div className="absolute inset-0 bg-teal-400 rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>
          <svg className="relative" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
        </div>
        <div className="hero-badge-text flex-1">
          Accessibility First
          <span>Every course, every learner</span>
        </div>
        <div className="ml-2 w-8 h-8 rounded-full bg-foreground/5 dark:bg-foreground/10 flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </div>
      </div>
    </div>
  </section>



  {/* PARTNERS */}
  <section className="py-12 bg-background border-b border-border/50 overflow-hidden">
    <div className="container px-6">
      <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-10">Our Partners</p>
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14">
        <a href="https://www.wagetech.ng" target="_blank" rel="noopener noreferrer" aria-label="Visit Wagetech website">
          <img src="/wagetech_logo.png" alt="Wagetech Logo" className="h-16 md:h-20 object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 hover:scale-105 transition-all duration-300" />
        </a>
        <a href="#" aria-label="Visit Erilearn website">
          <img src="/erilearn.png" alt="Erilearn Logo" className="h-16 md:h-20 object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 hover:scale-105 transition-all duration-300" />
        </a>
        <a href="#" aria-label="Visit Labspace website">
          <img src="/labspace.png" alt="Labspace Logo" className="h-16 md:h-20 object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 hover:scale-105 transition-all duration-300" />
        </a>
        <a href="#" aria-label="Visit Job Mingle website">
          <img src="/job mingle.png" alt="Job Mingle Logo" className="h-16 md:h-20 object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 hover:scale-105 transition-all duration-300" />
        </a>
        <a href="#" aria-label="Visit NSB Hub website">
          <img src="/nsb hub.png" alt="NSB Hub Logo" className="h-16 md:h-20 object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 hover:scale-105 transition-all duration-300" />
        </a>
      </div>
    </div>
  </section>

  {/* FOR LEARNERS */}
  <section className="for-learners" id="learners" aria-labelledby="learners-heading">
    <p className="section-eyebrow">For Learners</p>
    <h2 className="section-title" id="learners-heading">Learn Digital Skills That Open Doors</h2>
    <p className="section-sub">Accessible, practical, and inclusive — our programmes are built around how you learn, not how others expect you to.</p>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mt-8">
      <div className="rounded-2xl overflow-hidden shadow-2xl relative aspect-square">
        <img
          src="https://images.unsplash.com/photo-1634936564306-8a905be6429a?w=800&q=80"
          alt="Group of diverse learners working on laptops together"
          loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      </div>
      <div>
        <h3 className="font-heading text-3xl font-bold mb-4 text-foreground">What You'll Gain</h3>
        <p className="text-lg text-muted-foreground mb-8">Everything you need to enter, grow, and thrive in the digital economy.</p>
        <ul role="list" className="mt-8">
          <li className="flex items-start gap-4 mb-6">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-1"><Check className="h-5 w-5 text-primary" /></span>
            <span className="text-lg text-foreground leading-relaxed"><strong>Learn digital skills</strong> — practical, in-demand, and accessible from day one</span>
          </li>
          <li className="flex items-start gap-4 mb-6">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-1"><Check className="h-5 w-5 text-primary" /></span>
            <span className="text-lg text-foreground leading-relaxed"><strong>Real-world projects</strong> and portfolio development to showcase your abilities</span>
          </li>
          <li className="flex items-start gap-4 mb-6">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-1"><Check className="h-5 w-5 text-primary" /></span>
            <span className="text-lg text-foreground leading-relaxed"><strong>Career readiness support</strong> — employability coaching and job placement pathways</span>
          </li>
          <li className="flex items-start gap-4 mb-6">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-1"><Check className="h-5 w-5 text-primary" /></span>
            <span className="text-lg text-foreground leading-relaxed"><strong>Freelancing & entrepreneurship</strong> opportunities to work on your own terms</span>
          </li>
          <li className="flex items-start gap-4 mb-6">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-1"><Check className="h-5 w-5 text-primary" /></span>
            <span className="text-lg text-foreground leading-relaxed"><strong>Access to internships and jobs</strong> through our partner network</span>
          </li>
        </ul>
        <div className="cta-inline">
          <Button asChild size="lg" className="rounded-full px-10 py-7 text-lg font-bold mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-0 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"><a href="#join">Learn. Work. Thrive. <span className="ml-2 text-xl">→</span></a></Button>
        </div>
      </div>
    </div>
  </section>

  {/* FOR EDUCATORS */}
  <section className="for-educators" id="educators" aria-labelledby="educators-heading">
    <p className="section-eyebrow">For Educators</p>
    <h2 className="section-title" id="educators-heading">Build Classrooms That Work for Everyone</h2>
    <p className="section-sub">Develop the knowledge, tools, and confidence to create inclusive learning environments where every student can thrive.</p>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mt-8">
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" role="list">
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-all flex flex-col gap-4" role="listitem">
    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><UserCheck className="h-6 w-6 text-primary" /></div>
    <h4 className="font-heading font-bold text-foreground text-lg leading-snug">Disability Awareness & Inclusive Education</h4>
  </div>
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-all flex flex-col gap-4" role="listitem">
    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Monitor className="h-6 w-6 text-primary" /></div>
    <h4 className="font-heading font-bold text-foreground text-lg leading-snug">Assistive Technology for Teaching</h4>
  </div>
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-all flex flex-col gap-4" role="listitem">
    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><FileText className="h-6 w-6 text-primary" /></div>
    <h4 className="font-heading font-bold text-foreground text-lg leading-snug">Accessible Content Creation</h4>
  </div>
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-all flex flex-col gap-4" role="listitem">
    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Target className="h-6 w-6 text-primary" /></div>
    <h4 className="font-heading font-bold text-foreground text-lg leading-snug">Inclusive Teaching Strategies</h4>
  </div>
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-all flex flex-col gap-4" role="listitem">
    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><School className="h-6 w-6 text-primary" /></div>
    <h4 className="font-heading font-bold text-foreground text-lg leading-snug">Leadership for Inclusive Institutions</h4>
  </div>
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-all flex flex-col gap-4" role="listitem">
    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><GraduationCap className="h-6 w-6 text-primary" /></div>
    <h4 className="font-heading font-bold text-foreground text-lg leading-snug">Recognized Certification</h4>
  </div>
        </div>
        <div className="cta-inline" style={{"marginTop":"2rem"}}>
          <Button asChild size="lg" className="rounded-full px-10 py-7 text-lg font-bold mt-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-0 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"><a href="#join">Teach for Inclusion <span className="ml-2 text-xl">→</span></a></Button>
        </div>
      </div>
      <div className="rounded-2xl overflow-hidden shadow-2xl relative aspect-square lg:order-first">
        <img
          src="https://images.unsplash.com/photo-1617056239820-8ce90ba48193?w=800&q=80"
          alt="Educator working with a diverse group of students in an inclusive classroom"
          loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      </div>
    </div>
  </section>

  {/* WHY TERNKONNECT */}
  <section className="why" id="why" aria-labelledby="why-heading">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
      <div>
        <p className="section-eyebrow">Why Ternkonnect Academy?</p>
        <h2 className="section-title" id="why-heading">Designed Around the Learner, Not the System</h2>
        <p className="section-sub">Five pillars that make Ternkonnect different — and keep our learners coming back.</p>
      </div>
      <div className="rounded-2xl overflow-hidden shadow-2xl relative aspect-video lg:aspect-auto lg:h-[400px]">
        <img
          src="https://images.unsplash.com/photo-1541178735493-479c1a27ed24?w=800&q=80"
          alt="Collaborative team working on inclusive digital projects"
          loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="list">
      <div className="bg-card rounded-2xl p-8 border border-border/50 shadow-sm hover:shadow-md transition-all" role="listitem">
    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6"><UserCheck className="h-7 w-7 text-primary" /></div>
    <h3 className="font-heading font-bold text-xl text-foreground mb-3">Accessibility First</h3>
    <p className="text-muted-foreground text-base leading-relaxed">Every course is designed to be accessible and inclusive for diverse learners — from the ground up, not as an afterthought.</p>
  </div>
      <div className="bg-card rounded-2xl p-8 border border-border/50 shadow-sm hover:shadow-md transition-all" role="listitem">
    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6"><Wrench className="h-7 w-7 text-primary" /></div>
    <h3 className="font-heading font-bold text-xl text-foreground mb-3">Practical Learning</h3>
    <p className="text-muted-foreground text-base leading-relaxed">Gain skills that can be applied immediately in education, employment, and entrepreneurship — real work, real impact.</p>
  </div>
      <div className="bg-card rounded-2xl p-8 border border-border/50 shadow-sm hover:shadow-md transition-all" role="listitem">
    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6"><Handshake className="h-7 w-7 text-primary" /></div>
    <h3 className="font-heading font-bold text-xl text-foreground mb-3">Personalized Support</h3>
    <p className="text-muted-foreground text-base leading-relaxed">Access learning accommodations, assistive technologies, and one-on-one guidance tailored to your needs.</p>
  </div>
      <div className="bg-card rounded-2xl p-8 border border-border/50 shadow-sm hover:shadow-md transition-all" role="listitem">
    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6"><Briefcase className="h-7 w-7 text-primary" /></div>
    <h3 className="font-heading font-bold text-xl text-foreground mb-3">Career & Economic Pathways</h3>
    <p className="text-muted-foreground text-base leading-relaxed">Connect learning with real employment, freelancing opportunities, and business development support.</p>
  </div>
      <div className="bg-card rounded-2xl p-8 border border-border/50 shadow-sm hover:shadow-md transition-all" role="listitem">
    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6"><Award className="h-7 w-7 text-primary" /></div>
    <h3 className="font-heading font-bold text-xl text-foreground mb-3">Recognized Certification</h3>
    <p className="text-muted-foreground text-base leading-relaxed">Earn certificates that credibly showcase your skills and achievements to employers and partners.</p>
  </div>
      <div className="bg-card rounded-2xl p-8 border border-border/50 shadow-sm hover:shadow-md transition-all" role="listitem">
    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6"><Globe className="h-7 w-7 text-primary" /></div>
    <h3 className="font-heading font-bold text-xl text-foreground mb-3">Community-Led Growth</h3>
    <p className="text-muted-foreground text-base leading-relaxed">Learn alongside a growing network of inclusive learners, educators, and organizations across Nigeria.</p>
  </div>
    </div>
  </section>

  {/* WHO WE SERVE */}
  <section className="who-serve" aria-labelledby="serve-heading">
    <p className="section-eyebrow">Who We Serve</p>
    <h2 className="section-title" id="serve-heading">Built for Learners and Leaders Alike</h2>
    <p className="section-sub">Whether you're building your career or building more inclusive institutions — there's a place for you here.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
      <div className="bg-card rounded-2xl border border-border/50 shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow">
        <div className="aspect-[4/3] w-full relative">
          <img
            src="https://images.unsplash.com/photo-1623743995364-03fbd84dbaf3?w=700&q=80"
            alt="Young person using assistive technology on a computer"
            loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        </div>
        <div className="p-8 md:p-10 flex-1 bg-card">
          <h3 className="font-heading font-bold text-2xl text-foreground mb-6">Learners</h3>
          <ul className="flex flex-col gap-4" role="list">
            <li className="flex items-center gap-3 text-lg text-foreground"><span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>Persons with visual impairments</li>
            <li className="flex items-center gap-3 text-lg text-foreground"><span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>Persons with hearing impairments</li>
            <li className="flex items-center gap-3 text-lg text-foreground"><span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>Persons with learning disabilities</li>
            <li className="flex items-center gap-3 text-lg text-foreground"><span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>Youth seeking digital opportunities</li>
          </ul>
        </div>
      </div>
      <div className="bg-card rounded-2xl border border-border/50 shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow">
        <div className="aspect-[4/3] w-full relative">
          <img
            src="https://images.unsplash.com/photo-1526253038957-bce54e05968e?w=700&q=80"
            alt="Educators collaborating in a professional training setting"
            loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        </div>
        <div className="p-8 md:p-10 flex-1 bg-card">
          <h3 className="font-heading font-bold text-2xl text-foreground mb-6">Educators & Organizations</h3>
          <ul className="flex flex-col gap-4" role="list">
            <li className="flex items-center gap-3 text-lg text-foreground"><span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>Teachers and trainers</li>
            <li className="flex items-center gap-3 text-lg text-foreground"><span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>School leaders and administrators</li>
            <li className="flex items-center gap-3 text-lg text-foreground"><span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>Educational institutions</li>
            <li className="flex items-center gap-3 text-lg text-foreground"><span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>NGOs and disability-focused organizations</li>
          </ul>
        </div>
      </div>
    </div>
  </section>


          {/* COURSES SECTION REMOVED */}
  {/* MISSION */}
  <section className="mission" aria-labelledby="mission-heading">
    <p className="section-eyebrow" style={{"color":"var(--text-muted)","justifyContent":"center"}}>Our Mission</p>
    <p className="text-2xl md:text-4xl font-heading font-extrabold text-foreground leading-snug max-w-4xl mx-auto text-center mb-10">
      To create a world where <span className="text-primary">disability is never a barrier</span> to learning, employment, or opportunity — by providing accessible education, assistive technology, and pathways to economic empowerment.
    </p>
    <div className="flex justify-center mt-8">
      <Button asChild size="lg" className="rounded-full px-10 py-7 text-lg font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-0 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
        <a href="#join">Join the Movement <span className="ml-2 text-xl">→</span></a>
      </Button>
    </div>
  </section>

  {/* ASSISTIVE TOOLS */}
  <section style={{"background":"var(--white)", "color":"var(--ink)"}} id="assistive-tools" aria-labelledby="tools-heading">
    <p className="section-eyebrow" style={{"color":"var(--teal)"}}>Ternkonnect Assistive Tools</p>
    <h2 className="section-title" id="tools-heading" style={{"color":"var(--ink)"}}>Technology That Removes the Barrier</h2>
    <p className="section-sub" style={{"color":"rgba(255,255,255,0.65)"}}>Our built-in assistive tools ensure every learner can access, engage with, and complete their training — regardless of disability type.</p>
    <div style={{"display":"grid","gridTemplateColumns":"repeat(3,1fr)","gap":"1.5rem","marginTop":"3rem"}}>
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"><div style={{"marginBottom":"1rem"}}><Volume2 className="h-12 w-12 text-primary" /></div><h3 className="font-heading text-lg font-bold mb-2 text-foreground">Screen Reader Support</h3><p className="text-base text-muted-foreground leading-relaxed">Full compatibility with NVDA, JAWS, and VoiceOver so visually impaired learners navigate every course.</p></div>
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"><div style={{"marginBottom":"1rem"}}><MessageSquare className="h-12 w-12 text-primary" /></div><h3 className="font-heading text-lg font-bold mb-2 text-foreground">Closed Captions &amp; Transcripts</h3><p className="text-base text-muted-foreground leading-relaxed">Every video includes accurate captions and downloadable transcripts for deaf and hard-of-hearing learners.</p></div>
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"><div style={{"marginBottom":"1rem"}}><Type className="h-12 w-12 text-primary" /></div><h3 className="font-heading text-lg font-bold mb-2 text-foreground">Adjustable Reading Tools</h3><p className="text-base text-muted-foreground leading-relaxed">Font size, spacing, dyslexia-friendly typefaces, and high-contrast modes for learners with reading disabilities.</p></div>
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"><div style={{"marginBottom":"1rem"}}><Keyboard className="h-12 w-12 text-primary" /></div><h3 className="font-heading text-lg font-bold mb-2 text-foreground">Keyboard-Only Navigation</h3><p className="text-base text-muted-foreground leading-relaxed">Every feature is fully accessible by keyboard alone — no mouse required.</p></div>
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"><div style={{"marginBottom":"1rem"}}><Brain className="h-12 w-12 text-primary" /></div><h3 className="font-heading text-lg font-bold mb-2 text-foreground">Cognitive Load Controls</h3><p className="text-base text-muted-foreground leading-relaxed">Simplified layouts, chunked content, and progress checkpoints designed for neurodivergent learners.</p></div>
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"><div style={{"marginBottom":"1rem"}}><Smartphone className="h-12 w-12 text-primary" /></div><h3 className="font-heading text-lg font-bold mb-2 text-foreground">Mobile-First Access</h3><p className="text-base text-muted-foreground leading-relaxed">Optimised for low-bandwidth mobile devices, ensuring access beyond desktop environments.</p></div>
    </div>
  </section>

  {/* IMPACT */}
  <section style={{"background":"var(--grey)", "color":"var(--ink)"}} id="impact" aria-labelledby="impact-heading">
    <p className="section-eyebrow">Impact</p>
    <h2 className="section-title" id="impact-heading">Changing Lives, One Learner at a Time</h2>
    <p className="section-sub">Real outcomes for real people — across Nigeria and beyond.</p>
    {/* 
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
      <div className="bg-card rounded-2xl p-8 text-center shadow-sm border border-border/50"><div className="font-heading text-5xl font-extrabold text-primary tracking-tight">500+</div><div className="text-sm md:text-base text-muted-foreground mt-2 font-medium">Learners on Waitlist</div></div>
      <div className="bg-card rounded-2xl p-8 text-center shadow-sm border border-border/50"><div className="font-heading text-5xl font-extrabold text-primary tracking-tight">7</div><div className="text-sm md:text-base text-muted-foreground mt-2 font-medium">Digital Skill Tracks</div></div>
      <div className="bg-card rounded-2xl p-8 text-center shadow-sm border border-border/50"><div className="font-heading text-5xl font-extrabold text-primary tracking-tight">3+</div><div className="text-sm md:text-base text-muted-foreground mt-2 font-medium">Institutional Pilot Partners</div></div>
      <div className="bg-card rounded-2xl p-8 text-center shadow-sm border border-border/50"><div className="font-heading text-5xl font-extrabold text-primary tracking-tight">100%</div><div className="text-sm md:text-base text-muted-foreground mt-2 font-medium">Accessibility Compliant</div></div>
    </div>
    */}
    <div className="mt-8 bg-card rounded-2xl p-8 md:p-12 border-l-4 border-primary shadow-sm border border-border/50">
      <p className="font-heading text-xl md:text-2xl font-bold leading-relaxed text-foreground mb-4">"Ternkonnect gave me a pathway into tech that actually worked with my disability — not around it."</p>
      <p className="text-base text-muted-foreground">— Early learner, Data Entry &amp; Virtual Assistance cohort</p>
    </div>
  </section>

  {/* OUR STORY */}
  <section style={{"background":"var(--white)", "color":"var(--ink)"}} id="about" aria-labelledby="about-heading">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
      <div>
        <p className="section-eyebrow">Our Story</p>
        <h2 className="section-title" id="about-heading">Built From the Ground Up — With Inclusion at the Core</h2>
        <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6">Ternkonnect was founded on a simple but urgent belief: that disability should never determine someone's access to education, employment, or economic opportunity. In Nigeria, millions of persons with disabilities are locked out of the digital economy — not because of their abilities, but because the systems were not designed for them.</p>
        <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6">We started Ternkonnect to change that — with accessible digital skills training, assistive technology, and direct pathways to jobs and entrepreneurship. We work with learners, educators, schools, and NGOs to build an ecosystem where inclusion is the standard, not the exception.</p>
        <p className="text-muted-foreground text-base md:text-lg leading-relaxed">We are pre-launch and growing fast — with institutional pilots underway and a community of learners ready to begin.</p>
      </div>
      <div style={{"borderRadius":"20px","overflow":"hidden","aspectRatio":"4/5"}}><img src="https://images.unsplash.com/photo-1634951401794-6c84f593db82?w=800&amp;q=80" alt="African student learning digital skills" loading="lazy" style={{"width":"100%","height":"100%","objectFit":"cover"}} /></div>
    </div>
  </section>

  {/* JOIN CTA */}
  <section className="join" id="join" aria-labelledby="join-heading">
    <div className="join-img">
      <img
        src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80"
        alt="Diverse group of professionals working together on digital skills"
        loading="lazy" />
    </div>
    <div className="join-content">
      <p className="section-eyebrow">Join the Academy</p>
      <h2 className="section-title" id="join-heading">Your Journey Starts Here</h2>
      <p>
        Whether you're looking to build digital skills, access career opportunities, or create more inclusive learning environments — Ternkonnect Digital Inclusive Academy is here to support your journey.
      </p>
      <div className="join-actions">
        <Button asChild size="lg" className="rounded-full px-8 py-6 text-base font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-0 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"><a href="#learners">I'm a Learner →</a></Button>
        {/* <Button asChild variant="outline" size="lg" className="rounded-full px-8 py-6 text-base font-bold bg-transparent border-2 border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400 hover:bg-purple-600/10 dark:hover:bg-purple-400/10 shadow-md hover:shadow-lg transition-all duration-300"><a href="#educators">I'm an Educator</a></Button> */}
      </div>
    </div>
  </section>


      </div>
    </MainLayout>
  );
};
export default Index;
