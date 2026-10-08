"""Meaningful evidence-pairing regressions; no Site writes or provider calls."""
import copy
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import hashlib

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('review_builder',ROOT/'media/product030/prepare_review.py')
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class EvidencePairing(unittest.TestCase):
    def setUp(self):
        self.directory=tempfile.TemporaryDirectory(prefix='mw-pairing-')
        self.run=Path(self.directory.name)
        reports=[('evaluationSha256','evaluation.json',{'analysisId':'first','evaluationId':'evaluation-1'}),
                 ('negativeControlSha256','negative.json',{'analysisId':'first','evaluationId':'evaluation-1'}),
                 ('repairSha256','repair.json',{'analysisId':'first','evaluationId':'evaluation-1'}),
                 ('replayRepairSha256','replay-repair.json',{'analysisId':'second'}),
                 ('providerSourceSha256','provider-source.json',{'recordingMethod':'synthetic unit-test metadata only'})]
        self.manifest={'inputs':{}}
        for key,name,data in reports:
            path=self.run/name
            path.write_text(json.dumps(data),encoding='utf-8')
            self.manifest['inputs'][key]=hashlib.sha256(path.read_bytes()).hexdigest()

    def tearDown(self): self.directory.cleanup()

    def test_accepts_matching_synthetic_pair(self):
        self.assertTrue(callable(getattr(module,'validate_run_inputs',None)))
        module.validate_run_inputs(self.run,self.manifest)

    def test_rejects_different_declared_input_before_writing(self):
        self.assertTrue(callable(getattr(module,'validate_run_inputs',None)))
        changed=copy.deepcopy(self.manifest)
        changed['inputs']['providerSourceSha256']='0'*64
        with self.assertRaisesRegex(AssertionError,'input hash'):
            module.validate_run_inputs(self.run,changed)

    def test_rejects_unrelated_evaluation_even_with_recomputed_hash(self):
        self.assertTrue(callable(getattr(module,'validate_run_inputs',None)))
        path=self.run/'evaluation.json'
        data=json.loads(path.read_text(encoding='utf-8'))
        data['analysisId']='unrelated-analysis'
        path.write_text(json.dumps(data),encoding='utf-8')
        changed=copy.deepcopy(self.manifest)
        changed['inputs']['evaluationSha256']=hashlib.sha256(path.read_bytes()).hexdigest()
        with self.assertRaisesRegex(AssertionError,'analysis'):
            module.validate_run_inputs(self.run,changed)


if __name__=='__main__': unittest.main()
