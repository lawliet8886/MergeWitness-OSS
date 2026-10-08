"""Timing/evidence regressions for the optional production helpers."""
import importlib.util
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
path=ROOT/'media/product030/film_timing.py'
module=None
if path.exists():
    spec=importlib.util.spec_from_file_location('film_timing',path)
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)


class FilmTiming(unittest.TestCase):
    def test_rejects_unrelated_recognized_speech(self):
        self.assertIsNotNone(module)
        with self.assertRaisesRegex(ValueError,'speech'):
            module.align_words(['Alpha receives ninety.'],[{'word':'Something','start':0,'end':1},{'word':'else','start':1,'end':2}])

    def test_number_spelling_and_sections_bind_to_actual_word_times(self):
        self.assertIsNotNone(module)
        recognized=[{'word':'Alpha','start':0,'end':.4},{'word':'receives','start':.4,'end':.8},{'word':'90.','start':.8,'end':1.2},{'word':'Beta','start':1.8,'end':2.2},{'word':'receives','start':2.2,'end':2.6},{'word':'100.','start':2.6,'end':3.2}]
        result=module.align_words(['Alpha receives ninety.','Beta receives one hundred.'],recognized)
        self.assertEqual(result['matchRatio'],1)
        self.assertEqual(result['sectionStarts'],[0,1.8])
        self.assertEqual(result['words'][-1]['end'],3.2)

    def test_rejects_overlapping_or_out_of_movie_captions(self):
        self.assertIsNotNone(module)
        module.validate_cues([{'start':0,'end':1,'text':'Valid'}],2)
        for cues in [[{'start':0,'end':1.4,'text':'A'},{'start':1,'end':2,'text':'B'}],[{'start':1,'end':3,'text':'A'}],[{'start':1,'end':1,'text':'A'}]]:
            with self.assertRaises(ValueError):module.validate_cues(cues,2)

    def test_rejects_flashing_captions_and_rebalances_orphan_chunks(self):
        self.assertIsNotNone(module)
        with self.assertRaisesRegex(ValueError,'read'):
            module.validate_cues([{'start':0,'end':.38,'text':'Leia as evidências.'}],2)
        text='O problema pode estar escondido na ordem das operações, mesmo após um merge sem conflito.'
        parts=module.chunks(text)
        self.assertTrue(all(len(part.split())>=3 for part in parts))
        cues=module.readable_cues([{'start':0,'end':.4,'text':'Read the evidence.'},{'start':1.1,'end':1.6,'text':'Keep what matters.'}],3)
        module.validate_cues(cues,3)
        self.assertTrue(all(c['end']-c['start']>=1 for c in cues))


if __name__=='__main__':unittest.main()
