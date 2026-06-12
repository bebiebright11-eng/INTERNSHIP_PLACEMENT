from django.test import TestCase

from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class UserModelTests(TestCase):

    def test_create_student(self):
        user = User.objects.create_user(
            username="student1",
            password="test123",
            role="student"
        )

        self.assertEqual(user.role, "student")
        self.assertFalse(user.is_activated)

    def test_string_representation(self):
        user = User.objects.create_user(
            username="john",
            password="test123",
            role="student"
        )

        self.assertEqual(
            str(user),
            "john (student)"
        )


class ActivateAccountTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="student1",
            role="student",
            is_activated=False
        )

    def test_activate_account(self):

        response = self.client.post(
            "/api/accounts/activate/",
            {
                "username": "student1",
                "password": "test123",
                "first_name": "John",
                "last_name": "Doe"
            },
            format="json"
        )

        self.assertEqual(response.status_code, 200)

        self.user.refresh_from_db()

        self.assertTrue(self.user.is_activated)

    def test_activate_unknown_user(self):

        response = self.client.post(
            "/api/accounts/activate/",
            {
                "username": "ghost",
                "password": "123",
                "first_name": "John",
                "last_name": "Doe"
            },
            format="json"
        )

        self.assertEqual(response.status_code, 404) 

class LoginTests(APITestCase):

    def test_activated_user_can_login(self):

        User.objects.create_user(
            username="john",
            password="pass123",
            role="student",
            is_activated=True
        )

        response = self.client.post(
            "/api/accounts/login/",
            {
                "username": "john",
                "password": "pass123"
            },
            format="json"
        )

        self.assertEqual(response.status_code, 200)

    def test_unactivated_user_cannot_login(self):

        User.objects.create_user(
            username="john",
            password="pass123",
            role="student",
            is_activated=False
        )

        response = self.client.post(
            "/api/accounts/login/",
            {
                "username": "john",
                "password": "pass123"
            },
            format="json"
        )

        self.assertEqual(response.status_code, 400)

class PasswordResetTests(APITestCase):

    def test_password_reset_request(self):

        User.objects.create_user(
            username="john",
            email="john@test.com",
            password="pass123",
            role="student"
        )

        response = self.client.post(
            "/api/accounts/password-reset/",
            {
                "identifier": "john"
            },
            format="json"
        )

        self.assertEqual(response.status_code, 200)

    def test_password_reset_unknown_user(self):

        response = self.client.post(
            "/api/accounts/password-reset/",
            {
                "identifier": "ghost"
            },
            format="json"
        )

        self.assertEqual(response.status_code, 400)
