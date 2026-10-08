# Narrated film and current-product Site refinement

Recorded 2026-10-08; root baseline `b735d892e4afaf0dd3f77422b9b313128bcd1e23`. This is a technical/preparation milestone, not external adoption, human listening approval or public release.

## Actual narration and media

The native IAB entry point still returned `Browser is not available: iab`. A newly available dedicated Playwright MCP browser reached the existing Google Vids account normally. It used its own tabs, not native desktop mouse/keyboard input. No security/authentication/billing setting was changed. The cause of IAB unavailability was not established.

The original Knox audition was preserved and downloaded: 12.288 seconds, 116195 bytes, SHA-256 `4826392b56fd4a6718f0bec9546ca031433285cb71a54d04fc42c39185ca3c8a`. One complete stock-Knox narration was generated in a new owner-private Vids document, 274 words/1676 characters, 101.888 seconds. Exported source SHA-256 `d008b077fb1266249983f7c2d04388c66129d1ca97a9351d54fbc06cd7261f2f`. The original speech was retained, with section pauses inserted for the 120-second edit and no speech respeeding.

Local [faster-whisper](https://github.com/SYSTRAN/faster-whisper) base.en recognition matched 98.175% of known script tokens and supplied approximate word timing. Proper-name recognition was ambiguous for Git/Claude; recognition is not listening approval. Model audio input was unavailable. The source script remains the caption/transcript authority. A PyAV interface mismatch was recorded and resolved through the library's supported NumPy input, using already decoded PCM; no vendor package or global settings were edited.

The selected `narrated-film-003` preserves the corrected 002 video/audio bytes and improves captions. Deliverables include 1080p master, 720p web MP4, poster, 30-second derivative, bilingual captions/transcripts and hashed provenance. All MP4s passed full decode. Web film SHA-256: `fabbc2e210d439809d4356479180b0b8758b5da22f25d69d1936b22bc86ff191`. Teaser SHA-256: `bc2c681ce77de493e0fe2d73b969d06d59e71a8c2eb2955aa2c2c468d1d02657` (30.02 seconds).

Diagrams illustrate actual recorded synthetic observations; no chat/terminal footage was fabricated. The supplied demo repair remains separate from the user-forwarded Claude proposal. All five draft/run evidence hashes and evaluation identities remain bound. Source/control/replay limitations and related-work overlap remain unchanged.

## Review and correction

One fresh whole-milestone review found no Critical issue and one Important issue: captions could flash too quickly. The single correction pass rebalanced orphan fragments, merged/extended short cues, imposed a minimum one-second duration and a maximum 28 characters/second, and rebuilt full/teaser captions directly from selected complete sentences. The new readability regression was RED before the fix, then GREEN. Full film has 35 EN/37 PT cues; teaser has 9 EN/10 PT cues, each at most two lines. Earlier drafts and failures were retained.

Focused checks: 10/10 Node controller/installed-companion tests, 4/4 timing/readability tests and 3/3 media-input tests. The new optional companion completed a fresh exact offline 0.3.0 installation, verified the supplied synthetic repair and generated HTML using the actual returned directory. The accepted tarball/core inputs were not changed; the earlier 93-test Windows suite was not relabeled as a new full-suite run.

## Actual rendered QA

The existing owner-private Site was refined within the forest/cream/lime identity: clearer behavioral-regression message, new film before current evidence/install, prerequisites before download, copied commands and supplied-demo helper, one factual early-stage statement, larger language/navigation targets, and preserved contest material in collapsible history. All translation keys resolve in EN/PT.

| Check | Observed result |
| --- | --- |
| Identity/content | Current project title, useful headings and full content; no framework error overlay |
| Desktop/mobile | Actual 1440×900 and 390×844 rendered screenshots inspected |
| Responsive failure/fix | Installer grid initially widened the 375px content viewport to 773px; constrained tracks/command overflow fixed it to 375px/375px |
| Film interaction | Actual click started playback, unmuted, volume 1, readyState 4; playback reached 120 seconds |
| Language/captions | EN → PT → EN; 35 EN and 37 PT cues loaded; PT minimum cue duration one second |
| Navigation targets | EN/PT buttons measured 44×44px; current film/installation/history links work |
| Command copy | Actual helper-copy click returned `Copiado`; native clipboard reading remained unverified after a pending read was terminated, without granting broader permission |
| Download | Downloaded helper SHA-256 matched tested source: `5dd1177b0c8c56c14524fc1a0590255d8f4599072787fbf5106bee916455fe48` |
| History/license | Details opens; original lab, video URL, frozen source and MIT attribution preserved |
| Console | No errors/warnings on final current Site navigation |

Current private source: `f6761970b7034247cf136302494d64048cc10547`; native deployment `appgdep_6ac81c9bafdc8191b3f048a9ae30420c` succeeded. Archive SHA-256 `d1b085020d7ebc69615fad58f328a67f9e9a6193b7fe4cc88688fa74209811cb`; all 84 static files matched. Audience readback: owner-private, one owner, zero groups/external visitors, private version 5. Public `mergewitness.com.br` remains the original public version 2.

Owner listening/finishing approval is pending. Public publication, an independent remote, outreach, real external pilots and applications retain their explicit later-authorization/evidence gates. No new paid API use, external message or application occurred. Complete outputs, screenshots and original review remain under ignored `artifacts/startup-0.3.0/claude-video/`.
