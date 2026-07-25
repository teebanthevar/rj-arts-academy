import { supabase } from "./supabase";

export async function getDashboardStats() {
  const [
    students,
    artworks,
    courses,
    certificates,
    payments,
    attendance,
  ] = await Promise.all([
    supabase.from("students").select("*", { count: "exact", head: true }),
    supabase.from("artworks").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("certificates").select("*", { count: "exact", head: true }),
    supabase.from("payments").select("amount"),
    supabase.from("attendance").select("status"),
  ]);

  const revenue =
    payments.data?.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    ) || 0;

  const attendanceTotal = attendance.data?.length || 0;

  const attendancePresent =
    attendance.data?.filter(
      (item) => item.status === "Present"
    ).length || 0;

  const attendancePercentage =
    attendanceTotal === 0
      ? 0
      : Math.round(
          (attendancePresent / attendanceTotal) * 100
        );

  return {
    students: students.count || 0,
    artworks: artworks.count || 0,
    courses: courses.count || 0,
    certificates: certificates.count || 0,
    revenue,
    attendance: attendancePercentage,
  };
}