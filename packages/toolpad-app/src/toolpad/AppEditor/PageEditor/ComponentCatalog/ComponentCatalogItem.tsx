import * as React from 'react';
import Box from '@mui/material/Box';

import SmartButtonIcon from '@mui/icons-material/SmartButton';
import ImageIcon from '@mui/icons-material/Image';
import GridOnIcon from '@mui/icons-material/GridOn';
import Crop75Icon from '@mui/icons-material/Crop75';
import ArrowDropDownCircleIcon from '@mui/icons-material/ArrowDropDownCircle';
import LayersIcon from '@mui/icons-material/Layers';
import DnsIcon from '@mui/icons-material/Dns';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import TabIcon from '@mui/icons-material/Tab';
import TuneIcon from '@mui/icons-material/Tune';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import DashboardCustomizeSharpIcon from '@mui/icons-material/DashboardCustomizeSharp';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import NotesIcon from '@mui/icons-material/Notes';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import InsightsIcon from '@mui/icons-material/Insights';
import { SvgIconProps } from '@mui/material/SvgIcon';
import PlaceIcon from '@mui/icons-material/Place';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import MoodIcon from '@mui/icons-material/Mood';
import HtmlIcon from '@mui/icons-material/Html';

const iconMap = new Map<string, React.ComponentType<SvgIconProps>>([
  ['Text', NotesIcon],
  ['Button', SmartButtonIcon],
  ['Image', ImageIcon],
  ['DataGrid', GridOnIcon],
  ['TextField', Crop75Icon],
  ['Select', ArrowDropDownCircleIcon],
  ['Paper', LayersIcon],
  ['Form', DnsIcon],
  ['Card', ContactPageIcon],
  ['Tabs', TabIcon],
  ['Slider', TuneIcon],
  ['Switch', ToggleOnIcon],
  ['Radio', RadioButtonCheckedIcon],
  ['DatePicker', DateRangeIcon],
  ['FilePicker', UploadFileIcon],
  ['Checkbox', CheckBoxIcon],
  ['CodeComponent', DashboardCustomizeSharpIcon],
  ['CreateNew', AddIcon],
  ['Tabs', TabIcon],
  ['Container', AutoAwesomeMosaicIcon],
  ['Chart', InsightsIcon],
  ['Map', PlaceIcon],
  ['Drawer', ViewSidebarIcon],
  ['Icon', MoodIcon],
  ['Html', HtmlIcon],
]);

type ComponentItemKind = 'future' | 'builtIn' | 'create' | 'custom';

interface ComponentIconProps {
  id: string;
  kind?: ComponentItemKind;
}

function ComponentIcon({ id: componentId, kind }: ComponentIconProps) {
  const Icon = iconMap.get(kind === 'custom' ? 'CodeComponent' : componentId);
  return Icon ? <Icon fontSize="medium" opacity={kind === 'future' ? 0.75 : 1} /> : null;
}

interface ComponentCatalogItemProps {
  draggable?: boolean;
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
  onClick?: () => void;
  builtIn?: string;
  id: string;
  displayName: string;
  kind?: ComponentItemKind;
}

function ComponentCatalogItem({
  draggable,
  onClick,
  id,
  displayName,
  builtIn,
  kind,
  onDragStart,
}: ComponentCatalogItemProps) {
  return (
    <Box
      className="ComponentCatalogItem"
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: builtIn ? 65 : 60,
        height: builtIn ? 65 : 60,
        padding: 1,
        borderRadius: 1,
        border: 1,
        borderColor: 'divider',
        borderStyle: kind === 'create' ? 'dashed' : 'solid',
        color: 'text.secondary',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
        ...(draggable ? { cursor: 'grab' } : {}),
        ...(onClick ? { cursor: 'pointer' } : {}),
      }}
    >
      <ComponentIcon id={id} kind={kind} />
      <span
        style={{
          fontSize: '0.625rem',
          maxWidth: builtIn ? 65 : 60,
          whiteSpace: 'nowrap',
          opacity: kind === 'future' ? 0.75 : 1,
          textOverflow: 'ellipsis',
          overflow: 'hidden',
        }}
      >
        {displayName}
      </span>
    </Box>
  );
}

export default ComponentCatalogItem;
