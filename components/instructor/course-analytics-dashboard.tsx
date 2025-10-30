
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Award,
  TrendingUp,
  BookOpen,
  MessageSquare,
  FileText,
  CheckCircle,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface CourseAnalyticsProps {
  courseId: string;
}

interface AnalyticsData {
  course: {
    id: string;
    title: string;
    totalLessons: number;
    totalModules: number;
  };
  overview: {
    totalEnrollments: number;
    totalCertificates: number;
    completionRate: number;
    averageProgress: string;
    averageQuizScore: string;
    averageAssignmentScore: string;
    totalSubmissions: number;
    totalComments: number;
  };
  enrollmentsByMonth: { [key: string]: number };
  quizScoreDistribution: { [key: string]: number };
  topStudents: Array<{
    userId: string;
    name: string;
    email: string;
    lessonsCompleted: number;
    progressPercentage: string;
    hasCertificate: boolean;
  }>;
  recentActivity: Array<{
    type: string;
    date: string;
    description: string;
  }>;
  weeklyEngagement: { [key: string]: { submissions: number; comments: number; progress: number } };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function CourseAnalyticsDashboard({ courseId }: CourseAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [courseId]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/analytics`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error al cargar analíticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No se pudieron cargar las analíticas del curso.</p>
      </div>
    );
  }

  // Preparar datos para gráficos
  const enrollmentData = Object.entries(analytics.enrollmentsByMonth).map(([month, count]) => ({
    month,
    inscripciones: count,
  }));

  const scoreDistributionData = Object.entries(analytics.quizScoreDistribution).map(([range, count]) => ({
    name: range,
    value: count,
  }));

  const engagementData = Object.entries(analytics.weeklyEngagement).map(([week, data]) => ({
    semana: week,
    envíos: data.submissions,
    comentarios: data.comments,
    progreso: data.progress,
  }));

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Inscripciones</p>
                <p className="text-3xl font-bold text-blue-600">{analytics.overview.totalEnrollments}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa de Finalización</p>
                <p className="text-3xl font-bold text-green-600">{analytics.overview.completionRate}%</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <Award className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progreso Promedio</p>
                <p className="text-3xl font-bold text-purple-600">{analytics.overview.averageProgress}%</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Calif. Promedio Quizzes</p>
                <p className="text-3xl font-bold text-yellow-600">{analytics.overview.averageQuizScore}%</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                <CheckCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different analytics views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="students">Estudiantes</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enrollments by Month */}
            <Card>
              <CardHeader>
                <CardTitle>Inscripciones por Mes</CardTitle>
                <CardDescription>Últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={enrollmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="inscripciones" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quiz Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Calificaciones (Quizzes)</CardTitle>
                <CardDescription>Rangos de puntuación</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={scoreDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {scoreDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentActivity.length > 0 ? (
                  analytics.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 pb-3 border-b last:border-b-0">
                      <div className="flex-shrink-0 mt-1">
                        {activity.type === 'enrollment' && (
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                        {activity.type === 'certificate' && (
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <Award className="h-4 w-4 text-green-600" />
                          </div>
                        )}
                        {activity.type === 'submission' && (
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-purple-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.date).toLocaleString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-600 text-center py-4">No hay actividad reciente</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Estudiantes por Progreso</CardTitle>
              <CardDescription>Estudiantes con mayor avance en el curso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topStudents.length > 0 ? (
                  analytics.topStudents.map((student, index) => (
                    <div key={student.userId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{student.progressPercentage}%</p>
                        <p className="text-sm text-gray-600">
                          {student.lessonsCompleted} / {analytics.course.totalLessons} lecciones
                        </p>
                        {student.hasCertificate && (
                          <Badge className="mt-1 bg-green-600 hover:bg-green-700">
                            <Award className="h-3 w-3 mr-1" />
                            Certificado
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-600 text-center py-4">No hay estudiantes inscritos aún</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-2">Promedio Quizzes</p>
                  <p className="text-4xl font-bold text-blue-600">{analytics.overview.averageQuizScore}%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-2">Promedio Tareas</p>
                  <p className="text-4xl font-bold text-green-600">{analytics.overview.averageAssignmentScore}%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-2">Certificados Emitidos</p>
                  <p className="text-4xl font-bold text-purple-600">{analytics.overview.totalCertificates}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribución de Calificaciones</CardTitle>
              <CardDescription>Rendimiento general de los estudiantes en quizzes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scoreDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#3b82f6" name="Cantidad de estudiantes" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Envíos</p>
                    <p className="text-3xl font-bold text-blue-600">{analytics.overview.totalSubmissions}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Comentarios</p>
                    <p className="text-3xl font-bold text-green-600">{analytics.overview.totalComments}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <MessageSquare className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Lecciones Completadas</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {Object.values(analytics.weeklyEngagement).reduce((sum, w) => sum + w.progress, 0)}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Semanal</CardTitle>
              <CardDescription>Actividad de estudiantes en las últimas 8 semanas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="semana" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="envíos" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="comentarios" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="progreso" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
