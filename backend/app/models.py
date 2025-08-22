from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from .db import Base

class Organization(Base):
    __tablename__ = "organizations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    users = relationship("User", back_populates="organization")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="pss_analyst")  # pss_owner, pss_analyst, client_admin, client_contributor, client_readonly, auditor_readonly
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)

    organization = relationship("Organization", back_populates="users")

class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    industry = Column(String, nullable=True)
    region = Column(String, nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    qid = Column(String, unique=True, nullable=False)  # e.g., Q-ISO-A5-01
    text = Column(Text, nullable=False)
    help = Column(Text, nullable=True)
    answers = Column(Text, nullable=False)  # JSON array as string for MVP
    weight = Column(Integer, nullable=False, default=1)
    iso_refs = Column(Text, nullable=True)  # JSON array as string
    soc2_refs = Column(Text, nullable=True)  # JSON array as string
    evidence_required = Column(Boolean, default=False)
