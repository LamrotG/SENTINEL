# Sentinel — Product Specification

## Product Overview

Sentinel is a cybercrime investigation and intelligence platform designed for investigators, analysts, fraud teams, and digital forensic professionals.

The platform helps users collect evidence, connect entities, reconstruct events, build investigative theories, and generate actionable intelligence from large volumes of information.

Sentinel is not a cybersecurity monitoring tool, SIEM, or SOC dashboard. It is an investigation workspace focused on understanding incidents after they occur.

Core principle:

"Transform scattered evidence into structured intelligence."

---

# Product Goals

Sentinel should help users:

* Organize investigations
* Manage evidence
* Connect related entities
* Build timelines
* Develop theories
* Collaborate with teams
* Produce investigation reports

The platform must support both structured analysis and exploratory thinking.

---

# Target Users

## Cybercrime Investigators

Investigate phishing, fraud, account compromise, and digital crimes.

## Intelligence Analysts

Analyze connections between people, organizations, and digital assets.

## Digital Forensics Teams

Review evidence collected from devices, systems, and networks.

## Corporate Security Teams

Investigate internal incidents and security breaches.

## Financial Crime Analysts

Investigate fraud, money laundering, and suspicious transactions.

---

# Product Personality

Sentinel should feel:

* Professional
* Analytical
* Trustworthy
* Precise
* Data-driven
* Enterprise-grade

Never feel:

* Futuristic
* Gaming-inspired
* Military-themed
* Hacker-themed
* Sci-fi
* Cyberpunk

The product should look like software used daily by professional investigators.

---

# Design Principles

## Clarity Over Decoration

Information is more important than visual effects.

## Dense But Organized

Large amounts of data should remain easy to scan.

## Investigation First

Every screen should support investigative workflows.

## Context Matters

Relationships between information should always be visible.

## Evidence-Centric

Evidence is the foundation of every conclusion.

---

# Visual Style Guide

## Theme

Dark mode only.

## Aesthetic

Enterprise intelligence platform.

Inspired by:

* Investigation software
* Intelligence analysis tools
* Digital forensics applications
* Professional case management systems

Avoid:

* Neon effects
* Glow effects
* RGB accents
* Hacker aesthetics
* Excessive gradients

---

## Color System

Background:
Near-black charcoal

Surface:
Dark slate gray

Borders:
Subtle low-contrast separators

Primary Accent:
Blue

Secondary Accent:
Indigo

Success:
Green

Warning:
Amber

Danger:
Red

Information:
Blue

Confidence:
Purple

---

## Typography

Style:
Modern sans-serif

Characteristics:

* Highly readable
* Compact
* Professional

Hierarchy:

* Page Titles
* Section Titles
* Labels
* Metadata
* Body Text

Avoid oversized typography.

---

## Layout Rules

Desktop-first.

Designed for:

* Analysts
* Large monitors
* Multi-panel workflows

Preferred layout:

* Left navigation
* Top command bar
* Main content area
* Context panels

Allow multiple panels to be visible simultaneously.

---

# Core Product Modules

## Dashboard

Investigation overview.

## Cases

Case management.

## Investigation Workspace

Visual intelligence canvas.

## Evidence Vault

Evidence repository.

## Timeline Reconstruction

Chronological event analysis.

## Entity Intelligence

People, domains, IPs, devices, organizations.

## Reports

Findings and report generation.

---

# Signature Feature

## Investigation Workspace

The centerpiece of Sentinel.

An infinite investigative canvas where users can:

* Create notes
* Add theories
* Attach evidence
* Connect entities
* Organize findings
* Build narratives

The workspace should feel like a digital evolution of a real detective evidence board.

Objects include:

* Sticky Notes
* Evidence Cards
* Person Cards
* Organization Cards
* Device Cards
* Domain Cards
* IP Cards
* Image Evidence
* Timeline Events
* Theory Cards

Users can visually connect objects with relationship lines.

---

# Realistic Data Guidelines

Every screen should contain realistic investigative content.

Never use:

* John Doe
* Jane Smith
* Test User
* Example Company
* Sample Data

Use believable investigation scenarios.

---

## Example Case

Case Name:
Business Email Compromise — EastGate Logistics

Case ID:
CAS-2026-0148

Status:
Active Investigation

Priority:
High

Lead Investigator:
Sarah Chen

Created:
March 12, 2026

---

## Example Entities

People:

* Sarah Chen
* Marcus Reed
* Elena Torres
* David Holt

Organizations:

* EastGate Logistics
* Horizon Financial Group
* NorthStar Imports

Domains:

* eastgate-logistics.com
* secure-eastgate-login.com
* horizon-payments.net

IPs:

* 185.233.81.14
* 91.203.17.22
* 103.122.54.91

Emails:

* [finance@eastgate-logistics.com](mailto:finance@eastgate-logistics.com)
* [operations@northstarimports.com](mailto:operations@northstarimports.com)
* [support@secure-eastgate-login.com](mailto:support@secure-eastgate-login.com)

Wallets:

* BTC Wallet IDs
* Ethereum Wallet IDs

Devices:

* Employee Laptop
* Android Device
* VPN Gateway

---

## Example Evidence

* Phishing_Email_March12.eml
* VPN_Login_Records.csv
* Invoice_Request.pdf
* Funds_Transfer_Confirmation.png
* Endpoint_Forensics_Report.pdf
* Chat_Export.zip
* Browser_History_Report.pdf

---

# Confidence Model

Sentinel tracks confidence levels.

Confidence indicates how strongly evidence supports a relationship or conclusion.

Low:
0–39%

Medium:
40–69%

High:
70–100%

Example:

Relationship:
Marcus Reed → secure-eastgate-login.com

Confidence:
82%

Supporting Evidence:

* Registration record
* Email correlation
* Login activity

---

# Investigation Workflow

1. Create Case

2. Collect Evidence

3. Extract Entities

4. Build Connections

5. Develop Theories

6. Reconstruct Timeline

7. Validate Findings

8. Generate Report

---

# Interaction Patterns

Common actions:

* Drag and drop
* Multi-select
* Link entities
* Pin evidence
* Create notes
* Filter datasets
* Zoom canvas
* Open side panels
* Compare evidence

The platform should encourage exploration and discovery.

---

# Content Tone

Professional.

Objective.

Evidence-based.

Avoid emotional language.

Use terminology commonly found in investigations and intelligence analysis.

Examples:

Good:

* Evidence Linked
* Related Entities
* Investigation Status
* Confidence Score
* Findings
* Correlation Detected

Avoid:

* Hacker Alert
* Threat Destroyed
* Enemy Activity
* Mission Control
* Cyber Attack Radar

---

# Success Criteria

A user viewing Sentinel for the first time should immediately think:

"This looks like a real investigative intelligence platform used by professionals."

Not:

"This is a student dashboard project."
