"""Render a silent, watermarked visual storyboard from recorded local evidence.

This never fabricates model output, terminal footage, narration or a completed
Claude workflow. Final production needs separately recorded provider/audio inputs.
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
from functools import partial

from PIL import Image, ImageDraw, ImageFont

FOREST, CREAM, LIME, RUST, SAGE = '#16382b', '#f6f5ed', '#d8eea0', '#af432d', '#e7eadf'
WIDTH, HEIGHT = 1920, 1080


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def font(size, bold=False):
    candidate = Path('C:/Windows/Fonts/arialbd.ttf' if bold else 'C:/Windows/Fonts/arial.ttf')
    return ImageFont.truetype(str(candidate), size)


def frame(number, title, subtitle, light=False, banner='VISUAL DRAFT  /  NO FINAL NARRATION  /  CLAUDE PROPOSAL PENDING'):
    bg, fg = (CREAM, FOREST) if light else (FOREST, CREAM)
    image = Image.new('RGB', (WIDTH, HEIGHT), bg)
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, WIDTH, 70), fill=RUST)
    draw.text((70, 16), banner, font=font(30, True), fill=CREAM)
    draw.text((88, 117), 'MergeWitness', font=font(40, True), fill=fg)
    draw.text((1750, 117), f'{number:02}', font=font(40), fill=fg)
    title_size = 82
    while draw.textbbox((0, 0), title, font=font(title_size, True))[2] > WIDTH - 176:
        title_size -= 1
        assert title_size >= 60, 'Rewrite an overlong title instead of making it illegible.'
    draw.text((88, 222), title, font=font(title_size, True), fill=fg)
    draw.text((88, 342), subtitle, font=font(40), fill=fg)
    draw.line((88, 974, 1832, 974), fill=fg, width=2)
    draw.text((88, 1002), '0.3.0  /  TRUSTED SYNTHETIC CASE  /  DECLARED CHECKS ONLY', font=font(24), fill=fg)
    return image, draw, fg


def text(draw, x, y, lines, color=FOREST, size=52, step=82):
    for index, line in enumerate(lines):
        draw.text((x, y + index * step), line, font=font(size), fill=color)


def render(evaluation, negative, out, repair=None, replay=None, provider=None):
    data = json.loads(evaluation.read_text(encoding='utf-8'))
    control = json.loads(negative.read_text(encoding='utf-8'))
    matrix = data['probe']['matrix']
    assert data['version'] == 2 and data['probe']['classification'] == 'interaction_witness'
    assert [matrix[key]['kind'] for key in ('base', 'branchA', 'branchB', 'merged')] == ['pass', 'pass', 'pass', 'fail']
    assert all(row['exitCode'] == 0 for row in data['normalTests'].values())
    observed = matrix['merged']['runs'][0]['probe']['payload']['evidence']
    assert observed['observed'] == 90 and observed['expected'] == 100
    assert control['passed'] is False and control['retentionVerified'] is False
    assert control['probe']['kind'] == 'pass'
    required = {row['id']: row['result']['kind'] for row in control['requirementResults']}
    assert required == {'tenant-pricing': 'pass', 'sku-cache': 'fail'}
    verified = all((repair, replay, provider))
    assert verified or not any((repair, replay, provider)), 'Supply all three workflow evidence inputs together.'
    if verified:
        repairs = [json.loads(path.read_text(encoding='utf-8')) for path in (repair, replay)]
        for result in repairs:
            assert result['passed'] is True and result['retentionVerified'] is True
            assert result['probe']['kind'] == 'pass' and result['normalTests']['exitCode'] == 0
            assert {r['id']: r['result']['kind'] for r in result['requirementResults']} == {'tenant-pricing': 'pass', 'sku-cache': 'pass'}
            assert result['changedFiles'] == ['src/catalog.js']
        assert repairs[0]['analysisId'] != repairs[1]['analysisId']
        origin = json.loads(provider.read_text(encoding='utf-8'))
        assert origin['client'] == 'claude.ai web' and origin['recordingMethod'] == 'user-forwarded phone response'
    banner = 'VISUAL DRAFT  /  NO FINAL NARRATION  /  WEB PROPOSAL VERIFIED LOCALLY' if verified else 'VISUAL DRAFT  /  NO FINAL NARRATION  /  CLAUDE PROPOSAL PENDING'
    make_frame = partial(frame, banner=banner)
    out.mkdir(parents=True, exist_ok=False)
    frames = []

    image, draw, fg = make_frame(1, 'Two changes pass their tests.', 'Together, an operation sequence exposes the interaction.')
    draw.text((92, 510), '90', font=font(230, True), fill=LIME)
    draw.text((690, 550), 'observed for beta', font=font(63), fill=fg)
    draw.text((92, 802), '100 expected from a fresh catalog', font=font(65), fill=fg)
    frames.append((image, 12))

    image, draw, fg = make_frame(2, 'Replay locally. Inspect the evidence.', 'MIT core  /  Node >=22  /  reviewed code only', True)
    text(draw, 92, 500, ['Install the accepted package.', 'Run the reproducible example.', 'Open the recorded offline report.'], size=67, step=118)
    draw.text((92, 878), 'Installation and source instructions are separate.', font=font(36), fill=fg)
    frames.append((image, 16))

    image, draw, fg = make_frame(3, 'The comparison makes the witness visible.', 'Actual JSON observations from the installed 0.3.0 API', True)
    for index, (key, label) in enumerate([('base', 'BASE'), ('branchA', 'PRICING'), ('branchB', 'CACHE'), ('merged', 'COMBINED')]):
        x = 90 + index * 440
        fail = matrix[key]['kind'] == 'fail'
        draw.rounded_rectangle((x, 480, x + 400, 840), radius=16, fill=RUST if fail else FOREST)
        draw.text((x + 28, 517), label, font=font(34, True), fill=CREAM)
        draw.text((x + 28, 605), 'FAIL' if fail else 'PASS', font=font(64, True), fill=CREAM if fail else LIME)
        value = matrix[key]['runs'][0]['probe']['payload']['evidence']['observed']
        draw.text((x + 28, 730), str(value), font=font(75, True), fill=CREAM)
    draw.text((92, 880), 'Ordinary tests passed in all four snapshots. The frozen sequence did not.', font=font(38), fill=fg)
    frames.append((image, 20))

    image, draw, fg = make_frame(4, 'A model suggests. The local tool checks.', 'Claude web response forwarded by the user / verified locally' if verified else 'Planned Claude web route / actual proposal not yet recorded')
    lines = ['const key = JSON.stringify([tenant, sku]);', 'Sequence + both required features: PASS.', 'Same recorded code passed a fresh analysis.'] if verified else ['Freeze the sequence and A/B requirements.', 'Record a real Claude web proposal.', 'Review, apply and verify it locally.']
    text(draw, 92, 510, lines, color=fg, size=59, step=112)
    note = 'Provider origin reported by the user. No Claude Code/MCP claim.' if verified else 'This storyboard contains no simulated chat or model-generated repair.'
    draw.text((92, 883), note, font=font(36), fill=LIME)
    frames.append((image, 27))

    image, draw, fg = make_frame(5, 'A symptom can disappear while a feature is lost.', 'Recorded no-cache control: the repair was rejected.', True)
    for index, (label, state, colour) in enumerate([('SEQUENCE', 'PASS', FOREST), ('TENANT PRICING', 'PASS', FOREST), ('CACHE', 'FAIL', RUST)]):
        x = 90 + index * 580
        draw.rounded_rectangle((x, 490, x + 530, 790), radius=16, fill=colour)
        draw.text((x + 30, 540), label, font=font(38, True), fill=CREAM)
        draw.text((x + 30, 645), state, font=font(75, True), fill=CREAM)
    draw.text((92, 859), 'Approval: false. Retention verified: false. Ordinary cache test also failed.', font=font(37), fill=fg)
    frames.append((image, 26))

    image, draw, fg = make_frame(6, 'Passing covers the checks you declared.', 'The team keeps the code and the merge decision.')
    text(draw, 92, 515, ['No guarantee for undeclared behavior.', 'Worktrees are not hardened sandboxes.', 'Observed in one synthetic example.' if verified else 'The new model candidate and replay remain pending.'], color=fg, size=59, step=112)
    frames.append((image, 11))

    image, draw, fg = make_frame(7, 'Help test one real Node case.', 'First free integration pilot  /  not yet performed', True)
    text(draw, 92, 510, ['One trusted repository. One case.', 'Up to two technical sessions.', 'gabriel@mergewitness.com.br'], size=65, step=112)
    frames.append((image, 8))

    concat = []
    for index, (image, duration) in enumerate(frames, 1):
        name = f'scene-{index:02}.png'
        image.save(out / name)
        concat.extend([f"file '{name}'", f'duration {duration}'])
    concat.append("file 'scene-07.png'")
    (out / 'frames.ffconcat').write_text('\n'.join(concat) + '\n', encoding='utf-8')
    frames[0][0].save(out / 'poster-draft.png')
    command = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-n', '-f', 'concat', '-safe', '1', '-i', 'frames.ffconcat', '-t', '120', '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '24', '-movflags', '+faststart', 'mergewitness-030-visual-draft.mp4']
    subprocess.run(command, cwd=out, check=True)
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-xerror', '-i', str(out / 'mergewitness-030-visual-draft.mp4'), '-f', 'null', '-'], check=True)
    streams = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(out / 'mergewitness-030-visual-draft.mp4')]))
    assert abs(float(streams['format']['duration']) - 120) < 0.1
    assert all(stream['codec_type'] != 'audio' for stream in streams['streams'])
    manifest = {'status': 'VISUAL_STORYBOARD_DRAFT', 'finalFilmReady': False, 'durationSeconds': 120, 'narration': 'NOT_INCLUDED', 'claudeProposal': 'NOT_RUN', 'claudeCodeIntegration': 'NOT_RUN', 'inputs': {'evaluationSha256': sha(evaluation), 'negativeControlSha256': sha(negative)}, 'outputSha256': sha(out / 'mergewitness-030-visual-draft.mp4'), 'fullDecode': 'PASS', 'paletteSource': 'existing owner-private Site CSS', 'frames': {f'scene-{index:02}.png': sha(out / f'scene-{index:02}.png') for index in range(1, 8)}, 'limits': 'Silent annotated layout/timing review. Not a narrated final film, recorded Claude workflow, external pilot or browser QA.'}
    if verified:
        manifest['claudeProposal'] = 'USER_FORWARDED_RESPONSE_VERIFIED_LOCALLY'
        manifest['inputs'].update({'repairSha256':sha(repair), 'replayRepairSha256':sha(replay), 'providerSourceSha256':sha(provider)})
        manifest['limits'] = 'Silent annotated layout/timing review. User-forwarded provider origin; local verification. Not a narrated final film, captured provider UI, external pilot or browser QA.'
    (out / 'draft-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(manifest, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--evaluation', type=Path, required=True)
    parser.add_argument('--negative', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--repair', type=Path)
    parser.add_argument('--replay', type=Path)
    parser.add_argument('--provider', type=Path)
    args = parser.parse_args()
    render(args.evaluation.resolve(), args.negative.resolve(), args.out.resolve(), args.repair, args.replay, args.provider)
