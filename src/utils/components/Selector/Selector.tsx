import * as React from 'react';
import { Label, LabelGroup } from '@patternfly/react-core';
import { useIsovalentTranslation } from '@utils/hooks/useIsovalentTranslation';

type LabelSelector = {
  matchLabels?: Record<string, string>;
  matchExpressions?: Array<{
    key: string;
    operator: string;
    values?: string[];
  }>;
};

type SelectorProps = {
  selector?: Record<string, unknown> | LabelSelector;
  emptyText?: string;
};

const Selector: React.FC<SelectorProps> = ({ selector, emptyText }) => {
  const { t } = useIsovalentTranslation();
  const fallback = emptyText ?? t('Selects all endpoints');

  if (!selector || Object.keys(selector).length === 0) {
    return <span className="pf-v5-u-color-200">{fallback}</span>;
  }

  const sel = selector as LabelSelector;
  const matchLabels = sel.matchLabels;
  const matchExpressions = sel.matchExpressions;
  const hasStandardKeys = matchLabels || matchExpressions;

  // If the selector doesn't follow the standard LabelSelector shape, treat each
  // top-level key as a match-label-like entry (CNP allows arbitrary label keys
  // at the top level of endpointSelector).
  const looseLabels: Record<string, string> | undefined = !hasStandardKeys
    ? Object.fromEntries(
        Object.entries(selector).map(([k, v]) => [k, String(v)]),
      )
    : undefined;

  const labelEntries = matchLabels ?? looseLabels ?? {};

  return (
    <LabelGroup numLabels={20} isCompact>
      {Object.entries(labelEntries).map(([k, v]) => (
        <Label key={`ml-${k}`} color="blue" isCompact>
          {k}={v}
        </Label>
      ))}
      {(matchExpressions ?? []).map((expr, idx) => (
        <Label key={`me-${idx}`} color="purple" isCompact>
          {expr.key} {expr.operator}
          {expr.values && expr.values.length > 0
            ? ` (${expr.values.join(', ')})`
            : ''}
        </Label>
      ))}
    </LabelGroup>
  );
};

export default Selector;
