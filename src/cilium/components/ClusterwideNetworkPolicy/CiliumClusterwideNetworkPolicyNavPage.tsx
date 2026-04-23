import * as React from 'react';
import {
  HorizontalNav,
  K8sResourceCommon,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { CiliumClusterwideNetworkPolicyModel } from '@cilium-models/CiliumClusterwideNetworkPolicyModel';
import { useIsovalentTranslation } from '@utils/hooks/useIsovalentTranslation';
import CiliumClusterwideNetworkPolicyDetailsTab from './CiliumClusterwideNetworkPolicyDetailsTab';
import ResourceYAMLTab from '@utils/components/ResourceYAMLTab/ResourceYAMLTab';
import StatusTab from '@utils/components/StatusTab/StatusTab';

type CiliumClusterwideNetworkPolicyNavPageProps = {
  name: string;
  namespace: string;
  kind: string;
};

const CiliumClusterwideNetworkPolicyNavPage: React.FC<CiliumClusterwideNetworkPolicyNavPageProps> = ({
  name,
  kind,
}) => {
  const { t } = useIsovalentTranslation();

  const [policy, loaded] = useK8sWatchResource<K8sResourceCommon>({
    groupVersionKind: {
      group: CiliumClusterwideNetworkPolicyModel.apiGroup,
      version: CiliumClusterwideNetworkPolicyModel.apiVersion,
      kind: CiliumClusterwideNetworkPolicyModel.kind,
    },
    kind,
    name,
  });

  const pages = React.useMemo(
    () => [
      {
        href: '',
        name: t('Details'),
        component: CiliumClusterwideNetworkPolicyDetailsTab,
      },
      {
        href: 'yaml',
        name: t('YAML'),
        component: ResourceYAMLTab,
      },
      {
        href: 'status',
        name: t('Status'),
        component: StatusTab,
      },
    ],
    [t],
  );

  if (!loaded) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  return <HorizontalNav pages={pages} resource={policy} />;
};

export default CiliumClusterwideNetworkPolicyNavPage;
