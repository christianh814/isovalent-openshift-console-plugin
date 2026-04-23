import * as React from 'react';
import { Alert, AlertActionLink } from '@patternfly/react-core';
import { useHubbleUrl } from '@utils/hooks/useHubbleUrl';

type HubbleLinkBannerProps = {
  namespace?: string;
};

const HubbleLinkBanner: React.FC<HubbleLinkBannerProps> = ({ namespace }) => {
  const hubbleUrl = useHubbleUrl();

  if (!hubbleUrl) {
    return null;
  }

  const href = namespace
    ? `${hubbleUrl}/?namespace=${encodeURIComponent(namespace)}`
    : hubbleUrl;

  return (
    <Alert
      variant="info"
      isInline
      title="Hubble UI"
      actionLinks={
        <AlertActionLink
          component="a"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Hubble UI
        </AlertActionLink>
      }
    >
      Visualize and monitor network flows for this policy in the Hubble UI.
    </Alert>
  );
};

export default HubbleLinkBanner;
