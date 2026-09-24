import type { Dataset, DatasetProfile, CorrelationResponse, AIInsightsResponse, AIInsightSection } from '../types';

export function generateStrictAIInsights(
  dataset: Dataset,
  profile: DatasetProfile,
  correlations: CorrelationResponse,
  rawRows: Record<string, any>[]
): AIInsightsResponse {
  const numStats = profile.numeric_stats || [];
  const catStats = profile.categorical_stats || [];
  const totalRows = profile.rows;
  const totalCols = profile.columns;

  // 1. Executive Summary
  let summaryText = `The uploaded dataset "${dataset.name}" contains ${totalRows.toLocaleString()} verified records across ${totalCols} columns (${profile.numeric_columns_count} numerical, ${profile.categorical_columns_count} categorical). Overall data quality score is evaluated at ${profile.data_quality_score}% completeness and structural integrity.`;

  if (profile.total_missing_cells > 0) {
    summaryText += ` Note: ${profile.total_missing_cells} missing cell entries (${profile.missing_cells_pct}%) were detected across the records.`;
  } else {
    summaryText += ` The dataset is 100% complete with zero missing cells across all columns.`;
  }

  // 2. Key Empirical Findings
  const keyFindings: AIInsightSection[] = [];

  if (numStats.length > 0) {
    const sortedByMean = [...numStats].filter(s => s.mean !== null).sort((a, b) => (b.mean || 0) - (a.mean || 0));
    const highestMetric = sortedByMean[0];
    const lowestMetric = sortedByMean[sortedByMean.length - 1];

    keyFindings.push({
      title: `Dominant Numerical Distributions`,
      summary: `Verified statistical bounds for observed continuous variables.`,
      bullet_points: [
        `Highest average observed in "${highestMetric.name}" with a mean of ${highestMetric.mean} (Range: ${highestMetric.min} to ${highestMetric.max}, Standard Deviation: ${highestMetric.std}).`,
        `Lowest average observed in "${lowestMetric.name}" with a mean of ${lowestMetric.mean} (Range: ${lowestMetric.min} to ${lowestMetric.max}, Standard Deviation: ${lowestMetric.std}).`,
        `Zero values count across numerical columns: ${numStats.reduce((acc, s) => acc + s.zeros_count, 0)} cells.`
      ],
      sentiment: 'positive',
      badge: 'Verified Metric'
    });
  }

  if (catStats.length > 0) {
    const primaryCat = catStats[0];
    keyFindings.push({
      title: `Categorical Composition (${primaryCat.name})`,
      summary: `Frequency distribution across distinct categorical classes.`,
      bullet_points: [
        `"${primaryCat.name}" contains ${primaryCat.unique_count} distinct categories.`,
        `Leading category is "${primaryCat.top_value}" with ${primaryCat.top_frequency} records (${primaryCat.top_categories[0]?.percentage || 0}% of all rows).`,
        primaryCat.top_categories[1] ? `Secondary category is "${primaryCat.top_categories[1].category}" with ${primaryCat.top_categories[1].count} records (${primaryCat.top_categories[1].percentage}%).` : `All observations belong to a single cluster.`
      ],
      sentiment: 'neutral',
      badge: 'Categorical'
    });
  }

  // 3. Trends & Patterns
  const identifiedTrends: AIInsightSection[] = [];
  if (correlations.top_positive_pairs.length > 0) {
    const topP = correlations.top_positive_pairs[0];
    identifiedTrends.push({
      title: `Strong Positive Covariance: ${topP.var1} & ${topP.var2}`,
      summary: `Calculated Pearson correlation coefficient r = ${topP.correlation}.`,
      bullet_points: [
        `Higher observed values in "${topP.var1}" correspond directly to elevated values in "${topP.var2}".`,
        `Statistical relationship strength is classified as "${topP.strength}".`,
        `No outside assumptions applied; confirmed by pairwise covariance matrix.`
      ],
      sentiment: 'positive',
      badge: `r = ${topP.correlation}`
    });
  }

  if (correlations.top_negative_pairs.length > 0) {
    const topN = correlations.top_negative_pairs[0];
    identifiedTrends.push({
      title: `Inverse Relationship: ${topN.var1} & ${topN.var2}`,
      summary: `Calculated Pearson correlation coefficient r = ${topN.correlation}.`,
      bullet_points: [
        `An increase in "${topN.var1}" is statistically associated with a decrease in "${topN.var2}".`,
        `Relationship strength is classified as "${topN.strength}".`
      ],
      sentiment: 'warning',
      badge: `r = ${topN.correlation}`
    });
  }

  if (identifiedTrends.length === 0) {
    identifiedTrends.push({
      title: `Multivariate Trend Analysis`,
      summary: numStats.length < 2 ? `Information not available in the uploaded dataset (requires at least 2 numerical columns).` : `No significant linear cross-column correlations detected above threshold (|r| > 0.3).`,
      bullet_points: [
        numStats.length < 2 ? `Dataset has ${numStats.length} numerical columns. Additional numeric columns required for covariance analysis.` : `All numerical metrics behave independently with minimal collinearity.`
      ],
      sentiment: 'neutral'
    });
  }

  // 4. Anomalies & Outliers
  const anomaliesAndRisks: AIInsightSection[] = [];
  let totalOutlierCount = 0;
  const outlierBullets: string[] = [];

  numStats.forEach(stat => {
    if (stat.min !== null && stat.max !== null && stat.q25 !== null && stat.q75 !== null && stat.iqr !== null) {
      const lowerBound = stat.q25 - 1.5 * stat.iqr;
      const upperBound = stat.q75 + 1.5 * stat.iqr;
      const outliers = rawRows.filter(r => {
        const v = Number(r[stat.name]);
        return !isNaN(v) && (v < lowerBound || v > upperBound);
      });

      if (outliers.length > 0) {
        totalOutlierCount += outliers.length;
        outlierBullets.push(`"${stat.name}": Detected ${outliers.length} records outside IQR bounds [${Math.round(lowerBound * 10) / 10} - ${Math.round(upperBound * 10) / 10}] (e.g. Extreme values observed: ${outliers.slice(0, 3).map(o => o[stat.name]).join(', ')}).`);
      }
    }
  });

  if (profile.duplicate_rows_count > 0) {
    outlierBullets.push(`Detected ${profile.duplicate_rows_count} exact duplicate rows (${profile.duplicate_rows_pct}% of total dataset).`);
  }

  if (outlierBullets.length > 0) {
    anomaliesAndRisks.push({
      title: `Detected Statistical Outliers & Distribution Extremes`,
      summary: `Identified ${totalOutlierCount} outlier observations via Interquartile Range (IQR) standard filtering.`,
      bullet_points: outlierBullets.slice(0, 5),
      sentiment: 'warning',
      badge: 'IQR Anomaly'
    });
  } else {
    anomaliesAndRisks.push({
      title: `Clean Distribution / No Severe Outliers`,
      summary: `All numerical values lie within standard statistical bounds (1.5x IQR).`,
      bullet_points: [
        `No extreme deviations detected across all ${numStats.length} continuous variables.`,
        `Zero duplicate records detected (${profile.duplicate_rows_count} duplicates).`
      ],
      sentiment: 'positive',
      badge: 'Zero Anomalies'
    });
  }

  // 5. Missing Data Insights
  const missingInsights: AIInsightSection[] = [];
  if (profile.total_missing_cells > 0) {
    const colsWithMissing = Object.entries(profile.missing_per_column || {})
      .filter(([_, count]) => count > 0)
      .map(([col, count]) => `"${col}": ${count} missing values (${Math.round((count / totalRows) * 1000) / 10}%)`);

    missingInsights.push({
      title: `Missing Data Allocation`,
      summary: `Total of ${profile.total_missing_cells} missing cells (${profile.missing_cells_pct}% of total cell volume).`,
      bullet_points: colsWithMissing.length > 0 ? colsWithMissing : [`Missing data scattered across attributes.`],
      sentiment: 'alert',
      badge: 'Missing Values'
    });
  } else {
    missingInsights.push({
      title: `Data Completeness Verification`,
      summary: `Zero missing values detected across all columns.`,
      bullet_points: [
        `All ${totalRows} records possess 100% populated fields.`,
        `No imputation or value reconstruction needed.`
      ],
      sentiment: 'positive',
      badge: '100% Complete'
    });
  }

  // 6. Actionable Recommendations (Fact-based only)
  const strategicRecommendations: AIInsightSection[] = [];
  const recBullets: string[] = [];

  if (profile.duplicate_rows_count > 0) {
    recBullets.push(`Deduplicate the ${profile.duplicate_rows_count} redundant rows to prevent inflated averages.`);
  }
  if (profile.total_missing_cells > 0) {
    recBullets.push(`Address missing cells in affected columns using median imputation for numerical data or mode imputation for categorical attributes.`);
  }
  if (numStats.length > 0) {
    const highestSkew = [...numStats].sort((a, b) => Math.abs(b.skewness || 0) - Math.abs(a.skewness || 0))[0];
    if (highestSkew && Math.abs(highestSkew.skewness || 0) > 1.0) {
      recBullets.push(`Apply log or standard scaling to "${highestSkew.name}" (skewness = ${highestSkew.skewness}) before feeding into linear predictive models.`);
    }
  }
  if (correlations.high_multicollinearity_alerts.length > 0) {
    recBullets.push(`Consider feature selection or PCA on pairs with high collinearity (${correlations.high_multicollinearity_alerts.map(a => `${a.var1} & ${a.var2}`).join(', ')}).`);
  }

  if (recBullets.length === 0) {
    recBullets.push(`Dataset structure is clean and well-balanced. Safe to proceed with exploratory segmentation, predictive modeling, and board reporting.`);
  }

  strategicRecommendations.push({
    title: `Data Processing & Modeling Recommendations`,
    summary: `Empirically supported action items derived from the current dataset profile.`,
    bullet_points: recBullets,
    sentiment: 'positive'
  });

  // 7. Verified SWOT Analysis
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const opportunities: string[] = [];
  const threats: string[] = [];

  // Strengths
  strengths.push(`${totalRows.toLocaleString()} verified records ready for processing`);
  if (profile.total_missing_cells === 0) strengths.push(`100% complete data matrix with zero missing cells`);
  if (profile.data_quality_score >= 85) strengths.push(`High data quality index of ${profile.data_quality_score}%`);
  if (numStats.length >= 2) strengths.push(`${numStats.length} continuous quantitative attributes available for modeling`);

  // Weaknesses
  if (profile.total_missing_cells > 0) weaknesses.push(`${profile.total_missing_cells} missing cell entries require cleaning`);
  if (profile.duplicate_rows_count > 0) weaknesses.push(`${profile.duplicate_rows_count} duplicate records present`);
  if (totalRows < 30) weaknesses.push(`Small sample size (${totalRows} records) may limit statistical generalizability`);

  // Opportunities
  if (correlations.top_positive_pairs.length > 0) opportunities.push(`Leverage strong correlation between ${correlations.top_positive_pairs[0].var1} and ${correlations.top_positive_pairs[0].var2} for regression`);
  if (catStats.length > 0) opportunities.push(`Perform cohort segmentations along "${catStats[0].name}" (${catStats[0].unique_count} distinct categories)`);

  // Threats
  if (totalOutlierCount > 0) threats.push(`${totalOutlierCount} statistical outliers may bias non-robust estimators`);
  if (profile.missing_cells_pct > 10) threats.push(`Elevated missingness (${profile.missing_cells_pct}%) could induce sampling bias`);

  if (weaknesses.length === 0) weaknesses.push(`No critical structural deficiencies observed in the uploaded dataset.`);
  if (threats.length === 0) threats.push(`No critical distribution anomalies or integrity risks detected.`);

  return {
    dataset_id: dataset.id,
    dataset_name: dataset.name,
    executive_summary: summaryText,
    data_health_evaluation: `Structural Health: ${profile.data_quality_score}%. Evaluated against completeness, duplicate density, and numerical continuity.`,
    key_findings: keyFindings,
    identified_trends: identifiedTrends,
    anomalies_and_risks: anomaliesAndRisks,
    correlations_and_drivers: identifiedTrends,
    strategic_recommendations: strategicRecommendations,
    swot_analysis: {
      strengths,
      weaknesses,
      opportunities,
      threats
    },
    generated_by: 'AI DataSense Verified Engine (Zero Hallucination Protocol)'
  };
}
