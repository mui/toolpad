import * as React from 'react';
import HelpTooltipIcon from '../../../components/HelpTooltipIcon';

interface ProBadgeProps {
  helpText: React.ReactNode;
}

function ProBadge({ helpText }: ProBadgeProps) {
  return (
    <React.Fragment>
      <span
        style={{
          display: 'inline-block',
          height: '1em',
          width: '1em',
          verticalAlign: 'middle',
          marginLeft: '0.3em',
          marginBottom: '0.08em',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundImage: 'url(/pro.svg)',
        }}
      />
      <HelpTooltipIcon
        iconSx={{ verticalAlign: 'bottom', marginLeft: '0.4em' }}
        helpText={helpText}
      />
    </React.Fragment>
  );
}

export default ProBadge;
