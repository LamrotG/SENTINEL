Sentinel — Screens Specification (screens.md)
Overview

This document defines all core screens of Sentinel, a cybercrime investigation intelligence platform.

Each screen must:

Follow Sentinel UI System Rules
Use realistic investigation data
Support analytical workflows
Be consistent in layout and components

All screens are desktop-first and part of a unified investigation workspace ecosystem.

1. Dashboard Screen
Purpose

Provide a high-level overview of all active investigations and system activity.

Layout
Top Bar
Global search (cases, entities, evidence)
Case switcher
Create new case button
Main Sections
Active Cases Panel
List of ongoing investigations
Case ID, title, status, priority
Last updated timestamp
Assigned investigator
Investigation Activity Feed
Recent actions:
Evidence uploaded
Entity linked
Timeline updated
Report generated
Alerts Panel
Suspicious activity detected
High-priority case updates
System flags (correlation detected)
Statistics Overview
Total cases
Active investigations
Closed cases
High priority cases
Key Interaction
Click case → opens Case Detail screen
Click activity → jumps to related evidence
2. Case Detail Screen
Purpose

Central hub for a single investigation.

Layout
Header Section
Case name
Case ID
Status (Active / Closed / Suspended)
Priority level
Assigned team
Overview Panel
Case summary
Timeline preview
Key entities involved
Evidence Summary
Number of evidence items
Latest uploads
Tagged categories
Entity Snapshot
People involved
Domains
IP addresses
Devices
Quick Actions
Open Investigation Workspace
Open Timeline
Open Evidence Vault
Generate Report
Key Interaction
Clicking “Open Workspace” launches Investigation Workspace (core feature)
3. Investigation Workspace (Signature Screen)
Purpose

Visual intelligence canvas for investigation reasoning, mapping, and theory building.

Layout
Infinite Canvas Area (Center)

Contains draggable objects:

Sticky Notes
Evidence Cards
Person Cards
Domain Cards
IP Cards
Device Cards
Organization Cards
Theory Cards
Left Panel (Tools)
Add Note
Add Evidence
Add Entity
Create Connection
Create Theory
Filter Layers
Right Panel (Inspector)
Selected object details
Metadata
Evidence links
Confidence score
Related entities
Core Interactions
Drag & Drop
Move all objects freely on canvas
Connections
Draw relationship lines between entities
Label connections (e.g., “owns”, “logged in from”)
Notes
Attach sticky notes anywhere
Color-coded by category
Evidence Linking
Attach evidence directly to entities or notes
Special Feature: Theory Cards

Users can create hypotheses:

Title
Supporting evidence
Contradicting evidence
Confidence score

Example:
“Compromised employee account used for intrusion”

4. Evidence Vault Screen
Purpose

Central repository for all investigation evidence.

Layout
Table View (Primary)

Columns:

File Name
Type (Email, PDF, Image, Log)
Source
Date Added
Tags
Linked Entities
Filters Panel
File type
Date range
Case
Entity association
Confidence level
Preview Panel (Right Side)
File preview
Metadata
Extracted entities
Linked cases
Key Interaction
Click evidence → opens detailed inspector
Drag evidence → workspace
5. Timeline Reconstruction Screen
Purpose

Rebuild chronological sequence of events in an investigation.

Layout
Timeline View (Center)
Vertical or horizontal event flow
Time-stamped events

Each event includes:

Timestamp
Event description
Related evidence
Entities involved
Left Panel
Filter by entity
Filter by evidence type
Date range selector
Right Panel
Event detail inspector
Linked evidence preview
Key Interaction
Drag events to reorder timeline
Auto-generate timeline from evidence set
6. Entity Intelligence Screen
Purpose

Central analysis of all entities in the system.

Entities include:

People
Domains
IPs
Devices
Organizations
Wallets
Layout
Entity Table
Entity name
Type
Risk score
Linked cases
Connections count
Graph Preview Panel
Relationship mini-map
Detail Panel
Full metadata
Connected entities
Evidence links
Case associations
7. Reports Screen
Purpose

Generate structured investigation reports.

Layout
Report Builder
Case summary
Timeline section
Evidence summary
Entity analysis
Findings
Template Selector
Fraud report
Phishing report
Internal breach report
Financial crime report
Export Options
PDF
DOCX
Internal sharing
Shared UI Components (Across All Screens)
Case Card
Evidence Card
Entity Card
Timeline Event Card
Theory Card
Connection Line
Inspector Panel
Activity Feed Item
System Behavior Rules
All screens must connect logically to Investigation Workspace
Evidence must always be linkable
Entities must always be cross-referenced
Every screen must support navigation back to Case Detail
Final Principle

Sentinel is not a dashboard system.

It is a connected intelligence environment where every screen contributes to building an investigation narrative.