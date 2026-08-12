import TutorStats from "../../components/tutor/TutorStats";
import TutorAnalytics from "../../components/tutor/TutorAnalytics";
import RecentStudents from "../../components/tutor/RecentStudents";
import RevenueAnalytics from "../../components/tutor/RevenueAnalytics";
import TutorMessages from "../../components/tutor/TutorMessages";

function TutorDashboard() {
  return (
    <>
      <h1>Tutor Dashboard</h1>
      <p>Welcome back. Here's your teaching business overview.</p>
      <TutorStats />
      <RecentStudents />
      <RevenueAnalytics />
      <TutorMessages />
      <TutorAnalytics />
    </>
  );
}

export default TutorDashboard;