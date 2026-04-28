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
import { Timestamp, ResourceIcon } from '@openshift-console/dynamic-plugin-sdk';
import { CiliumClusterwideNetworkPolicyKind, CiliumClusterwideNetworkPolicyModel } from '@cilium-models/CiliumClusterwideNetworkPolicyModel';
import { useIsovalentTranslation } from '@utils/hooks/useIsovalentTranslation';
import HubbleLink from '@utils/components/HubbleLink/HubbleLink';
import Selector from '@utils/components/Selector/Selector';
import RuleList from '@utils/components/RuleList/RuleList';

type Props = RouteComponentProps<{ name: string }> & {
  obj?: CiliumClusterwideNetworkPolicyKind;
};

const CiliumClusterwideNetworkPolicyDetailsTab: React.FC<Props> = ({ obj }) => {
  const { t } = useIsovalentTranslation();

  const ingressCount =
    (obj?.spec?.ingress?.length ?? 0) + (obj?.spec?.ingressDeny?.length ?? 0);
  const egressCount =
    (obj?.spec?.egress?.length ?? 0) + (obj?.spec?.egressDeny?.length ?? 0);

  const nodeStatuses = obj?.status?.nodes ? Object.entries(obj.status.nodes) : [];

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
                  kind={`${CiliumClusterwideNetworkPolicyModel.apiGroup}~${CiliumClusterwideNetworkPolicyModel.apiVersion}~${CiliumClusterwideNetworkPolicyModel.kind}`}
                />
                {obj?.metadata?.name}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Advanced Configuration')}</DescriptionListTerm>
              <DescriptionListDescription>
                <HubbleLink />
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
                <Selector selector={obj?.spec?.endpointSelector} />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Node Selector')}</DescriptionListTerm>
              <DescriptionListDescription>
                <Selector
                  selector={obj?.spec?.nodeSelector}
                  emptyText={t('Selects all nodes')}
                />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Ingress Rules')}</DescriptionListTerm>
              <DescriptionListDescription>{ingressCount}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Egress Rules')}</DescriptionListTerm>
              <DescriptionListDescription>{egressCount}</DescriptionListDescription>
            </DescriptionListGroup>
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
                    {status.enforcing !== undefined &&
                      ` — ${t('Enforcing')}: ${String(status.enforcing)}`}
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
          <RuleList rules={obj.spec.ingress} direction="ingress" />
        </PageSection>
      )}

      {obj?.spec?.ingressDeny && obj.spec.ingressDeny.length > 0 && (
        <PageSection>
          <Title headingLevel="h2" size="lg" className="pf-v5-u-mb-md">
            {t('Ingress Deny Rules')}
          </Title>
          <RuleList rules={obj.spec.ingressDeny} direction="ingress" deny />
        </PageSection>
      )}

      {obj?.spec?.egress && obj.spec.egress.length > 0 && (
        <PageSection>
          <Title headingLevel="h2" size="lg" className="pf-v5-u-mb-md">
            {t('Egress Rules')}
          </Title>
          <RuleList rules={obj.spec.egress} direction="egress" />
        </PageSection>
      )}

      {obj?.spec?.egressDeny && obj.spec.egressDeny.length > 0 && (
        <PageSection>
          <Title headingLevel="h2" size="lg" className="pf-v5-u-mb-md">
            {t('Egress Deny Rules')}
          </Title>
          <RuleList rules={obj.spec.egressDeny} direction="egress" deny />
        </PageSection>
      )}
    </PageSection>
  );
};

export default CiliumClusterwideNetworkPolicyDetailsTab;
