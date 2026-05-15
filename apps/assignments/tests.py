from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django.utils import timezone

from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from apps.assignments.models import Assignment, AssignmentView, Submission

try:
    from apps.courses.models import Grade, Subject, Module, Topic
    COURSES_AVAILABLE = True
except ImportError:
    COURSES_AVAILABLE = False

User = get_user_model()


def make_user(username, role="student", grade=None, **kwargs):
    user = User.objects.create_user(username=username, password="testpass123", **kwargs)
    user.role = role
    if grade is not None:
        user.grade = grade
        user.grade_id = grade.id
    user.save()
    return user


def auth(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


class BaseAssignmentTestCase(APITestCase):

    @classmethod
    def setUpTestData(cls):
        if not COURSES_AVAILABLE:
            return

        cls.grade   = Grade.objects.create(name="Grade 9")
        cls.teacher = make_user("teacher1", role="teacher")
        cls.admin   = make_user("admin1",   role="admin")
        cls.student = make_user("student1", role="student", grade=cls.grade)
        cls.student_no_grade = make_user("student2", role="student")

        cls.subject = Subject.objects.create(name="Math")
        cls.module  = Module.objects.create(
            name="Algebra", grade=cls.grade, subject=cls.subject
        )
        cls.topic = Topic.objects.create(name="Inequalities", module=cls.module)

        cls.assignment = Assignment.objects.create(
            topic=cls.topic,
            title="Solve the inequality",
            instructions="Show all steps.",
            points=100,
            due_date=timezone.now() + timedelta(days=7),
            created_by=cls.teacher,
        )

    def setUp(self):
        if not COURSES_AVAILABLE:
            self.skipTest("apps.courses недоступен")


class AssignmentModelTest(BaseAssignmentTestCase):

    def test_str_returns_title(self):
        self.assertEqual(str(self.assignment), "Solve the inequality")

    def test_ordering_newest_first(self):
        a2 = Assignment.objects.create(title="Second", created_by=self.teacher)
        self.assertEqual(Assignment.objects.first(), a2)

    def test_assignment_view_unique_together(self):
        """get_or_create не создаёт дубликат."""
        AssignmentView.objects.get_or_create(student=self.student, assignment=self.assignment)
        AssignmentView.objects.get_or_create(student=self.student, assignment=self.assignment)
        self.assertEqual(
            AssignmentView.objects.filter(
                student=self.student, assignment=self.assignment
            ).count(),
            1,
        )

    def test_submission_str(self):
        sub = Submission.objects.create(student=self.student, assignment=self.assignment)
        self.assertIn(str(self.student), str(sub))

    def test_submission_default_status_pending(self):
        sub = Submission.objects.create(student=self.student, assignment=self.assignment)
        self.assertEqual(sub.status, "pending")


class AssignmentListTest(BaseAssignmentTestCase):

    def test_unauthenticated_401(self):
        resp = self.client.get(reverse("assignment-list"))
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_teacher_sees_all(self):
        resp = auth(self.teacher).get(reverse("assignment-list"))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = resp.data.get("results", resp.data)
        self.assertIn(self.assignment.id, [a["id"] for a in data])

    def test_student_sees_only_own_grade(self):
        other_grade  = Grade.objects.create(name="Grade 10")
        other_module = Module.objects.create(
            name="Geo", grade=other_grade, subject=self.subject
        )
        other_topic = Topic.objects.create(name="Circles", module=other_module)
        other_asgn  = Assignment.objects.create(
            topic=other_topic, title="Other grade task", created_by=self.teacher
        )

        resp = auth(self.student).get(reverse("assignment-list"))
        data = resp.data.get("results", resp.data)
        ids  = [a["id"] for a in data]
        self.assertIn(self.assignment.id, ids)
        self.assertNotIn(other_asgn.id, ids)

    def test_student_no_grade_sees_empty(self):
        resp = auth(self.student_no_grade).get(reverse("assignment-list"))
        data = resp.data.get("results", resp.data)
        self.assertEqual(len(data), 0)


class AssignmentRetrieveTest(BaseAssignmentTestCase):

    def _url(self):
        return reverse("assignment-detail", kwargs={"pk": self.assignment.pk})

    def test_student_retrieve_creates_view_record(self):
        auth(self.student).get(self._url())
        self.assertTrue(
            AssignmentView.objects.filter(
                student=self.student, assignment=self.assignment
            ).exists()
        )

    def test_teacher_retrieve_does_not_create_view_record(self):
        auth(self.teacher).get(self._url())
        self.assertFalse(
            AssignmentView.objects.filter(
                student=self.teacher, assignment=self.assignment
            ).exists()
        )

    def test_retrieve_200(self):
        resp = auth(self.teacher).get(self._url())
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["id"], self.assignment.id)


