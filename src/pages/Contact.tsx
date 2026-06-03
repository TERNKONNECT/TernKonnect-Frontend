import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import MainLayout from "@/components/layouts/MainLayout";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <MainLayout>
      {/* ── Hero ── */}
      {/* <section className="relative overflow-hidden">
        <div className="relative h-[280px] sm:h-[340px] w-full">
          <img
            src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1400&auto=format&fit=crop&q=80"
            alt="Team collaborating"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70">
              Get In Touch
            </p>
            <h1 className="text-[1.65rem] leading-[1.2] sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white max-w-2xl">
              Request a <span className="">Demo</span>
            </h1>
            <p className="text-[0.88rem] sm:text-base text-white/80 max-w-md leading-relaxed">
              Tell us about yourself and we'll get back to you shortly.
            </p>
          </div>
        </div>
      </section> */}

      {/* ── Form ── */}
      <section className="py-12 md:py-20 container max-w-5xl mx-auto px-4 pb-16">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start">
          {/* Left: info */}
          <div className="w-full md:w-2/5 space-y-5 flex-shrink-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
              Why reach out?
            </p>
            <h2 className="text-[1.2rem] sm:text-2xl font-extrabold leading-snug">
              Let's build something{" "}
              <span className="text-gradient">inclusive together</span>
            </h2>
            <p className="text-[0.85rem] sm:text-base text-muted-foreground leading-relaxed">
              Whether you want a live demo of our accessibility tools, have
              questions about the Digital Inclusive Academy, or want to explore
              a partnership, we'd love to hear from you.
            </p>
            <ul className="space-y-2.5">
              {[
                "Live demo of our AI accessibility tools",
                "Academy training for your team or institution",
                "API integration into your EdTech platform",
                "Partnership and collaboration inquiries",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-[7px] h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-[0.82rem] sm:text-sm text-muted-foreground leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: form */}
          <div className="w-full md:flex-1 rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center space-y-4 py-10">
                <CheckCircle className="h-12 w-12 text-primary" />
                <h3 className="text-lg font-bold">Message sent!</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Thanks,{" "}
                  <span className="font-medium text-foreground">
                    {form.name}
                  </span>
                  . We've received your message and will be in touch soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-sm font-medium">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us what you're looking for..."
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    required
                    className="resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  className="gradient-primary border-0 text-white font-semibold w-full gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
