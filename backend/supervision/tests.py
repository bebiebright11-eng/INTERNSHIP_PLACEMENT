from django.test import TestCase
from django.contrib.auth import get_user_model

from internships.models import Organization, Placement
from supervision.models import (
    WeeklyLog,
    EvaluationCriteria,
    Evaluation,
    CriteriaScore,
)

User = get_user_model()


class SupervisionModelTests(TestCase):

    def setUp(self):

        self.student = User.objects.create_user(
            username="25U001",
            password="test123",
            role="student"
        )

        self.workplace = User.objects.create_user(
            username="workplace@test.com",
            password="test123",
            role="workplace"
        )

        self.academic = User.objects.create_user(
            username="academic@test.com",
            password="test123",
            role="academic"
        )

        self.organization = Organization.objects.create(
            name="Denovo",
            location="Kampala"
        )

        self.placement = Placement.objects.create(
            student=self.student,
            organization=self.organization,
            workplace_supervisor=self.workplace,
            academic_supervisor=self.academic
        )

    def test_create_weekly_log(self):

        log = WeeklyLog.objects.create(
            placement=self.placement,
            week_number=1,
            tasks="Developed APIs",
            attendance_days=5
        )

        self.assertEqual(log.week_number, 1)

    def test_create_evaluation_criteria(self):

        criteria = EvaluationCriteria.objects.create(
            name="Communication",
            max_score=10
        )

        self.assertEqual(criteria.max_score, 10)

    def test_create_evaluation(self):

        evaluation = Evaluation.objects.create(
            placement=self.placement,
            supervisor=self.workplace,
            supervisor_type="workplace",
            score=50,
            comments="Good work"
        )

        self.assertEqual(evaluation.score, 50)

    def test_create_criteria_score(self):

        evaluation = Evaluation.objects.create(
            placement=self.placement,
            supervisor=self.workplace,
            supervisor_type="workplace",
            score=50,
            comments="Good work"
        )

        criteria = EvaluationCriteria.objects.create(
            name="Communication",
            max_score=10
        )

        score = CriteriaScore.objects.create(
            evaluation=evaluation,
            criteria=criteria,
            score=8
        )

        self.assertEqual(score.score, 8)

    def test_weekly_log_string(self):

        log = WeeklyLog.objects.create(
            placement=self.placement,
            week_number=2,
            tasks="Frontend work",
            attendance_days=5
        )

        self.assertIn("Week 2", str(log))
