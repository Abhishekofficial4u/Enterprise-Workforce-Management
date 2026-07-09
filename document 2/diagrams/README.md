# Architecture Diagrams Directory

This directory contains references to the visual architecture diagrams representing the system workflows.

## Inline Mermaid Diagrams
Rather than keeping separate image binary files, all architectural and database diagrams are written as inline **Mermaid** blocks directly inside the Markdown documents. 

This enables easy version control tracking and edits.

### Main Diagrams Index

1. **System Components Diagram**:
   * Location: [ARCHITECTURE.md](../ARCHITECTURE.md#1-high-level-architecture)
   * Type: High-Level Topology Architecture.
2. **API Request Lifecycle Sequence**:
   * Location: [ARCHITECTURE.md](../ARCHITECTURE.md#3-backend-architecture)
   * Type: Sequence Flow.
3. **Database Schema (ERD)**:
   * Location: [DATABASE.md](../DATABASE.md#1-entity-relationship-diagram-erd)
   * Type: Entity Relationship Diagram.
4. **Leave Balance Approval Flow**:
   * Location: [FEATURES.md](../FEATURES.md#2-time-attendance--leave-module)
   * Type: Process Flowchart.
5. **Login Account Lockout Checks Flow**:
   * Location: [AUTHENTICATION.md](../AUTHENTICATION.md#2-dynamic-login--account-lockout-flow)
   * Type: Logical Decision Flowchart.
6. **Redis Cache Verification Flow**:
   * Location: [STATE_MANAGEMENT.md](../STATE_MANAGEMENT.md#2-server-side-caching-redis)
   * Type: Caching Sequence Diagram.

---

*Note: If your Markdown editor does not natively render Mermaid syntax, you can copy the raw Mermaid code block and paste it into the online [Mermaid Live Editor](https://mermaid.live/) to inspect or export the graphics.*
