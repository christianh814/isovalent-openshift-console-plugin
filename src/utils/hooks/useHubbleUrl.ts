import { useState, useEffect } from 'react';

const PLUGIN_NAME = 'isovalent-openshift-console-plugin';

export const useHubbleUrl = (): string => {
  const [hubbleUrl, setHubbleUrl] = useState<string>('');

  useEffect(() => {
    fetch(`/api/plugins/${PLUGIN_NAME}/config.json`)
      .then((res) => res.json())
      .then((config: { hubbleUrl?: string }) => {
        setHubbleUrl(config.hubbleUrl || '');
      })
      .catch(() => {
        setHubbleUrl('');
      });
  }, []);

  return hubbleUrl;
};
