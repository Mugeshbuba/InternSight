"""
Academic Record Provider — a swappable abstraction for verifying/fetching
student academic identity (APAAR ID and beyond).

WHY THIS EXISTS:
InternSight does not currently have official DigiLocker/APAAR API partner
access (see docs/APAAR_DigiLocker_Integration_Guide.md for the real path to
getting it). Rather than hardcoding "no verification" logic directly into
the router, every caller goes through this interface. The day real access
is approved, a new provider class gets written and swapped in below —
no router, frontend, or database code has to change.

Do not call GitHub/DigiLocker/etc APIs directly from routers. Add a
provider here instead.
"""

import re
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional


@dataclass
class AcademicRecordResult:
    apaar_id: str
    verified: bool
    source: str                      # "manual_entry" | "digilocker" | "api_setu" | ...
    institution: Optional[str] = None
    student_name: Optional[str] = None
    message: Optional[str] = None


class AcademicRecordProvider(ABC):
    """Every provider (manual, future DigiLocker, future Setu) implements this."""

    @abstractmethod
    def verify(self, apaar_id: str) -> AcademicRecordResult:
        ...


class ManualEntryProvider(AcademicRecordProvider):
    """
    Today's reality: no government API access. We only check that the ID
    is a well-formed 12-digit APAAR number. Never claim real verification.
    """

    def verify(self, apaar_id: str) -> AcademicRecordResult:
        cleaned = re.sub(r"\D", "", apaar_id or "")
        is_valid_format = bool(re.fullmatch(r"\d{12}", cleaned))

        return AcademicRecordResult(
            apaar_id=cleaned,
            verified=False,  # always False here — this provider can never truly verify
            source="manual_entry",
            message=(
                "Valid 12-digit format. Not verified against any government database."
                if is_valid_format else
                "Invalid format — APAAR IDs are 12 digits."
            )
        )


# --- Future providers slot in here, e.g.: ---
#
# class DigiLockerProvider(AcademicRecordProvider):
#     """Real verification once InternSight has DigiLocker/API Setu partner access."""
#     def __init__(self, api_key: str):
#         self.api_key = api_key
#
#     def verify(self, apaar_id: str) -> AcademicRecordResult:
#         # call the real DigiLocker Authorized Partner API here
#         ...


def get_academic_record_provider() -> AcademicRecordProvider:
    """
    The one place that decides which provider is active.
    Swap this to return DigiLockerProvider(...) once real access exists —
    every caller (routers, services) is unaffected by the change.
    """
    return ManualEntryProvider()
