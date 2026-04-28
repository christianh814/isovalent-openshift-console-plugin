import * as React from 'react';
import { useHubbleUrl } from '@utils/hooks/useHubbleUrl';
import isovalentLogo from '../../../images/isovalent-logo.png';

const HubbleLink: React.FC = () => {
  const hubbleUrl = useHubbleUrl();

  const isExternal = Boolean(hubbleUrl);
  const href = isExternal ? hubbleUrl : '/k8s/ns/cilium/route.openshift.io~v1~Route';

  const linkProps = isExternal
    ? { href, target: '_blank', rel: 'noopener noreferrer' as const }
    : { href };

  return (
    <a
      {...linkProps}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
    >
      <img
        src={isovalentLogo}
        alt=""
        style={{ height: '1em', width: 'auto', verticalAlign: 'middle' }}
      />
      {isExternal ? 'Isovalent Hubble Timescape' : 'Expose Hubble Timescape'}
    </a>
  );
};

export default HubbleLink;