class AssignmentWriteTest(BaseAssignmentTestCase):

    def _payload(self):
        return {"topic": self.topic.id, "title": "New Task", "points": 50}

    def test_teacher_can_create(self):
        resp = auth(self.teacher).post(reverse("assignment-list"), self._payload())
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            Assignment.objects.get(pk=resp.data["id"]).created_by, self.teacher
        )

    def test_student_cannot_create(self):
        resp = auth(self.student).post(reverse("assignment-list"), self._payload())
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_create(self):
        resp = auth(self.admin).post(reverse("assignment-list"), self._payload())
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_teacher_can_patch(self):
        url  = reverse("assignment-detail", kwargs={"pk": self.assignment.pk})
        resp = auth(self.teacher).patch(url, {"title": "Updated"})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assignment.refresh_from_db()
        self.assertEqual(self.assignment.title, "Updated")

    def test_student_cannot_patch(self):
        url  = reverse("assignment-detail", kwargs={"pk": self.assignment.pk})
        resp = auth(self.student).patch(url, {"title": "Hacked"})
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_delete(self):
        tmp  = Assignment.objects.create(title="Temp", created_by=self.admin)
        url  = reverse("assignment-detail", kwargs={"pk": tmp.pk})
        resp = auth(self.admin).delete(url)
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Assignment.objects.filter(pk=tmp.pk).exists())

    def test_student_cannot_delete(self):
        url  = reverse("assignment-detail", kwargs={"pk": self.assignment.pk})
        resp = auth(self.student).delete(url)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


class AssignmentStudentsActionTest(BaseAssignmentTestCase):

    def _url(self):
        return reverse("assignment-students", kwargs={"pk": self.assignment.pk})

    def test_teacher_gets_list(self):
        resp = auth(self.teacher).get(self._url())
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIsInstance(resp.data, list)

    def test_student_forbidden(self):
        resp = auth(self.student).get(self._url())
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_viewed_flag_true_after_retrieve(self):
        auth(self.student).get(
            reverse("assignment-detail", kwargs={"pk": self.assignment.pk})
        )
        resp = auth(self.teacher).get(self._url())
        row  = next((r for r in resp.data if r["student_id"] == self.student.id), None)
        self.assertIsNotNone(row)
        self.assertTrue(row["viewed"])

    def test_submitted_flag_and_id(self):
        sub  = Submission.objects.create(student=self.student, assignment=self.assignment)
        resp = auth(self.teacher).get(self._url())
        row  = next((r for r in resp.data if r["student_id"] == self.student.id), None)
        self.assertIsNotNone(row)
        self.assertTrue(row["submitted"])
        self.assertEqual(row["submission_id"], sub.id)

    def test_row_has_expected_keys(self):
        resp = auth(self.teacher).get(self._url())
        if resp.data:
            expected = {
                "student_id", "student_name", "viewed", "submitted",
                "status", "grade", "feedback", "submission_id",
                "image", "submitted_at",
            }
            self.assertTrue(expected.issubset(resp.data[0].keys()))


