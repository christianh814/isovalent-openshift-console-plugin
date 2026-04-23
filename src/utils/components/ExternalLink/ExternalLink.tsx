import * as React from 'react';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

type ExternalLinkProps = {
  href?: string;
  children?: React.ReactNode;
};

const ExternalLink: React.FC<ExternalLinkProps> = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {children ?? href} <ExternalLinkAltIcon />
  </a>
);

export default ExternalLink;
