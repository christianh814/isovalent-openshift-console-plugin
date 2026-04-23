import * as React from 'react';
import { useHubbleUrl } from '@utils/hooks/useHubbleUrl';
import isovalentLogo from '../../../images/isovalent-logo.png';

type HubbleLinkProps = {
  namespace?: string;
};

const HubbleLink: React.FC<HubbleLinkProps> = ({ namespace }) => {
  const hubbleUrl = useHubbleUrl();

  if (!hubbleUrl) {
    return null;
  }

  const href = namespace
    ? `${hubbleUrl}/?namespace=${encodeURIComponent(namespace)}`
    : hubbleUrl;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
    >
      <img
        src={isovalentLogo}
        alt=""
        style={{ height: '1em', width: 'auto', verticalAlign: 'middle' }}
      />
      Isovalent Hubble Timescape
    </a>
  );
};

export default HubbleLink;
