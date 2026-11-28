from hashlib import sha256
from pathlib import Path
import sys
import unittest
from unittest.mock import patch
from urllib.error import HTTPError

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from refresh import check_document, matches_source


class ReportVerificationTests(unittest.TestCase):
    source = {"url": "https://example.org/report.pdf", "sha256": sha256(b"original").hexdigest()}
    last = {"url": source["url"], "verified": "2024-06-01", "status": "Verified"}

    def check(self):
        return check_document(self.source, {self.source["url"]: self.last}, "2026-11-19")

    @patch("refresh.retrieve", return_value=b"original")
    def test_verified_file_advances_its_own_date(self, retrieve):
        self.assertEqual(self.check()["verified"], "2026-11-19")

    @patch("refresh.retrieve", return_value=b"replacement")
    def test_changed_document_preserves_review_date(self, retrieve):
        result = self.check()
        self.assertEqual(result["verified"], self.last["verified"])
        self.assertIn("changed", result["status"])

    @patch("refresh.retrieve", side_effect=HTTPError("https://example.org", 403, "Forbidden", {}, None))
    def test_inaccessible_report_preserves_verification(self, retrieve):
        result = self.check()
        self.assertEqual(result["verified"], self.last["verified"])
        self.assertIn("unavailable", result["status"])


class PolicyVerificationTests(unittest.TestCase):
    def test_matches_visible_terms_through_markup_and_spaces(self):
        policy = {"required_text": ["$0.15 per gram", "two hours"]}
        self.assertTrue(matches_source(policy, b"<p>$0.15 per&nbsp;<b>gram</b></p><p>TWO HOURS</p>"))
        self.assertFalse(matches_source(policy, b"<p>$0.20 per gram. Two hours</p><script>$0.15 per gram</script>"))
