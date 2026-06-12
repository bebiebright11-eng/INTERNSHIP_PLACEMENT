from django.test import TestCase
from django.contrib.auth import get_user_model

from .models import Organization, Application, Placement

User = get_user_model()


class InternshipPlacementSystemTests(TestCase):

    def setUp(self):

        # Student
        self.student = User.objects.create_user(
            username="S22B13/001",
            password="test123",
            role="student"
        )

        # Academic supervisor
        self.academic = User.objects.create_user(
            username="academic@test.com",
            password="test123",
            role="academic"
        )

        # Workplace supervisor
        self.workplace = User.objects.create_user(
            username="workplace@test.com",
            password="test123",
            role="workplace"
        )

        # Organization
        self.organization = Organization.objects.create(
            name="MTN Uganda",
            location="Kampala"
        )

    def test_organization_creation(self):
        """
        Test organization creation
        """

        self.assertEqual(
            self.organization.name,
            "MTN Uganda"
        )

    def test_application_creation(self):
        """
        Test application creation
        """

        application = Application.objects.create(
            student=self.student,
            organization=self.organization
        )

        self.assertEqual(
            application.status,
            "pending"
        )

    def test_duplicate_application_not_allowed(self):
        """
        Test unique_together constraint
        """

        Application.objects.create(
            student=self.student,
            organization=self.organization
        )

        with self.assertRaises(Exception):
            Application.objects.create(
                student=self.student,
                organization=self.organization
            )

    def test_placement_creation(self):
        """
        Test placement creation
        """

        placement = Placement.objects.create(
            student=self.student,
            organization=self.organization,
            workplace_supervisor=self.workplace,
            academic_supervisor=self.academic
        )

        self.assertEqual(
            placement.student,
            self.student
        )

    def test_fully_assigned_property(self):
        """
        Test is_fully_assigned property
        """

        placement = Placement.objects.create(
            student=self.student,
            organization=self.organization,
            workplace_supervisor=self.workplace,
            academic_supervisor=self.academic,
            start_date="2026-06-01",
            end_date="2026-08-01"
        )

        self.assertTrue(
            placement.is_fully_assigned
        )