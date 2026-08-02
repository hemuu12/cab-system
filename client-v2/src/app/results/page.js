import { Suspense } from 'react';
import { readDesignCss } from '../../lib/readDesignCss.js';
import ResultsClient from '../../components/results/ResultsClient.jsx';
import LoadingScreen from '../../components/LoadingScreen.jsx';

export default function ResultsPage() {
  const resultsCss = readDesignCss('styles/results.css');
  return (
    <Suspense fallback={<LoadingScreen message="Finding the right cars…" detail="Matching comfort and capacity to your journey." />}>
      <ResultsClient resultsCss={resultsCss} />
    </Suspense>
  );
}
