from __future__ import annotations
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Optional
from datetime import datetime


@dataclass
class AgeAttributes:
    age_verified: bool
    age_band: str
    assurance_level: str


@dataclass
class AgePassport:
    issuer: str
    subject: str
    age_verified: bool
    age_band: str
    assurance_level: str
    issued_at: datetime
    expiry: datetime
    signature: Optional[str] = None


@dataclass
class Policy:
    allowed_categories: List[str] = field(default_factory=list)
    blocked_categories: List[str] = field(default_factory=list)
    time_rules: Dict[str, str] = field(default_factory=dict)
    device_rules: Dict[str, bool] = field(default_factory=dict)


@dataclass
class Avatar:
    avatar_id: str
    passport: AgePassport
    policies: Optional[Policy] = None


@dataclass
class AuditEvent:
    timestamp: datetime
    avatar_id: str
    site_id: str
    resource: str
    action: str
    decision: str
    rules_applied: List[str] = field(default_factory=list)

    def to_dict(self):
        d = asdict(self)
        # ensure datetime to ISO
        d["timestamp"] = self.timestamp.isoformat()
        return d
