import * as React from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  EmptyState,
  EmptyStateBody,
  Label,
  LabelGroup,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import Selector from '../Selector/Selector';
import { useIsovalentTranslation } from '@utils/hooks/useIsovalentTranslation';
import { CiliumPolicyRule } from '@cilium-models/CiliumNetworkPolicyModel';

type Direction = 'ingress' | 'egress';

type RuleListProps = {
  rules?: CiliumPolicyRule[];
  direction: Direction;
  deny?: boolean;
};

const PeerSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <DescriptionListGroup>
    <DescriptionListTerm>{title}</DescriptionListTerm>
    <DescriptionListDescription>{children}</DescriptionListDescription>
  </DescriptionListGroup>
);

const StringList: React.FC<{ values?: string[]; color?: 'blue' | 'green' | 'orange' | 'grey' }> = ({
  values,
  color = 'grey',
}) => {
  if (!values || values.length === 0) return null;
  return (
    <LabelGroup numLabels={20} isCompact>
      {values.map((v, idx) => (
        <Label key={`${v}-${idx}`} color={color} isCompact>
          {v}
        </Label>
      ))}
    </LabelGroup>
  );
};

const renderPorts = (rule: CiliumPolicyRule) => {
  if (!rule.toPorts || rule.toPorts.length === 0) return null;
  const flat: string[] = [];
  rule.toPorts.forEach((tp) => {
    (tp.ports ?? []).forEach((p) => {
      const proto = p.protocol ?? 'TCP';
      const port = p.port ?? '*';
      flat.push(`${port}/${proto}`);
    });
  });
  if (flat.length === 0) return null;
  return <StringList values={flat} color="green" />;
};

const renderEndpointSelectors = (
  selectors?: Record<string, unknown>[],
  emptyText?: string,
) => {
  if (!selectors || selectors.length === 0) return null;
  return (
    <Stack hasGutter>
      {selectors.map((s, idx) => (
        <StackItem key={idx}>
          <Selector selector={s} emptyText={emptyText} />
        </StackItem>
      ))}
    </Stack>
  );
};

const renderCIDRSet = (
  cidrSet?: Array<{ cidr: string; except?: string[] }>,
) => {
  if (!cidrSet || cidrSet.length === 0) return null;
  return (
    <Stack hasGutter>
      {cidrSet.map((entry, idx) => (
        <StackItem key={idx}>
          <Label color="orange" isCompact>
            {entry.cidr}
          </Label>
          {entry.except && entry.except.length > 0 && (
            <span className="pf-v5-u-ml-sm">
              <span className="pf-v5-u-color-200">except </span>
              <StringList values={entry.except} color="grey" />
            </span>
          )}
        </StackItem>
      ))}
    </Stack>
  );
};

const renderFQDNs = (
  fqdns?: Array<{ matchName?: string; matchPattern?: string }>,
) => {
  if (!fqdns || fqdns.length === 0) return null;
  const values = fqdns.map((f) => f.matchName ?? f.matchPattern ?? '').filter(Boolean);
  return <StringList values={values} color="blue" />;
};

const RuleCard: React.FC<{
  rule: CiliumPolicyRule;
  direction: Direction;
  index: number;
  deny?: boolean;
}> = ({ rule, direction, index, deny }) => {
  const { t } = useIsovalentTranslation();
  const isIngress = direction === 'ingress';

  const peerSelectors = isIngress ? rule.fromEndpoints : rule.toEndpoints;
  const cidrs = isIngress ? rule.fromCIDR : rule.toCIDR;
  const cidrSet = isIngress ? rule.fromCIDRSet : rule.toCIDRSet;
  const entities = isIngress ? rule.fromEntities : rule.toEntities;
  const fqdns = isIngress ? undefined : rule.toFQDNs;
  const services = isIngress ? undefined : rule.toServices;

  const peerLabel = isIngress ? t('From endpoints') : t('To endpoints');
  const cidrLabel = isIngress ? t('From CIDRs') : t('To CIDRs');
  const cidrSetLabel = isIngress ? t('From CIDR set') : t('To CIDR set');
  const entitiesLabel = isIngress ? t('From entities') : t('To entities');

  const titlePrefix = deny
    ? isIngress
      ? t('Ingress Deny Rule')
      : t('Egress Deny Rule')
    : isIngress
    ? t('Ingress Rule')
    : t('Egress Rule');

  return (
    <Card isCompact>
      <CardTitle>{`${titlePrefix} #${index + 1}`}</CardTitle>
      <CardBody>
        <DescriptionList isHorizontal>
          {peerSelectors && peerSelectors.length > 0 && (
            <PeerSection title={peerLabel}>
              {renderEndpointSelectors(peerSelectors, t('Any endpoint'))}
            </PeerSection>
          )}
          {cidrs && cidrs.length > 0 && (
            <PeerSection title={cidrLabel}>
              <StringList values={cidrs} color="orange" />
            </PeerSection>
          )}
          {cidrSet && cidrSet.length > 0 && (
            <PeerSection title={cidrSetLabel}>{renderCIDRSet(cidrSet)}</PeerSection>
          )}
          {entities && entities.length > 0 && (
            <PeerSection title={entitiesLabel}>
              <StringList values={entities} color="blue" />
            </PeerSection>
          )}
          {fqdns && fqdns.length > 0 && (
            <PeerSection title={t('To FQDNs')}>{renderFQDNs(fqdns)}</PeerSection>
          )}
          {services && services.length > 0 && (
            <PeerSection title={t('To services')}>
              <StringList
                values={services.map((s) => JSON.stringify(s))}
                color="grey"
              />
            </PeerSection>
          )}
          {rule.toPorts && rule.toPorts.length > 0 && (
            <PeerSection title={t('Ports')}>{renderPorts(rule)}</PeerSection>
          )}
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

const RuleList: React.FC<RuleListProps> = ({ rules, direction, deny }) => {
  const { t } = useIsovalentTranslation();

  if (!rules || rules.length === 0) {
    return (
      <EmptyState>
        <EmptyStateBody>{t('No rules defined.')}</EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <Stack hasGutter>
      {rules.map((rule, idx) => (
        <StackItem key={idx}>
          <RuleCard rule={rule} direction={direction} index={idx} deny={deny} />
        </StackItem>
      ))}
    </Stack>
  );
};

export default RuleList;
