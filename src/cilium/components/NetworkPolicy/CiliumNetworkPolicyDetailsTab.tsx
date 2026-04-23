import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
  PageSection,
  Title,
} from '@patternfly/react-core';
import {
  ResourceIcon,
  ResourceLink,
  Timestamp,
} from '@openshift-console/dynamic-plugin-sdk';
import { CiliumNetworkPolicyKind, CiliumNetworkPolicyModel } from '@cilium-models/CiliumNetworkPolicyModel';
import { useIsovalentTranslation } from '@utils/hooks/useIsovalentTranslation';
import HubbleLink from '@utils/components/HubbleLink/HubbleLink';

type CiliumNetworkPolicyDetailsTabProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: CiliumNetworkPolicyKind;
};

const CiliumNetworkPolicyDetailsTab: React.FC<CiliumNetworkPolicyDetailsTabProps> = ({ obj }) => {
  const { t } = useIsovalentTranslation();

  const ingressCount = (obj?.spec?.ingress?.length ?? 0) + (obj?.spec?.ingressDeny?.length ?? 0);
  const egressCount = (obj?.spec?.egress?.length ?? 0) + (obj?.spec?.egressDeny?.length ?? 0);

  const nodeStatuses = obj?.status?.nodes
    ? Object.entries(obj.status.nodes)
    : [];

  return (
    <PageSection>
      <Grid hasGutter className="pf-v5-u-mt-md">
        <GridItem span={6}>
          <Title headingLevel="h2" size="lg" className="pf-v5-u-mb-md">
            {t('Details')}
          </Title>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
              <DescriptionListDescription>
                <ResourceIcon
                  kind={`${CiliumNetworkPolicyModel.apiGroup}~${CiliumNetworkPolicyModel.apiVersion}~${CiliumNetworkPolicyModel.kind}`}
                />
                {obj?.metadata?.name}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Namespace')}</DescriptionListTerm>
              <DescriptionListDescription>
                {obj?.metadata?.namespace && (
                  <ResourceLink kind="Namespace" name={obj.metadata.namespace} />
                )}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('More Info')}</DescriptionListTerm>
              <DescriptionListDescription>
                <HubbleLink namespace={obj?.metadata?.namespace} />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Created')}</DescriptionListTerm>
              <DescriptionListDescription>
                <Timestamp timestamp={obj?.metadata?.creationTimestamp} />
              </DescriptionListDescription>
            </DescriptionListGroup>
            {obj?.spec?.description && (
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Description')}</DescriptionListTerm>
                <DescriptionListDescription>{obj.spec.description}</DescriptionListDescription>
              </DescriptionListGroup>
            )}
          </DescriptionList>
        </GridItem>

        <GridItem span={6}>
          <Title headingLevel="h2" size="lg" className="pf-v5-u-mb-md">
            {t('Spec')}
          </Title>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Endpoint Selector')}</DescriptionListTerm>
              <DescriptionListDescription>
                {obj?.spec?.endpointSelector
                  ? <code>{JSON.stringify(obj.spec.endpointSelector, null, 2)}</code>
                  : '—'}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Ingress Rules')}</DescriptionListTerm>
              <DescriptionListDescription>{ingressCount}</DescriptionListDescription>
            </DescriptionListGroup>
            {(obj?.spec?.ingressDeny?.length ?? 0) > 0 && (
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Ingress Deny Rules')}</DescriptionListTerm>
                <DescriptionListDescription>{obj.spec.ingressDeny.length}</DescriptionListDescription>
              </DescriptionListGroup>
            )}
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Egress Rules')}</DescriptionListTerm>
              <DescriptionListDescription>{egressCount}</DescriptionListDescription>
            </DescriptionListGroup>
            {(obj?.spec?.egressDeny?.length ?? 0) > 0 && (
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Egress Deny Rules')}</DescriptionListTerm>
                <DescriptionListDescription>{obj.spec.egressDeny.length}</DescriptionListDescription>
              </DescriptionListGroup>
            )}
            {obj?.spec?.enableDefaultDeny && (
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Enable Default Deny')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {t('Ingress')}: {String(obj.spec.enableDefaultDeny.ingress ?? false)},{' '}
                  {t('Egress')}: {String(obj.spec.enableDefaultDeny.egress ?? false)}
                </DescriptionListDescription>
              </DescriptionListGroup>
            )}
          </DescriptionList>
        </GridItem>

        {nodeStatuses.length > 0 && (
          <GridItem span={12}>
            <Title headingLevel="h2" size="lg" className="pf-v5-u-mb-md">
              {t('Status')}
            </Title>
            <DescriptionList>
              {nodeStatuses.map(([node, status]) => (
                <DescriptionListGroup key={node}>
                  <DescriptionListTerm>{node}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {status.ok ? t('OK') : status.error ?? t('Unknown')}
                    {status.enforcing !== undefined && ` — ${t('Enforcing')}: ${String(status.enforcing)}`}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              ))}
            </DescriptionList>
          </GridItem>
        )}
      </Grid>

      {obj?.spec?.ingress && obj.spec.ingress.length > 0 && (
        <PageSection>
          <Title headingLevel="h2" size="lg" className="pf-v5-u-mb-md">
            {t('Ingress Rules')}
          </Title>
          <pre>{JSON.stringify(obj.spec.ingress, null, 2)}</pre>
        </PageSection>
      )}

      {obj?.spec?.egress && obj.spec.egress.length > 0 && (
        <PageSection>
          <Title headingLevel="h2" size="lg" className="pf-v5-u-mb-md">
            {t('Egress Rules')}
          </Title>
          <pre>{JSON.stringify(obj.spec.egress, null, 2)}</pre>
        </PageSection>
      )}
    </PageSection>
  );
};

export { CiliumNetworkPolicyModel };
export default CiliumNetworkPolicyDetailsTab;
