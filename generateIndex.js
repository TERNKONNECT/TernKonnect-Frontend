const fs = require('fs');

const oldIndex = fs.readFileSync('src/pages/Index.tsx', 'utf8');
const html = fs.readFileSync('ternkonnect-academy.html', 'utf8');

const mainMatch = html.match(/<main id="main">([\s\S]*?)<\/main>/);
if (!mainMatch) throw new Error("No main found");
let mainHtml = mainMatch[1];

// Convert class to className
mainHtml = mainHtml.replace(/class="/g, 'className="');
mainHtml = mainHtml.replace(/for="/g, 'htmlFor="');

// Fix self-closing tags (img, br, input)
mainHtml = mainHtml.replace(/<img([^>]*[^/])>/g, '<img$1 />');
mainHtml = mainHtml.replace(/<br([^>]*[^/])>/g, '<br />');

// Remove static course grids and keep tabs, we will replace course grid with dynamic map
// This is complex, let's just do simple replacements.

// Find courses section
mainHtml = mainHtml.replace(/<!-- COURSES -->[\s\S]*?<!-- MISSION -->/, `{/* COURSES WILL GO HERE */}\n  <!-- MISSION -->`);

// Convert inline styles
mainHtml = mainHtml.replace(/style="([^"]*)"/g, (match, styles) => {
    let obj = {};
    styles.split(';').forEach(s => {
        if(!s.trim()) return;
        let [k,v] = s.split(':');
        if(!k || !v) return;
        k = k.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
        obj[k] = v.trim();
    });
    return `style={${JSON.stringify(obj)}}`;
});

// We'll replace the old JSX between <MainLayout> and </MainLayout> with mainHtml
const headerContent = `
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

  useEffect(() => {
    api.getFeaturedCourses().then((c) => {
      setFeaturedCourses(c);
      setLoading(false);
    });
  }, []);

  const displayCourses = activeTab === "learners" 
    ? featuredCourses.slice(0, 6) 
    : featuredCourses.slice(6, 12);

  return (
    <MainLayout>
      <div className="academy-page">
`;

const footerContent = `
      </div>
    </MainLayout>
  );
};
export default Index;
`;

fs.writeFileSync('src/pages/Index.tsx.new', headerContent + mainHtml + footerContent);
console.log("Index generated to Index.tsx.new");
