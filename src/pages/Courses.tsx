import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import MainLayout from '@/components/layouts/MainLayout';
import CourseCard from '@/components/CourseCard';
import { api } from '@/services/api';
import { CATEGORIES } from '@/types';
import type { Course } from '@/types';

const Courses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

  useEffect(() => {
    setLoading(true);
    api.searchCourses(query, selectedCategory || undefined).then((c) => { setCourses(c); setLoading(false); });
  }, [query, selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedCategory) params.set('category', selectedCategory);
    setSearchParams(params);
  };

  const toggleCategory = (cat: string) => {
    const next = selectedCategory === cat ? '' : cat;
    setSelectedCategory(next);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (next) params.set('category', next);
    setSearchParams(params);
  };

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8">
          {/* <h1 className="text-3xl font-bold mb-2">Explore Academy</h1> */}
          <p className="text-muted-foreground">Find the perfect course to advance your skills</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search courses..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <Button type="submit" className="gradient-primary border-0 text-white">
              <SlidersHorizontal className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Search</span>
            </Button>
          </form>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => toggleCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
          {selectedCategory && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => toggleCategory('')}>
              ✕ Clear filter
            </Badge>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}><Skeleton className="aspect-video" /><CardContent className="p-4 space-y-3"><Skeleton className="h-4 w-20" /><Skeleton className="h-5 w-full" /><Skeleton className="h-3 w-32" /></CardContent></Card>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <Search className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No courses found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
            <Button variant="outline" onClick={() => { setQuery(''); setSelectedCategory(''); setSearchParams({}); }}>Clear all filters</Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">{courses.length} course{courses.length !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => <CourseCard key={course.id} course={course} />)}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Courses;
