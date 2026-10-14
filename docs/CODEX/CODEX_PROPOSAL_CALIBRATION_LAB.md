# Codex planning handoff — proposed ICU Calibration Lab

**State: PROPOSAL — do not treat as authorized implementation.**
See [RFC-001](../PROPOSALS/CALIBRATION_LAB_RFC_001.md).

When an implementation is approved:
1. Read AGENTS.md, README.md, docs/API/README.md, current API contract, and RFC-001. Inspect actual packages/tests before designing changes.
2. Report design conflicts with existing standardization charter, browser observer contracts, and snapshot versioning. Preserve v0.1 stability.
3. Propose phased vertical slices: coordinate-space definitions, portable comparison engine, browser DOM/canvas/interaction calibration lab, JSON result/schema, privacy-safe diagnostics, optional 3D provider contract, cross-browser/real-hardware guide.
4. Specify exact purpose → behavior → test → evidence for CAL-001 through CAL-015.
5. No mandatory 3D framework or capture vendor dependency. TS and native JS are first-class.
6. Preserve a dependency replacement pathway and cold-inheritance docs. Never report test success without actually running tests.
7. Add docs/API/ changes **in the same commit** as any public API change, in accordance with existing repository rules.

Start with a proposal review/design audit; DO NOT implement merely because this handoff exists.
