from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date, timedelta
from internships.models import Organization, Placement
from supervision.models import WeeklyLog, Evaluation, EvaluationCriteria

User = get_user_model()

class SupervisionTestCase(TestCase):

    def setUp(self):
        self.client = APIClient()

        # USERS
        self.student = User.objects.create_user(
            username="student1",
            password="pass123",
            role="student"
        )

        self.workplace = User.objects.create_user(
            username="work1",
            password="pass123",
            role="workplace"
        )

        self.academic = User.objects.create_user(
            username="acad1",
            password="pass123",
            role="academic"
        )

        # ORGANIZATION
        self.org = Organization.objects.create(
            name="Tech Corp",
            location="Kampala"
        )

        # PLACEMENT
        self.placement = Placement.objects.create(
            student=self.student,
            organization=self.org,
            workplace_supervisor=self.workplace,
            academic_supervisor=self.academic,
            start_date=date.today() - timedelta(days=5),
            end_date=date.today() + timedelta(days=30)
        )

    def test_student_can_create_weekly_log(self):
        self.client.force_authenticate(user=self.student)

        data = {
            "placement": self.placement.id,
            "week_number": 1,
            "tasks": "Worked on backend API",
            "attendance_days": 5
        }

        response = self.client.post("/api/supervision/weeklylogs/", data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(WeeklyLog.objects.count(), 1)

    def test_duplicate_weekly_log_blocked(self):
        WeeklyLog.objects.create(
            placement=self.placement,
            week_number=1,
            tasks="First log"
        )

        self.client.force_authenticate(user=self.student)

        data = {
            "placement": self.placement.id,
            "week_number": 1,
            "tasks": "Duplicate log"
        }

        response = self.client.post("/api/supervision/weeklylogs/", data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)       

    def test_workplace_can_reject_log(self):
        log = WeeklyLog.objects.create(
            placement=self.placement,
            week_number=1,
            tasks="Task"
        )

        self.client.force_authenticate(user=self.workplace)

        response = self.client.post(
            f"/api/supervision/weeklylogs/{log.id}/reject/",
            {"supervisor_feedback": "Fix this"}
        )

        log.refresh_from_db()

        self.assertEqual(log.status, "rejected")

    def test_student_cannot_create_evaluation(self):
        self.client.force_authenticate(user=self.student)

        data = {
            "placement": self.placement.id,
            "supervisor_type": "workplace",
            "score": 10,
            "comments": "test"
        }

        response = self.client.post("/api/supervision/evaluations/", data,format ="json")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_workplace_can_create_evaluation(self):
        self.client.force_authenticate(user=self.workplace)

        data = {
            "placement": self.placement.id,
            "supervisor_type": "workplace",
            "score": 40,
            "comments": "Good work",
            "criteria_scores": []
        }

        response = self.client.post("/api/supervision/evaluations/", data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)        

    def test_academic_can_finalize_evaluation(self):
        # First create workplace evaluation
        Evaluation.objects.create(
            placement=self.placement,
            supervisor=self.workplace,
            supervisor_type="workplace",
            score=40,
            comments="ok",
            is_final=False
        )

        self.client.force_authenticate(user=self.academic)

        data = {
            "placement": self.placement.id,
            "supervisor_type": "academic",
            "score": 15,
            "comments": "final grading"
        }

        response = self.client.post("/api/supervision/evaluations/", data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_criteria_score_validation(self):
        criteria = EvaluationCriteria.objects.create(
            name="Code Quality",
            max_score=10
        )

        self.client.force_authenticate(user=self.workplace)

        data = {
            "placement": self.placement.id,
            "supervisor_type": "workplace",
            "score": 0,
            "comments": "test",
            "criteria_scores": [
                {
                    "criteria": criteria.id,
                    "score": 15  
                }
            ]
        }

        response = self.client.post("/api/supervision/evaluations/", data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)                