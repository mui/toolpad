import * as React from 'react';
import { ButtonBase, SxProps, Box } from '@mui/material';
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
import ListIcon from '@mui/icons-material/List';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import DashboardCustomizeSharpIcon from '@mui/icons-material/DashboardCustomizeSharp';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
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
import TableRowsIcon from '@mui/icons-material/TableRows';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import TagIcon from '@mui/icons-material/Tag';
import PasswordIcon from '@mui/icons-material/Password';
import LinkIcon from '@mui/icons-material/Link';
import TextFormatIcon from '@mui/icons-material/TextFormat';
import PieChartIcon from '@mui/icons-material/PieChart';

const iconMap = new Map<string, React.ComponentType<SvgIconProps>>([
  ['Password', PasswordIcon],
  ['Autocomplete', ManageSearchIcon],
  ['Text', NotesIcon],
  ['Link', LinkIcon],
  ['Markdown', TextFormatIcon],
  ['Button', SmartButtonIcon],
  ['Image', ImageIcon],
  ['DataGrid', GridOnIcon],
  ['TextField', Crop75Icon],
  ['Select', ArrowDropDownCircleIcon],
  ['List', ListIcon],
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
  ['Pie Chart', PieChartIcon],
  ['Icon', MoodIcon],
  ['Html', HtmlIcon],
  ['PageRow', TableRowsIcon],
  ['PageColumn', ViewColumnIcon],
  ['Metric', TagIcon],
]);

type ComponentItemKind = 'future' | 'builtIn' | 'create' | 'custom';

interface ComponentIconProps {
  id: string;
  kind?: ComponentItemKind;
  sx?: SxProps;
}

export function ComponentIcon({ id: componentId, kind, sx }: ComponentIconProps) {
  const Icon = iconMap.get(kind === 'custom' ? 'CodeComponent' : componentId);
  return Icon ? <Icon sx={{ fontSize: 24, opacity: kind === 'future' ? 0.75 : 1, ...sx }} /> : null;
}

interface ComponentCatalogItemProps {
  draggable?: boolean;
  onDragStart?: (event: React.DragEvent<HTMLButtonElement>) => void;
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
      component={ButtonBase}
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
        backgroundColor: 'paper',
        // https://stackoverflow.com/q/22922761
        transform: 'translate(0, 0)',
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