class SubmissionViewSetTest(BaseAssignmentTestCase):

    def test_student_can_submit(self):
        f    = SimpleUploadedFile("sol.pdf", b"PDF", content_type="application/pdf")
        resp = auth(self.student).post(
            reverse("submission-list"),
            {"assignment": self.assignment.id, "file": f},
            format="multipart",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Submission.objects.filter(student=self.student).count(), 1)

    def test_perform_create_sets_student(self):
        auth(self.student).post(
            reverse("submission-list"),
            {"assignment": self.assignment.id},
        )
        sub = Submission.objects.filter(
            assignment=self.assignment, student=self.student
        ).first()
        self.assertIsNotNone(sub)

    def test_student_sees_only_own(self):
        grade2   = Grade.objects.create(name="9b")
        student2 = make_user("s2", role="student", grade=grade2)
        Submission.objects.create(student=self.student,  assignment=self.assignment)
        Submission.objects.create(student=student2,      assignment=self.assignment)

        resp = auth(self.student).get(reverse("submission-list"))
        data = resp.data.get("results", resp.data)
        self.assertTrue(all(item["student"] == self.student.id for item in data))

    def test_teacher_sees_all(self):
        Submission.objects.create(student=self.student, assignment=self.assignment)
        resp = auth(self.teacher).get(reverse("submission-list"))
        data = resp.data.get("results", resp.data)
        self.assertGreaterEqual(len(data), 1)

    def test_unauthenticated_cannot_submit(self):
        resp = self.client.post(
            reverse("submission-list"), {"assignment": self.assignment.id}
        )
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


class ReviewSubmissionViewTest(BaseAssignmentTestCase):

    def setUp(self):
        super().setUp()
        self.sub = Submission.objects.create(
            student=self.student,
            assignment=self.assignment,
            status="pending",
        )
        self.url = reverse("submission-review", kwargs={"pk": self.sub.pk})

    def test_teacher_can_approve(self):
        resp = auth(self.teacher).patch(
            self.url,
            {"status": "approved", "grade": "A", "feedback": "Well done!"},
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.sub.refresh_from_db()
        self.assertEqual(self.sub.status, "approved")
        self.assertEqual(self.sub.grade, "A")
        self.assertIsNotNone(self.sub.reviewed_at)

    def test_teacher_can_reject(self):
        resp = auth(self.teacher).patch(
            self.url, {"status": "rejected", "feedback": "Redo this."}
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.sub.refresh_from_db()
        self.assertEqual(self.sub.status, "rejected")

    def test_student_forbidden(self):
        resp = auth(self.student).patch(self.url, {"status": "approved"})
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_401(self):
        resp = self.client.patch(self.url, {"status": "approved"})
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_reviewed_at_set_after_review(self):
        before = timezone.now()
        auth(self.teacher).patch(self.url, {"status": "approved"})
        self.sub.refresh_from_db()
        self.assertIsNotNone(self.sub.reviewed_at)
        self.assertGreaterEqual(self.sub.reviewed_at, before)

    def test_admin_can_review(self):
        resp = auth(self.admin).patch(self.url, {"status": "approved"})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)


class FilteringTest(BaseAssignmentTestCase):

    def test_filter_by_topic(self):
        resp = auth(self.teacher).get(
            reverse("assignment-list"), {"topic": self.topic.id}
        )
        data = resp.data.get("results", resp.data)
        for item in data:
            self.assertEqual(item["topic"], self.topic.id)

    def test_search_by_title(self):
        resp = auth(self.teacher).get(
            reverse("assignment-list"), {"search": "inequality"}
        )
        data = resp.data.get("results", resp.data)
        self.assertTrue(any("inequality" in a["title"].lower() for a in data))

    def test_filter_submissions_by_status(self):
        Submission.objects.create(
            student=self.student, assignment=self.assignment, status="approved"
        )
        resp = auth(self.teacher).get(
            reverse("submission-list"), {"status": "approved"}
        )
        data = resp.data.get("results", resp.data)
        self.assertTrue(all(s["status"] == "approved" for s in data))