# External validation protocol

Status: prepared locally; **0 participants contacted, 0 external installations observed, 0 return visits recorded**. Execute only after the release and outreach are specifically authorized. Automated checks and project agents are not external participants.

## Participants and session

Recruit five developers outside this project who work on Node/JavaScript repositories. Prefer people with an actual cache, queue or stateful-regression problem. Node >=22, npm and Git must already be available; record setup time separately if prerequisites are missing. Participation does not require stars, endorsements or a pull request.

Provide only the public release link, SHA-256 and QUICKSTART. Start a timer when the developer opens the guide. They should install into a new directory, run the tenant-cache demo, find the wrong combined observation, identify the repaired result, and explain which two features were retained. A completed installation alone is not a completed reproduction.

Success target: three of five finish without assistance in approximately ten minutes. Record actual elapsed time, errors, questions and interventions. If assistance is needed, record the point where the unaided attempt ended; do not silently count it as unaided success.

Second task: ask the developer to bring a reviewed operation sequence from their own project, or explain why no relevant problem exists. Have them distinguish an interaction-only failure from a known preexisting regression, declare the necessary retention checks, and identify which dependencies/environment are outside the guarantee. Do not execute private/unreviewed code or collect it without their permission.

## Follow-up and continuation

After 7-14 days, ask whether they used the tool again, reproduced another case, or encountered a concrete blocker. Target two concrete returns. A polite reply or repository star is not a return-use result. Record a dated case/result or a specific question instead.

Expand functionality after an independently reproduced real regression or repeated use with an observed benefit. Record how the previous workflow differed, time spent on both workflows when measurable, and limitations. If the targets are missed, summarize why and revise installation or positioning before increasing scope. These targets are internal learning gates, not OpenAI requirements.

## Minimal evidence record

Use an anonymous participant ID and store consented notes under ignored `artifacts/external-validation/`. Do not commit email, private repository paths or code, recordings, tokens, or names without permission. Publish only an aggregate or separately approved case.

```json
{
  "participantId": "P01",
  "observed": false,
  "consentToPublishAnonymizedSummary": false,
  "sessionDate": null,
  "releaseTag": null,
  "tarballSha256": null,
  "nodeVersion": null,
  "gitVersion": null,
  "os": null,
  "prerequisitesReady": null,
  "elapsedSeconds": null,
  "unaidedReproduction": null,
  "assistance": [],
  "identifiedFailureAndRetention": null,
  "externalCaseReproduced": null,
  "followUpDate": null,
  "concreteReturn": null,
  "observedBenefit": null
}
```

No event is observed until supported by a participant session or readback. Summaries must report denominators, failures, assisted attempts and missing follow-ups.
