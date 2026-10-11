'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CalendarCheck,
  MessageSquare,
  BookOpen,
  Newspaper,
  Heart,
  DollarSign,
  Mail,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  GraduationCap,
  Bell,
  Check,
  ShieldAlert,
  FileKey,
} from 'lucide-react';

export interface AdminShellProps {
  children: React.ReactNode;
  allowedRoles?: ('SUPER_ADMIN' | 'ADMIN' | 'COUNSELOR' | 'CONTENT_MANAGER')[];
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  linkUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

export function AdminShell({ children, allowedRoles }: AdminShellProps) {
  const { user, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const notifRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();

  // Fetch notifications
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    async function loadNotifications() {
      try {
        const res = await fetch('/api/admin/notifications');
        const data = await res.json();
        if (isMounted && res.ok && data.success) {
          setNotifications(data.data.notifications || []);
          setUnreadCount(data.data.unreadCount || 0);
        }
      } catch {
        // Silently handle polling errors
      }
    }

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Poll every 30s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  // Click outside to close notifications dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/admin/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Ignore
    }
  };

  // Auth Redirect Guard
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/admin/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <LoadingSpinner size="lg" text="Authenticating Shasthi Guru staff portal..." />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Role Protection Check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-red-200 shadow-soft-md text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-sm text-slate-600">
            Your role (<strong className="text-slate-900">{user.role}</strong>) does not have authorization to access this CRM workspace.
          </p>
          <div className="pt-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/admin/enquiries')}>
              Return to Authorized Workspace
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    {
      name: user.role === 'COUNSELOR' ? 'My Enquiries' : 'Enquiries CRM',
      href: '/admin/enquiries',
      icon: Users,
      badge: user.role === 'COUNSELOR' ? 'Caseload' : undefined,
    },
    { name: 'Students Registry', href: '/admin/students', icon: GraduationCap },
    { name: 'Follow-ups', href: '/admin/follow-ups', icon: CalendarCheck },
    { name: 'Conversations', href: '/admin/conversations', icon: MessageSquare },
    {
      name: 'Counselor Team',
      href: '/admin/counselors',
      icon: UserCheck,
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      name: 'Programs CMS',
      href: '/admin/programs',
      icon: BookOpen,
      roles: ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'],
    },
    {
      name: 'News CMS',
      href: '/admin/news',
      icon: Newspaper,
      roles: ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'],
    },
    {
      name: 'Student Stories CMS',
      href: '/admin/stories',
      icon: Heart,
      roles: ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'],
    },
    {
      name: 'Impact Stats CMS',
      href: '/admin/impact',
      icon: BarChart3,
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      name: 'Contact Queries',
      href: '/admin/contact',
      icon: Mail,
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      name: 'Donation Records',
      href: '/admin/donations',
      icon: DollarSign,
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      name: 'Audit Logs',
      href: '/admin/audit-logs',
      icon: FileKey,
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
  ];

  const allowedNav = navigation.filter(
    (item) => !item.roles || item.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Header Bar */}
      <div className="md:hidden flex items-center justify-between bg-brand-navy-950 text-white p-4 sticky top-0 z-40 border-b border-brand-navy-800">
        <div className="flex items-center gap-2.5">
          <Image
            src="/brand/logo.png"
            alt="Logo"
            width={32}
            height={32}
            className="rounded-lg object-contain bg-brand-navy-800 p-0.5"
          />
          <span className="font-bold text-sm tracking-tight">Shasthi Guru CRM</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-1.5 rounded-lg hover:bg-brand-navy-800 text-slate-300 relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-emerald-400" />
            )}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-brand-navy-800 text-slate-300"
            aria-label="Toggle navigation menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar for Desktop & Mobile Overlay */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-brand-navy-950 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-brand-navy-900 flex items-center justify-between">
          <Link href="/admin/enquiries" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-navy-800 p-1 flex items-center justify-center border border-brand-navy-700 shadow-soft-sm">
              <Image
                src="/brand/logo.png"
                alt="Shasthi Guru Logo"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight font-heading block leading-tight">
                SHASTHI GURU
              </span>
              <span className="text-[10px] font-bold text-brand-emerald-400 uppercase tracking-widest block">
                CRM & Guidance
              </span>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 rounded-lg text-slate-400 hover:text-white"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-brand-navy-900 border border-brand-navy-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white truncate max-w-[130px]">
              {user.name}
            </span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-brand-emerald-950 text-brand-emerald-300 border border-brand-emerald-800 uppercase tracking-wider">
              {user.role.replace('_', ' ')}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 truncate block mt-0.5">{user.email}</span>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto text-xs font-medium" aria-label="Sidebar">
          {allowedNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href + '/'));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors',
                  isActive
                    ? 'bg-brand-emerald-600 text-white font-semibold shadow-soft-sm'
                    : 'text-slate-400 hover:text-white hover:bg-brand-navy-900'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-slate-400')} />
                  <span>{item.name}</span>
                </div>
                {item.badge && !isActive && (
                  <span className="text-[9px] bg-brand-navy-800 text-brand-gold-400 px-1.5 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-brand-navy-900 space-y-1 text-xs">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-brand-navy-900 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Public Website</span>
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Desktop Header */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-8 sticky top-0 z-30 shadow-soft-sm">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Shasthi Guru CRM</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold capitalize">
              {pathname.replace('/admin/', '').replace('/', ' / ').replace(/-/g, ' ') || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-4 relative" ref={notifRef}>
            {/* Notification Button */}
            <button
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 relative transition-colors"
              aria-label={`Notifications (${unreadCount} unread)`}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-emerald-500 ring-2 ring-white" />
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {notificationsOpen && (
              <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-soft-lg border border-slate-200 z-50 overflow-hidden animate-in fade-in-50 duration-150">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <Badge variant="emerald" size="xs">
                        {unreadCount} new
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Close
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={cn(
                          'p-3.5 text-xs transition-colors hover:bg-slate-50 flex items-start justify-between gap-3',
                          !notif.isRead ? 'bg-brand-emerald-50/30' : ''
                        )}
                      >
                        <div className="space-y-1 flex-1">
                          <h4 className="font-bold text-slate-900">{notif.title}</h4>
                          <p className="text-slate-600 leading-relaxed">{notif.message}</p>
                          <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-400">
                            <span>
                              {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {notif.linkUrl && (
                              <Link
                                href={notif.linkUrl}
                                onClick={() => setNotificationsOpen(false)}
                                className="font-bold text-brand-emerald-700 hover:underline"
                              >
                                View Record →
                              </Link>
                            )}
                          </div>
                        </div>

                        {!notif.isRead && (
                          <button
                            type="button"
                            onClick={() => markAsRead(notif.id)}
                            title="Mark as read"
                            className="p-1 rounded text-slate-400 hover:text-brand-emerald-600 shrink-0"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No notifications at this time.
                    </div>
                  )}
                </div>
                
                <div className="p-3 border-t border-slate-100 text-center">
                  <Link 
                    href="/admin/notifications" 
                    onClick={() => setNotificationsOpen(false)}
                    className="text-xs font-bold text-brand-emerald-700 hover:text-brand-emerald-800"
                  >
                    View All Notifications →
                  </Link>
                </div>
              </div>
            )}

            <div className="h-6 w-px bg-slate-200" />

            {/* User Profile */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-navy-800 text-white flex items-center justify-center font-bold text-xs shadow-soft-xs">
                {user.name.charAt(0)}
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-slate-900 block leading-none truncate max-w-[140px]">
                  {user.name}
                </span>
                <span className="text-[10px] text-slate-500 block uppercase tracking-wider mt-0.5">
                  {user.role.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
