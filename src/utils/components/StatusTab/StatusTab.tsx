import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { K8sResourceCommon, Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection, Title, EmptyState, EmptyStateBody } from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { useIsovalentTranslation } from '@utils/hooks/useIsovalentTranslation';

type Condition = {
  type?: string;
  status?: string;
  reason?: string;
  message?: string;
  lastTransitionTime?: string;
};

type ObjWithConditions = K8sResourceCommon & {
  status?: {
    conditions?: Condition[];
  };
};

type StatusTabProps = RouteComponentProps<{ ns: string; name: string }> & {
  obj?: ObjWithConditions;
};

const StatusTab: React.FC<StatusTabProps> = ({ obj }) => {
  const { t } = useIsovalentTranslation();

  const conditions = React.useMemo(() => {
    const list = obj?.status?.conditions ?? [];
    return [...list].sort((a, b) => {
      const ta = a.lastTransitionTime ? new Date(a.lastTransitionTime).getTime() : 0;
      const tb = b.lastTransitionTime ? new Date(b.lastTransitionTime).getTime() : 0;
      return tb - ta;
    });
  }, [obj]);

  return (
    <PageSection>
      <Title headingLevel="h2" size="lg" className="pf-v5-u-mb-md">
        {t('Conditions')}
      </Title>
      {conditions.length === 0 ? (
        <EmptyState>
          <EmptyStateBody>{t('No conditions reported.')}</EmptyStateBody>
        </EmptyState>
      ) : (
        <Table aria-label={t('Conditions')} variant="compact">
          <Thead>
            <Tr>
              <Th>{t('Type')}</Th>
              <Th>{t('Status')}</Th>
              <Th>{t('Reason')}</Th>
              <Th>{t('Message')}</Th>
              <Th>{t('Last Transition')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {conditions.map((c, idx) => (
              <Tr key={`${c.type}-${c.lastTransitionTime}-${idx}`}>
                <Td>{c.type ?? '—'}</Td>
                <Td>{c.status ?? '—'}</Td>
                <Td>{c.reason ?? '—'}</Td>
                <Td>{c.message ?? '—'}</Td>
                <Td>
                  <Timestamp timestamp={c.lastTransitionTime} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </PageSection>
  );
};

export default StatusTab;
