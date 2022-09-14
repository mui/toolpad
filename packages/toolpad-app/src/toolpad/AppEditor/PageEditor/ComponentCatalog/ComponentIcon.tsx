import * as React from 'react';
import dynamic from 'next/dynamic';

const SmartButtonIcon = dynamic(() => import('@mui/icons-material/SmartButton'));
const ImageIcon = dynamic(() => import('@mui/icons-material/Image'));
const GridOnIcon = dynamic(() => import('@mui/icons-material/GridOn'));
const TextFieldsIcon = dynamic(() => import('@mui/icons-material/TextFields'));
const Crop75Icon = dynamic(() => import('@mui/icons-material/Crop75'));
const ArrowDropDownCircleIcon = dynamic(() => import('@mui/icons-material/ArrowDropDownCircle'));
const LayersIcon = dynamic(() => import('@mui/icons-material/Layers'));
const DnsIcon = dynamic(() => import('@mui/icons-material/Dns'));
const ContactPageIcon = dynamic(() => import('@mui/icons-material/ContactPage'));
const TabIcon = dynamic(() => import('@mui/icons-material/Tab'));
const TuneIcon = dynamic(() => import('@mui/icons-material/Tune'));
const ToggleOnIcon = dynamic(() => import('@mui/icons-material/ToggleOn'));
const RadioButtonCheckedIcon = dynamic(() => import('@mui/icons-material/RadioButtonChecked'));
const DateRangeIcon = dynamic(() => import('@mui/icons-material/DateRange'));
const CheckBoxIcon = dynamic(() => import('@mui/icons-material/CheckBox'));
const DashboardCustomizeSharpIcon = dynamic(
  () => import('@mui/icons-material/DashboardCustomizeSharp'),
);
const AddIcon = dynamic(() => import('@mui/icons-material/Add'));

interface ComponentIconProps {
  name: string;
  kind?: 'future' | 'builtIn' | 'create';
}

const ComponentIcon = ({ name, kind }: ComponentIconProps) => {
  const renderIcon = React.useCallback(() => {
    switch (name) {
      case 'SmartButton':
        return <SmartButtonIcon fontSize="medium" />;
      case 'Image':
        return <ImageIcon fontSize="medium" />;
      case 'GridOn':
        return <GridOnIcon fontSize="medium" />;
      case 'TextFields':
        return <TextFieldsIcon fontSize="medium" />;
      case 'Crop75':
        return <Crop75Icon fontSize="medium" />;
      case 'ArrowDropDownCircle':
        return <ArrowDropDownCircleIcon fontSize="medium" />;
      case 'Layers':
        return <LayersIcon fontSize="medium" />;
      case 'Dns':
        return <DnsIcon fontSize="medium" />;
      case 'ContactPage':
        return <ContactPageIcon fontSize="medium" />;
      case 'Tab':
        return <TabIcon fontSize="medium" />;
      case 'Tune':
        return <TuneIcon fontSize="medium" />;
      case 'ToggleOn':
        return <ToggleOnIcon fontSize="medium" />;
      case 'RadioButtonChecked':
        return <RadioButtonCheckedIcon fontSize="medium" />;
      case 'DateRange':
        return <DateRangeIcon fontSize="medium" />;
      case 'CheckBox':
        return <CheckBoxIcon fontSize="medium" />;
      case 'DashboardCustomizeSharp':
        return <DashboardCustomizeSharpIcon fontSize="medium" />;
      case 'Add':
        return <AddIcon fontSize="medium" />;
      default:
        return null;
    }
  }, [name]);
  return <span style={{ opacity: kind === 'future' ? 0.75 : 'inherit' }}>{renderIcon()}</span>;
};

export default ComponentIcon;
