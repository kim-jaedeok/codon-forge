import { useState } from 'react';

interface Props {
  onSubmit: (text: string) => void;
}

const EXAMPLE_SEQ = `>Example_GFP_gene
ATGGTGAGCAAGGGCGAGGAGCTGTTCACCGGGGTGGTGCCCATCCTGGTCGAGCTGGACGGCGACGTAAACGGCCACAAGTTCAGCGTGTCCGGCGAGGGCGAGGGCGATGCCACCTACGGCAAGCTGACCCTGAAGTTCATCTGCACCACCGGCAAGCTGCCCGTGCCCTGGCCCACCCTCGTGACCACCCTGACCTACGGCGTGCAGTGCTTCAGCCGCTACCCCGACCACATGAAGCAGCACGACTTCTTCAAGTCCGCCATGCCCGAAGGCTACGTCCAGGAGCGCACCATCTTCTTCAAGGACGACGGCAACTACAAGACCCGCGCCGAGGTGAAGTTCGAGGGCGACACCCTGGTGAACCGCATCGAGCTGAAGGGCATCGACTTCAAGGAGGACGGCAACATCCTGGGGCACAAGCTGGAGTACAACTACAACAGCCACAACGTCTATATCATGGCCGACAAGCAGAAGAACGGCATCAAGGTGAACTTCAAGATCCGCCACAACATCGAGGACGGCAGCGTGCAGCTCGCCGACCACTACCAGCAGAACACCCCCATCGGCGACGGCCCCGTGCTGCTGCCCGACAACCACTACCTGAGCACCCAGTCCGCCCTGAGCAAAGACCCCAACGAGAAGCGCGATCACATGGTCCTGCTGGAGTTCGTGACCGCCGCCGGGATCACTCTCGGCATGGACGAGCTGTACAAGTAA`;

export function TextPasteInput({ onSubmit }: Props) {
  const [text, setText] = useState('');

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Paste DNA sequence (FASTA or raw sequence)..."
        className="w-full h-48 p-3 text-base font-mono bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
        spellCheck={false}
      />
      <div className="flex gap-2">
        <button
          onClick={() => onSubmit(text)}
          disabled={!text.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium"
        >
          Analyze
        </button>
        <button
          onClick={() => { setText(EXAMPLE_SEQ); onSubmit(EXAMPLE_SEQ); }}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-base"
        >
          Example Sequence (GFP)
        </button>
        {text && (
          <button
            onClick={() => { setText(''); }}
            className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-base"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
