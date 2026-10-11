'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/layout/admin-shell';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { TAMIL_NADU_DISTRICTS } from '@shasthi-guru/shared';
import {
  Search,
  Users,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Award,
  FileText,
  Clock,
  Filter,
} from 'lucide-react';

interface StudentItem {
  id: string;
  firstName: string;
  phone: string;
  email: string;
  address?: string | null;
  district: string;
  areaOfInterest?: string | null;
  mark12th?: string | null;
  aadhaarMasked?: string | null;
  createdAt: string;
  program?: {
    id: string;
    name: string;
    degreeLevel: string;
  } | null;
  _count?: {
    enquiries: number;
    followUps: number;
  };
}

const AREA_OPTIONS = [
  { value: '', label: 'All Interest Areas' },
  { value: 'Engineering & Technology', label: 'Engineering & Technology' },
  { value: 'Medicine & Allied Health', label: 'Medicine & Allied Health' },
  { value: 'Arts & Science', label: 'Arts & Science' },
  { value: 'Agriculture & Veterinary', label: 'Agriculture & Veterinary' },
  { value: 'Management & Law', label: 'Management & Law' },
  { value: 'Polytechnic & Diploma', label: 'Polytechnic & Diploma' },
];

export default function AdminStudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [areaOfInterest, setAreaOfInterest] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 20, page: 1 });

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '15');
      if (search.trim()) params.set('search', search.trim());
      if (district) params.set('district', district);
      if (areaOfInterest) params.set('areaOfInterest', areaOfInterest);

      const res = await fetch(`/api/admin/students?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 401) throw new Error('Session expired. Please log in again.');
        if (res.status === 403) throw new Error('Access denied. Counselor or Admin privileges required.');
        throw new Error('Failed to load student profiles.');
      }

      const json = await res.json();
      if (json.success && json.data) {
        setStudents(json.data.students || []);
        if (json.data.pagination) {
          setPagination(json.data.pagination);
        }
      } else {
        setStudents([]);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while fetching students.');
    } finally {
      setLoading(false);
    }
  }, [page, search, district, areaOfInterest]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleResetFilters = () => {
    setSearch('');
    setDistrict('');
    setAreaOfInterest('');
    setPage(1);
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Student Directory</h1>
              <Badge variant="outline" className="text-xs bg-brand-50 text-brand-700 border-brand-200">
                {pagination.total} {pagination.total === 1 ? 'Record' : 'Records'}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {user?.role === 'COUNSELOR'
                ? 'Showing students enrolled in your assigned counselling caseload.'
                : 'Central repository of students, academic records, and career aspirations across Tamil Nadu.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchStudents()}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/admin/enquiries">
              <Button size="sm" className="bg-brand-600 hover:bg-brand-700 text-white gap-2">
                <FileText className="h-4 w-4" />
                View Enquiries
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Insights Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-brand-600 shadow-sm bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Students</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{pagination.total}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-emerald-600 shadow-sm bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">District Reach</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">
                  {new Set(students.map((s) => s.district).filter(Boolean)).size || 'Tamil Nadu'}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <MapPin className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-amber-600 shadow-sm bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Aadhaar Guard</p>
                <p className="text-2xl font-bold text-amber-700 mt-1">100%</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-blue-600 shadow-sm bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Counselling Role</p>
                <p className="text-sm font-bold text-blue-700 mt-2 truncate">{user?.role?.replace('_', ' ')}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Award className="h-5 w-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filter Controls Bar */}
        <Card className="p-4 shadow-sm bg-white border-gray-200">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by student name, phone or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-10 text-sm"
              />
            </div>

            {/* District Filter */}
            <div className="w-full lg:w-48">
              <Select
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  setPage(1);
                }}
                className="h-10 text-sm"
              >
                <option value="">All TN Districts</option>
                {TAMIL_NADU_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </div>

            {/* Area of Interest */}
            <div className="w-full lg:w-56">
              <Select
                value={areaOfInterest}
                onChange={(e) => {
                  setAreaOfInterest(e.target.value);
                  setPage(1);
                }}
                className="h-10 text-sm"
              >
                {AREA_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Reset Filters */}
            {(search || district || areaOfInterest) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-gray-500 hover:text-gray-900 text-xs h-10 px-3 whitespace-nowrap"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </Card>

        {/* Data Display */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white rounded-xl border border-gray-200">
            <LoadingSpinner size="lg" className="text-brand-600" />
            <p className="text-sm font-medium text-gray-500">Retrieving student records from database...</p>
          </div>
        ) : error ? (
          <Card className="p-8 text-center bg-rose-50 border-rose-200">
            <p className="text-sm font-semibold text-rose-800">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchStudents()}
              className="mt-4 border-rose-300 text-rose-700 hover:bg-rose-100"
            >
              Retry
            </Button>
          </Card>
        ) : students.length === 0 ? (
          <EmptyState
            title="No student records found"
            description={
              search || district || areaOfInterest
                ? 'Try broadening your search keywords or resetting your filter criteria.'
                : 'There are currently no students registered in your accessible scope.'
            }
            action={
              (search || district || areaOfInterest) && (
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Clear Filters
                </Button>
              )
            }
          />
        ) : (
          <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/75 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">District</th>
                    <th className="py-3.5 px-4">Aspiration / Program</th>
                    <th className="py-3.5 px-4 text-center">12th Marks</th>
                    <th className="py-3.5 px-4 text-center">Enquiries</th>
                    <th className="py-3.5 px-4">Aadhaar (Privacy)</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                    >
                      <td className="py-3.5 px-4">
                        <Link href={`/admin/students/${student.id}`} className="block">
                          <p className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                            {student.firstName}
                          </p>
                          <p className="text-xs text-gray-400 font-mono">
                            ID: {student.id.slice(0, 8)}...
                          </p>
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 text-xs">
                          <p className="text-gray-800 flex items-center gap-1.5 font-medium">
                            <Phone className="h-3 w-3 text-gray-400" />
                            {student.phone}
                          </p>
                          <p className="text-gray-500 flex items-center gap-1.5 truncate max-w-[180px]">
                            <Mail className="h-3 w-3 text-gray-400" />
                            {student.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">
                          <MapPin className="h-3 w-3 text-gray-500" />
                          {student.district || 'Tamil Nadu'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-gray-900 text-xs">
                          {student.program?.name || student.areaOfInterest || 'General Counselling'}
                        </p>
                        {student.program?.degreeLevel && (
                          <span className="text-[11px] text-gray-400">
                            {student.program.degreeLevel}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {student.mark12th ? (
                          <span className="inline-block font-semibold text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {student.mark12th}%
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Pending</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="inline-flex items-center justify-center h-6 min-w-6 px-1.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                            {student._count?.enquiries ?? 0}
                          </span>
                          {(student._count?.followUps ?? 0) > 0 && (
                            <span
                              title={`${student._count?.followUps} follow-ups`}
                              className="text-[11px] text-gray-400"
                            >
                              ({student._count?.followUps} F/U)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-xs font-mono bg-amber-50/80 text-amber-800 px-2 py-0.5 rounded border border-amber-200/80">
                          <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                          {student.aadhaarMasked || '•••• •••• ••••'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/admin/students/${student.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-brand-600 hover:text-brand-700 hover:bg-brand-50 font-medium text-xs gap-1"
                          >
                            Profile
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List (USABLE AT 360px - 430px) */}
            <div className="md:hidden space-y-3">
              {students.map((student) => (
                <Card
                  key={student.id}
                  className="p-4 shadow-sm border border-gray-200 bg-white hover:border-brand-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link href={`/admin/students/${student.id}`}>
                        <h3 className="font-bold text-gray-900 text-base hover:text-brand-600">
                          {student.firstName}
                        </h3>
                      </Link>
                      <p className="text-xs text-gray-400 font-mono">ID: {student.id.slice(0, 8)}...</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-mono bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                      <ShieldCheck className="h-3 w-3 text-amber-600" />
                      {student.aadhaarMasked || 'Protected'}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      <a href={`tel:${student.phone}`} className="font-medium text-gray-900">
                        {student.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="h-3.5 w-3.5 text-gray-400" />
                      <span className="truncate">{student.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      <span>{student.district || 'Tamil Nadu'}</span>
                      {student.mark12th && (
                        <span className="ml-auto font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {student.mark12th}% (12th)
                        </span>
                      )}
                    </div>
                    {(student.program || student.areaOfInterest) && (
                      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                        <GraduationCap className="h-3.5 w-3.5 text-brand-600" />
                        <span className="font-medium text-gray-800 truncate">
                          {student.program?.name || student.areaOfInterest}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Enquiries: <strong className="text-brand-600">{student._count?.enquiries ?? 0}</strong>
                    </span>
                    <Link href={`/admin/students/${student.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs text-brand-600 border-brand-200 hover:bg-brand-50"
                      >
                        View Profile &rarr;
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 pt-4 px-2">
                <p className="text-xs text-gray-500">
                  Page <strong className="font-semibold text-gray-900">{pagination.page}</strong> of{' '}
                  <strong className="font-semibold text-gray-900">{pagination.pages}</strong>
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="text-xs"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.pages || loading}
                    onClick={() => setPage((p) => p + 1)}
                    className="text-xs"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
