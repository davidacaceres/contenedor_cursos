
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Users, Clock, Search, TrendingUp } from 'lucide-react';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  thumbnail?: string | null;
  level?: string | null;
  estimatedHours?: number | null;
  instructor: {
    name: string | null;
  };
  _count: {
    enrollments: number;
  };
  courses: any[];
}

interface LearningPathCatalogProps {
  learningPaths: LearningPath[];
}

export default function LearningPathCatalog({ learningPaths }: LearningPathCatalogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  const filteredPaths = learningPaths.filter((path) => {
    const matchesSearch = path.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      path.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'all' || path.level === levelFilter || !path.level;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar rutas de aprendizaje..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filtrar por nivel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los niveles</SelectItem>
            <SelectItem value="Principiante">Principiante</SelectItem>
            <SelectItem value="Intermedio">Intermedio</SelectItem>
            <SelectItem value="Avanzado">Avanzado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {filteredPaths.length} {filteredPaths.length === 1 ? 'ruta encontrada' : 'rutas encontradas'}
      </div>

      {/* Learning Paths Grid */}
      {filteredPaths.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No se encontraron rutas</h2>
            <p className="text-muted-foreground text-center">
              Intenta ajustar tus filtros de búsqueda
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPaths.map((path) => (
            <Card key={path.id} className="hover:shadow-lg transition-all duration-200">
              <CardHeader className="p-0">
                {path.thumbnail ? (
                  <div className="relative w-full aspect-video rounded-t-lg overflow-hidden bg-muted">
                    <img
                      src={path.thumbnail}
                      alt={path.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="relative w-full aspect-video rounded-t-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <TrendingUp className="h-16 w-16 text-primary opacity-20" />
                  </div>
                )}
              </CardHeader>
              <div className="p-6">
                <CardTitle className="line-clamp-2 mb-2">{path.title}</CardTitle>
                <CardDescription className="line-clamp-3 mb-4">
                  {path.description}
                </CardDescription>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{path.courses.length} cursos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{path._count.enrollments} estudiantes inscritos</span>
                  </div>
                  {path.estimatedHours && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>~{path.estimatedHours} horas totales</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">
                    Por {path.instructor.name}
                  </span>
                  {path.level && (
                    <Badge variant="secondary">{path.level}</Badge>
                  )}
                </div>

                <Link href={`/student/learning-paths/${path.id}`} className="block">
                  <Button className="w-full">Ver Ruta</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
