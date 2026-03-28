import { useState } from 'react';
import { Tabs } from '../ui/Tabs';
import type { DNASequence } from '../../types/sequence';
import type { BasicStats, ORF, RestrictionSite, CodonUsageEntry, GCWindowPoint, MotifMatch } from '../../types/analysis';
import { BasicStatsCard } from './BasicStatsCard';
import { ReverseComplementView } from './ReverseComplementView';
import { ORFTable } from './ORFTable';
import { TranslationView } from './TranslationView';
import { CodonUsageTable } from './CodonUsageTable';
import { RestrictionSiteTable } from './RestrictionSiteTable';
import { MotifSearchPanel } from './MotifSearchPanel';
import { NucleotideFreqChart } from '../visualization/NucleotideFreqChart';
import { GCWindowPlot } from '../visualization/GCWindowPlot';
import { ORFMap } from '../visualization/ORFMap';
import { RestrictionMap } from '../visualization/RestrictionMap';
import { SequenceViewer } from '../visualization/SequenceViewer';
import { AIInterpreterTab } from './AIInterpreterTab';

interface Props {
  sequence: DNASequence;
  stats: BasicStats;
  revComp: string;
  orfs: ORF[];
  translation: string;
  codonUsage: CodonUsageEntry[];
  restrictionSites: RestrictionSite[];
  motifMatches: MotifMatch[];
  gcWindowData: GCWindowPoint[];
  motifPattern: string;
  setMotifPattern: (p: string) => void;
  useRegex: boolean;
  setUseRegex: (v: boolean) => void;
  gcWindowSize: number;
  setGCWindowSize: (v: number) => void;
  minOrfLength: number;
  setMinOrfLength: (v: number) => void;
}

const TABS = ['Basic Stats', 'ORF Analysis', 'Restriction Enzymes', 'Motif Search', 'Codon Usage', 'Visualization', 'Sequence Viewer', 'AI Interpretation'];

export function ResultsPanel(props: Props) {
  const [tab, setTab] = useState(0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Analysis Results</h2>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <div className="mt-2">
        {tab === 0 && (
          <div className="space-y-6">
            <BasicStatsCard stats={props.stats} />
            <ReverseComplementView revComp={props.revComp} />
            <TranslationView translation={props.translation} />
          </div>
        )}

        {tab === 1 && (
          <div className="space-y-6">
            <ORFTable orfs={props.orfs} minLength={props.minOrfLength} onMinLengthChange={props.setMinOrfLength} />
            <ORFMap orfs={props.orfs} seqLength={props.sequence.length} />
          </div>
        )}

        {tab === 2 && (
          <div className="space-y-6">
            <RestrictionSiteTable sites={props.restrictionSites} />
            <RestrictionMap sites={props.restrictionSites} seqLength={props.sequence.length} />
          </div>
        )}

        {tab === 3 && (
          <MotifSearchPanel
            matches={props.motifMatches}
            pattern={props.motifPattern}
            onPatternChange={props.setMotifPattern}
            useRegex={props.useRegex}
            onUseRegexChange={props.setUseRegex}
          />
        )}

        {tab === 4 && <CodonUsageTable data={props.codonUsage} />}

        {tab === 5 && (
          <div className="space-y-6">
            <NucleotideFreqChart stats={props.stats} />
            <GCWindowPlot
              data={props.gcWindowData}
              overallGC={props.stats.gcContent}
              windowSize={props.gcWindowSize}
              onWindowSizeChange={props.setGCWindowSize}
            />
          </div>
        )}

        {tab === 6 && <SequenceViewer sequence={props.sequence.raw} />}

        {tab === 7 && <AIInterpreterTab sequence={props.sequence} />}
      </div>
    </div>
  );
}
