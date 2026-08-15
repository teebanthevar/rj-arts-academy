import TutorStats from "../../components/tutor/TutorStats";
import TutorAnalytics from "../../components/tutor/TutorAnalytics";
import RecentStudents from "../../components/tutor/RecentStudents";
import RevenueAnalytics from "../../components/tutor/RevenueAnalytics";
function TutorDashboard() {
  return (
    <>
      <h1>Tutor Dashboard</h1>
      <p>Welcome back. Here's your teaching business overview.</p>
      <TutorStats />
      <RecentStudents />
      <RevenueAnalytics />
      <TutorAnalytics />
    </>
  );
}

export default TutorDashboard;