import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { PageSection, Stack, StackItem, Title } from '@patternfly/react-core';
import { CiliumClusterwideNetworkPolicyKind } from '@cilium-models/CiliumClusterwideNetworkPolicyModel';
import { useIsovalentTranslation } from '@utils/hooks/useIsovalentTranslation';
import HubbleLink from '@utils/components/HubbleLink/HubbleLink';
import PolicyGraph from '@utils/components/PolicyGraph/PolicyGraph';

type Props = RouteComponentProps<{ name: string }> & {
  obj?: CiliumClusterwideNetworkPolicyKind;
};

const CiliumClusterwideNetworkPolicyGraphTab: React.FC<Props> = ({ obj }) => {
  const { t } = useIsovalentTranslation();
  return (
    <PageSection>
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h2" size="lg">
            {t('Policy Graph')}
          </Title>
        </StackItem>
        <StackItem>
          {t(
            'The graph view shows only basic, high level, overview. Click on the Isovalent Hubble Timescape link for more detailed information.',
          )}
        </StackItem>
        <StackItem>
          <HubbleLink />
        </StackItem>
        <StackItem>
          <PolicyGraph spec={obj?.spec} namespace={undefined} />
        </StackItem>
      </Stack>
    </PageSection>
  );
};

export default CiliumClusterwideNetworkPolicyGraphTab;
