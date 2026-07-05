import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { certificatesApi } from "@/api/certificates";
import { BookOpen, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CertificatePage() {
  const { certificateId } = useParams<{ certificateId: string }>();

  const { data: cert, isLoading, isError } = useQuery({
    queryKey: ["certificate", certificateId],
    queryFn: () => certificatesApi.verifyCertificate(certificateId as string),
    enabled: !!certificateId,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-muted-foreground animate-pulse flex flex-col items-center gap-4">
          <BookOpen className="h-10 w-10 text-primary" />
          <span>Verifying Certificate...</span>
        </div>
      </div>
    );
  }

  if (isError || !cert || !cert.valid) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Certificate Not Found</h2>
          <p className="text-slate-500">
            We couldn't find a valid certificate with the ID: <br/>
            <span className="font-mono font-medium text-slate-700">{certificateId}</span>
          </p>
          <div className="pt-6">
            <Link to="/">
              <Button className="w-full">Return to Homepage</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(cert.issuedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Back button (mostly for navigation if they came from MyLearning) */}
      <div className="w-full max-w-[1000px] mb-6 flex justify-start">
        <Link to="/my-learning">
          <Button variant="ghost" className="gap-2 text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="relative bg-white w-full max-w-[1000px] aspect-[10/7] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col items-center text-center">
        {/* Borders */}
        <div className="absolute top-5 left-5 right-5 bottom-5 border-4 border-slate-800 z-10 pointer-events-none"></div>
        <div className="absolute top-8 left-8 right-8 bottom-8 border border-slate-400 z-10 pointer-events-none"></div>

        {/* Background Accents */}
        <div className="absolute -top-[150px] -left-[150px] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(99,102,241,0.1)_0%,rgba(255,255,255,0)_70%)] rounded-full z-0"></div>
        <div className="absolute -bottom-[200px] -right-[200px] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(236,72,153,0.05)_0%,rgba(255,255,255,0)_70%)] rounded-full z-0"></div>

        {/* Content */}
        <div className="relative z-20 w-full h-full p-16 flex flex-col items-center justify-center">
          
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 flex items-center justify-center text-indigo-500">
              <BookOpen className="h-10 w-10" />
            </div>
            <div className="text-2xl font-extrabold text-slate-800 tracking-wide uppercase bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
              TERNKONNECT
            </div>
          </div>

          <div className="text-5xl md:text-6xl text-slate-900 my-2 tracking-[0.2em] uppercase font-serif">Certificate</div>
          <div className="text-sm md:text-base text-slate-500 tracking-[0.2em] uppercase mb-10 font-semibold">of Completion</div>

          <div className="text-lg text-slate-600 mb-2 italic">This is proudly presented to</div>
          
          <div className="text-5xl md:text-6xl text-slate-800 font-semibold italic my-2 pb-2 border-b-2 border-slate-200 w-4/5 leading-tight font-serif">
            {cert.user.name}
          </div>

          <div className="text-base text-slate-600 my-6 leading-relaxed max-w-2xl">
            For successfully completing all requirements, coursework, and assessments in the designated program of study.
          </div>

          <div className="text-3xl text-indigo-500 font-bold mb-12 tracking-wide font-serif">
            {cert.course.title}
          </div>

          <div className="flex justify-between w-full mt-auto pt-6 px-12">
            <div className="text-center w-48">
              <div className="border-b border-slate-800 h-10 mb-2 text-2xl text-slate-900 leading-10 opacity-80 font-serif">TernKonnect</div>
              <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Academy Lead</div>
            </div>
            
            <div className="text-center w-48">
              <div className="border-b border-slate-800 h-10 mb-2 text-xl text-slate-900 leading-10 opacity-80 font-serif">{formattedDate}</div>
              <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Date Issued</div>
            </div>
          </div>

          {/* Gold Seal */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(217,119,6,0.4)] relative">
              <div className="absolute inset-1 border border-dashed border-white/60 rounded-full"></div>
              <div className="text-white text-xs font-bold text-center leading-tight font-serif uppercase z-10 drop-shadow-md">
                Official<br/>Verified
              </div>
            </div>
          </div>

        </div>

        {/* Meta Info (Verify ID) */}
        <div className="absolute bottom-4 right-10 text-[10px] text-slate-400 text-right z-30">
          Certificate ID: {cert.certificateId}
        </div>
      </div>
      
      {/* Print Button */}
      <div className="mt-8">
        <Button onClick={() => window.print()} variant="outline" className="gap-2">
          Download / Print Certificate
        </Button>
      </div>

    </div>
  );
}
