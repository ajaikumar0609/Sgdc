import { Request, Response, NextFunction } from 'express';
import {
  prisma,
  EnquiryStatus,
  FollowUpStatus,
  UserRole,
} from '@shasthi-guru/database';

export async function getDashboardReports(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { period = '30d', district, status, counselorId } = req.query;

    // Validate period
    const validPeriods = ['7d', '30d', '90d'];
    const selectedPeriod = validPeriods.includes(period as string) ? (period as string) : '30d';
    const periodDays = selectedPeriod === '7d' ? 7 : selectedPeriod === '90d' ? 90 : 30;

    const now = new Date();
    const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Build role-based scope filters
    const whereEnquiry: any = {};
    const whereFollowup: any = {};

    if (user.role === UserRole.COUNSELOR) {
      // Strict Counselor Caseload Isolation
      whereEnquiry.assignedCounselorId = user.id;
      whereFollowup.counselorId = user.id;
    } else if (counselorId && typeof counselorId === 'string' && counselorId.trim()) {
      // Admin filter by specific counselor
      whereEnquiry.assignedCounselorId = counselorId.trim();
      whereFollowup.counselorId = counselorId.trim();
    }

    if (status && Object.values(EnquiryStatus).includes(status as EnquiryStatus)) {
      whereEnquiry.status = status as EnquiryStatus;
    }

    if (district && typeof district === 'string' && district.trim()) {
      whereEnquiry.student = { district: district.trim() };
    }

    // Parallel DB Aggregations
    const [
      totalEnquiries,
      statusGroups,
      followUpStatusGroups,
      overdueFollowups,
      dueTodayFollowups,
      upcomingFollowups,
      urgentFollowUpsList,
      recentEnquiries,
      counselorUsers,
      recentAuditLogs,
      trendEnquiries,
      programDistributionRaw,
      districtDistributionRaw,
    ] = await Promise.all([
      // 1. Total Enquiries in Scope
      prisma.admissionEnquiry.count({ where: whereEnquiry }),

      // 2. Status Distribution via GroupBy
      prisma.admissionEnquiry.groupBy({
        by: ['status'],
        _count: { id: true },
        where: whereEnquiry,
      }),

      // 3. Follow-Up Status Groups
      prisma.followUp.groupBy({
        by: ['status'],
        _count: { id: true },
        where: whereFollowup,
      }),

      // 4. Overdue Follow-ups (SCHEDULED and scheduledAt < now)
      prisma.followUp.count({
        where: {
          ...whereFollowup,
          status: FollowUpStatus.SCHEDULED,
          scheduledAt: { lt: now },
        },
      }),

      // 5. Due Today Follow-ups (SCHEDULED and within today's window)
      prisma.followUp.count({
        where: {
          ...whereFollowup,
          status: FollowUpStatus.SCHEDULED,
          scheduledAt: { gte: startOfToday, lte: endOfToday },
        },
      }),

      // 6. Upcoming Follow-ups (SCHEDULED and after today)
      prisma.followUp.count({
        where: {
          ...whereFollowup,
          status: FollowUpStatus.SCHEDULED,
          scheduledAt: { gt: endOfToday },
        },
      }),

      // 7. Urgent Follow-ups List (Scheduled today or overdue)
      prisma.followUp.findMany({
        where: {
          ...whereFollowup,
          status: FollowUpStatus.SCHEDULED,
          scheduledAt: { lte: endOfToday },
        },
        orderBy: { scheduledAt: 'asc' },
        take: 5,
        select: {
          id: true,
          scheduledAt: true,
          status: true,
          feedbackNote: true,
          student: {
            select: { id: true, firstName: true, phone: true, district: true },
          },
          enquiry: {
            select: { id: true, enquiryCode: true, status: true },
          },
          counselor: {
            select: { id: true, name: true },
          },
        },
      }),

      // 8. Recent Enquiries (Latest 6 in scope)
      prisma.admissionEnquiry.findMany({
        where: whereEnquiry,
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          enquiryCode: true,
          status: true,
          source: true,
          createdAt: true,
          student: {
            select: { id: true, firstName: true, phone: true, district: true, mark12th: true },
          },
          program: {
            select: { id: true, name: true },
          },
          assignedCounselor: {
            select: { id: true, name: true },
          },
        },
      }),

      // 9. Counselor Workload Aggregation
      user.role === UserRole.COUNSELOR
        ? prisma.user.findMany({
            where: { id: user.id },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              _count: {
                select: {
                  assignedEnquiries: true,
                  followUps: true,
                },
              },
            },
          })
        : prisma.user.findMany({
            where: { role: UserRole.COUNSELOR, status: 'ACTIVE' },
            orderBy: { name: 'asc' },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              _count: {
                select: {
                  assignedEnquiries: true,
                  followUps: true,
                },
              },
            },
          }),

      // 10. Recent Activity Trail (Audit Logs)
      prisma.auditLog.findMany({
        where: user.role === UserRole.COUNSELOR ? { userId: user.id } : {},
        take: 8,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          action: true,
          entity: true,
          entityId: true,
          details: true,
          createdAt: true,
          user: {
            select: { id: true, name: true, role: true },
          },
        },
      }),

      // 11. Trend Enquiries in Selected Date Range
      prisma.admissionEnquiry.findMany({
        where: {
          ...whereEnquiry,
          createdAt: { gte: startDate },
        },
        select: { createdAt: true },
      }),

      // 12. Program Distribution via Enquiries
      prisma.admissionEnquiry.groupBy({
        by: ['programId'],
        _count: { id: true },
        where: whereEnquiry,
      }),

      // 13. District Distribution via Students linked to Enquiries
      prisma.admissionEnquiry.findMany({
        where: whereEnquiry,
        select: {
          student: {
            select: { district: true },
          },
        },
      }),
    ]);

    // Compute KPI Counts
    const statusCountMap: Record<string, number> = {};
    for (const item of statusGroups) {
      statusCountMap[item.status] = item._count.id;
    }

    const newEnquiries = statusCountMap[EnquiryStatus.NEW] || 0;
    const counselingCases = statusCountMap[EnquiryStatus.COUNSELING] || 0;
    const admissionSupportCases = statusCountMap[EnquiryStatus.ADMISSION_SUPPORT] || 0;
    const convertedEnquiries = statusCountMap[EnquiryStatus.CONVERTED] || 0;
    const closedEnquiries = statusCountMap[EnquiryStatus.CLOSED] || 0;

    // Active enquiries: strictly defined as neither CONVERTED nor CLOSED
    const activeEnquiries = totalEnquiries - (convertedEnquiries + closedEnquiries);

    // Follow-ups due: scheduled and due on or before today
    const followupsDue = overdueFollowups + dueTodayFollowups;

    // Build Full Status Distribution (All 8 Business Statuses)
    const allStatuses = [
      EnquiryStatus.NEW,
      EnquiryStatus.ASSIGNED,
      EnquiryStatus.CONTACTED,
      EnquiryStatus.COUNSELING,
      EnquiryStatus.FOLLOW_UP,
      EnquiryStatus.ADMISSION_SUPPORT,
      EnquiryStatus.CONVERTED,
      EnquiryStatus.CLOSED,
    ];

    const statusDistribution = allStatuses.map((st) => {
      const count = statusCountMap[st] || 0;
      const percentage = totalEnquiries > 0 ? Number(((count / totalEnquiries) * 100).toFixed(1)) : 0;
      return { status: st, count, percentage };
    });

    // Build Time-Series Trend Buckets (Zero-Value Padded)
    const trendMap: Record<string, number> = {};
    for (let i = periodDays - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = d.toISOString().slice(0, 10);
      trendMap[dateKey] = 0;
    }

    for (const enq of trendEnquiries) {
      const dateKey = enq.createdAt.toISOString().slice(0, 10);
      if (trendMap[dateKey] !== undefined) {
        trendMap[dateKey] += 1;
      }
    }

    const trend = Object.entries(trendMap).map(([date, count]) => {
      const d = new Date(date);
      const label = d.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      });
      return { date, label, count };
    });

    // Program Distribution Resolution
    const programIds = programDistributionRaw
      .map((p) => p.programId)
      .filter((id): id is string => id !== null);

    const programs = await prisma.program.findMany({
      where: { id: { in: programIds } },
      select: { id: true, name: true, degreeLevel: true },
    });
    const programMap = new Map(programs.map((p) => [p.id, p]));

    const programDistribution = programDistributionRaw
      .map((item) => {
        const prog = item.programId ? programMap.get(item.programId) : null;
        const name = prog ? prog.name : 'General Counselling (No Specific Program)';
        const count = item._count.id;
        const percentage = totalEnquiries > 0 ? Number(((count / totalEnquiries) * 100).toFixed(1)) : 0;
        return {
          programId: item.programId,
          name,
          degreeLevel: prog?.degreeLevel || 'UG/PG',
          count,
          percentage,
        };
      })
      .sort((a, b) => b.count - a.count);

    // District Distribution Resolution
    const districtCounts: Record<string, number> = {};
    for (const enq of districtDistributionRaw) {
      const d = enq.student?.district?.trim() || 'Unspecified';
      districtCounts[d] = (districtCounts[d] || 0) + 1;
    }

    const districtDistribution = Object.entries(districtCounts)
      .map(([districtName, count]) => ({
        district: districtName,
        count,
        percentage: totalEnquiries > 0 ? Number(((count / totalEnquiries) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Detailed Counselor Workload (Active caseload calculation)
    const counselorWorkload = await Promise.all(
      counselorUsers.map(async (c) => {
        const [activeCases, counselingCount, convertedCount, counselorOverdue] = await Promise.all([
          prisma.admissionEnquiry.count({
            where: {
              assignedCounselorId: c.id,
              status: { notIn: [EnquiryStatus.CONVERTED, EnquiryStatus.CLOSED] },
            },
          }),
          prisma.admissionEnquiry.count({
            where: {
              assignedCounselorId: c.id,
              status: EnquiryStatus.COUNSELING,
            },
          }),
          prisma.admissionEnquiry.count({
            where: {
              assignedCounselorId: c.id,
              status: EnquiryStatus.CONVERTED,
            },
          }),
          prisma.followUp.count({
            where: {
              counselorId: c.id,
              status: FollowUpStatus.SCHEDULED,
              scheduledAt: { lt: now },
            },
          }),
        ]);

        return {
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          activeCaseload: activeCases,
          totalAssigned: c._count.assignedEnquiries,
          counselingCount,
          convertedCount,
          overdueFollowups: counselorOverdue,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        scope: {
          role: user.role,
          counselorId: user.role === UserRole.COUNSELOR ? user.id : (counselorId as string) || null,
          period: selectedPeriod,
        },
        metrics: {
          totalEnquiries,
          newEnquiries,
          activeEnquiries,
          followupsDue,
          counselingCases,
          admissionSupportCases,
          convertedEnquiries,
          closedEnquiries,
        },
        kpis: {
          totalEnquiries,
          newEnquiries,
          activeEnquiries,
          followupsDue,
          counselingCases,
          admissionSupportCases,
          convertedEnquiries,
          closedEnquiries,
        },
        followUpSummary: {
          overdue: overdueFollowups,
          dueToday: dueTodayFollowups,
          upcoming: upcomingFollowups,
          totalPending: followupsDue + upcomingFollowups,
          urgentList: urgentFollowUpsList,
        },
        trend,
        statusDistribution,
        programDistribution,
        districtDistribution,
        counselorWorkload,
        recentEnquiries,
        recentActivity: recentAuditLogs,
      },
    });
  } catch (error) {
    next(error);
  }
}
