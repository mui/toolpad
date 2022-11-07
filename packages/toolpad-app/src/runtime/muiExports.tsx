import ReactDefault, * as React from 'react';

import ReactDomDefault, * as ReactDom from 'react-dom';
import DayJsDefault, * as DayJs from 'dayjs';
import muiToolpadCoreDefault, * as muiToolpadCore from '@mui/toolpad-core';
// eslint-disable-next-line no-restricted-imports
import muiIconsMaterialDefault, * as muiIconsMaterial from '@mui/icons-material';

import muiMaterialDefault, * as muiMaterial from '@mui/material';
import muiMaterialAccordionDefault, * as muiMaterialAccordion from '@mui/material/Accordion';
import muiMaterialCssBaselineDefault, * as muiMaterialCssBaseline from '@mui/material/CssBaseline';
import muiMaterialListDefault, * as muiMaterialList from '@mui/material/List';
import muiMaterialSnackbarDefault, * as muiMaterialSnackbar from '@mui/material/Snackbar';
import muiMaterialToggleButtonGroupDefault, * as muiMaterialToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import muiMaterialAccordionActionsDefault, * as muiMaterialAccordionActions from '@mui/material/AccordionActions';
import muiMaterialDialogDefault, * as muiMaterialDialog from '@mui/material/Dialog';
import muiMaterialListItemDefault, * as muiMaterialListItem from '@mui/material/ListItem';
import muiMaterialSnackbarContentDefault, * as muiMaterialSnackbarContent from '@mui/material/SnackbarContent';
import muiMaterialToolbarDefault, * as muiMaterialToolbar from '@mui/material/Toolbar';
import muiMaterialAccordionDetailsDefault, * as muiMaterialAccordionDetails from '@mui/material/AccordionDetails';
import muiMaterialDialogActionsDefault, * as muiMaterialDialogActions from '@mui/material/DialogActions';
import muiMaterialListItemAvatarDefault, * as muiMaterialListItemAvatar from '@mui/material/ListItemAvatar';
import muiMaterialSpeedDialDefault, * as muiMaterialSpeedDial from '@mui/material/SpeedDial';
import muiMaterialTooltipDefault, * as muiMaterialTooltip from '@mui/material/Tooltip';
import muiMaterialAccordionSummaryDefault, * as muiMaterialAccordionSummary from '@mui/material/AccordionSummary';
import muiMaterialDialogContentDefault, * as muiMaterialDialogContent from '@mui/material/DialogContent';
import muiMaterialListItemButtonDefault, * as muiMaterialListItemButton from '@mui/material/ListItemButton';
import muiMaterialSpeedDialActionDefault, * as muiMaterialSpeedDialAction from '@mui/material/SpeedDialAction';
import muiMaterialTypographyDefault, * as muiMaterialTypography from '@mui/material/Typography';
import muiMaterialAlertDefault, * as muiMaterialAlert from '@mui/material/Alert';
import muiMaterialDialogContentTextDefault, * as muiMaterialDialogContentText from '@mui/material/DialogContentText';
import muiMaterialListItemIconDefault, * as muiMaterialListItemIcon from '@mui/material/ListItemIcon';
import muiMaterialSpeedDialIconDefault, * as muiMaterialSpeedDialIcon from '@mui/material/SpeedDialIcon';
import muiMaterialUnstable_Grid2Default, * as muiMaterialUnstable_Grid2 from '@mui/material/Unstable_Grid2';
import muiMaterialAlertTitleDefault, * as muiMaterialAlertTitle from '@mui/material/AlertTitle';
import muiMaterialDialogTitleDefault, * as muiMaterialDialogTitle from '@mui/material/DialogTitle';
import muiMaterialListItemSecondaryActionDefault, * as muiMaterialListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import muiMaterialStackDefault, * as muiMaterialStack from '@mui/material/Stack';
import muiMaterialUnstable_TrapFocusDefault, * as muiMaterialUnstable_TrapFocus from '@mui/material/Unstable_TrapFocus';
import muiMaterialAppBarDefault, * as muiMaterialAppBar from '@mui/material/AppBar';
import muiMaterialDividerDefault, * as muiMaterialDivider from '@mui/material/Divider';
import muiMaterialListItemTextDefault, * as muiMaterialListItemText from '@mui/material/ListItemText';
import muiMaterialStepDefault, * as muiMaterialStep from '@mui/material/Step';
import muiMaterialZoomDefault, * as muiMaterialZoom from '@mui/material/Zoom';
import muiMaterialAutocompleteDefault, * as muiMaterialAutocomplete from '@mui/material/Autocomplete';
import muiMaterialDrawerDefault, * as muiMaterialDrawer from '@mui/material/Drawer';
import muiMaterialListSubheaderDefault, * as muiMaterialListSubheader from '@mui/material/ListSubheader';
import muiMaterialStepButtonDefault, * as muiMaterialStepButton from '@mui/material/StepButton';
import muiMaterialclassNameDefault, * as muiMaterialclassName from '@mui/material/className';
import muiMaterialAvatarDefault, * as muiMaterialAvatar from '@mui/material/Avatar';
import muiMaterialFabDefault, * as muiMaterialFab from '@mui/material/Fab';
import muiMaterialMenuDefault, * as muiMaterialMenu from '@mui/material/Menu';
import muiMaterialStepConnectorDefault, * as muiMaterialStepConnector from '@mui/material/StepConnector';
import muiMaterialcolorsDefault, * as muiMaterialcolors from '@mui/material/colors';
import muiMaterialAvatarGroupDefault, * as muiMaterialAvatarGroup from '@mui/material/AvatarGroup';
import muiMaterialFadeDefault, * as muiMaterialFade from '@mui/material/Fade';
import muiMaterialMenuItemDefault, * as muiMaterialMenuItem from '@mui/material/MenuItem';
import muiMaterialStepContentDefault, * as muiMaterialStepContent from '@mui/material/StepContent';
import muiMaterialdarkScrollbarDefault, * as muiMaterialdarkScrollbar from '@mui/material/darkScrollbar';
import muiMaterialBackdropDefault, * as muiMaterialBackdrop from '@mui/material/Backdrop';
import muiMaterialFilledInputDefault, * as muiMaterialFilledInput from '@mui/material/FilledInput';
import muiMaterialMenuListDefault, * as muiMaterialMenuList from '@mui/material/MenuList';
import muiMaterialStepIconDefault, * as muiMaterialStepIcon from '@mui/material/StepIcon';
import muiMaterialBadgeDefault, * as muiMaterialBadge from '@mui/material/Badge';
import muiMaterialFormControlDefault, * as muiMaterialFormControl from '@mui/material/FormControl';
import muiMaterialMobileStepperDefault, * as muiMaterialMobileStepper from '@mui/material/MobileStepper';
import muiMaterialStepLabelDefault, * as muiMaterialStepLabel from '@mui/material/StepLabel';
import muiMaterialBottomNavigationDefault, * as muiMaterialBottomNavigation from '@mui/material/BottomNavigation';
import muiMaterialFormControlLabelDefault, * as muiMaterialFormControlLabel from '@mui/material/FormControlLabel';
import muiMaterialModalDefault, * as muiMaterialModal from '@mui/material/Modal';
import muiMaterialStepperDefault, * as muiMaterialStepper from '@mui/material/Stepper';
import muiMaterialBottomNavigationActionDefault, * as muiMaterialBottomNavigationAction from '@mui/material/BottomNavigationAction';
import muiMaterialFormGroupDefault, * as muiMaterialFormGroup from '@mui/material/FormGroup';
import muiMaterialNativeSelectDefault, * as muiMaterialNativeSelect from '@mui/material/NativeSelect';
import muiMaterialStyledEngineProviderDefault, * as muiMaterialStyledEngineProvider from '@mui/material/StyledEngineProvider';
import muiMaterialBoxDefault, * as muiMaterialBox from '@mui/material/Box';
import muiMaterialFormHelperTextDefault, * as muiMaterialFormHelperText from '@mui/material/FormHelperText';
import muiMaterialNoSsrDefault, * as muiMaterialNoSsr from '@mui/material/NoSsr';
import muiMaterialSvgIconDefault, * as muiMaterialSvgIcon from '@mui/material/SvgIcon';
import muiMateriallocaleDefault, * as muiMateriallocale from '@mui/material/locale';
import muiMaterialBreadcrumbsDefault, * as muiMaterialBreadcrumbs from '@mui/material/Breadcrumbs';
import muiMaterialFormLabelDefault, * as muiMaterialFormLabel from '@mui/material/FormLabel';
import muiMaterialOutlinedInputDefault, * as muiMaterialOutlinedInput from '@mui/material/OutlinedInput';
import muiMaterialSwipeableDrawerDefault, * as muiMaterialSwipeableDrawer from '@mui/material/SwipeableDrawer';
import muiMaterialButtonDefault, * as muiMaterialButton from '@mui/material/Button';
import muiMaterialGlobalStylesDefault, * as muiMaterialGlobalStyles from '@mui/material/GlobalStyles';
import muiMaterialSwitchDefault, * as muiMaterialSwitch from '@mui/material/Switch';
import muiMaterialButtonBaseDefault, * as muiMaterialButtonBase from '@mui/material/ButtonBase';
import muiMaterialGridDefault, * as muiMaterialGrid from '@mui/material/Grid';
import muiMaterialPaginationDefault, * as muiMaterialPagination from '@mui/material/Pagination';
import muiMaterialTabDefault, * as muiMaterialTab from '@mui/material/Tab';
import muiMaterialButtonGroupDefault, * as muiMaterialButtonGroup from '@mui/material/ButtonGroup';
import muiMaterialGrowDefault, * as muiMaterialGrow from '@mui/material/Grow';
import muiMaterialPaginationItemDefault, * as muiMaterialPaginationItem from '@mui/material/PaginationItem';
import muiMaterialTabScrollButtonDefault, * as muiMaterialTabScrollButton from '@mui/material/TabScrollButton';
import muiMaterialHiddenDefault, * as muiMaterialHidden from '@mui/material/Hidden';
import muiMaterialPaperDefault, * as muiMaterialPaper from '@mui/material/Paper';
import muiMaterialTableDefault, * as muiMaterialTable from '@mui/material/Table';
import muiMaterialstylesDefault, * as muiMaterialstyles from '@mui/material/styles';
import muiMaterialCardDefault, * as muiMaterialCard from '@mui/material/Card';
import muiMaterialIconDefault, * as muiMaterialIcon from '@mui/material/Icon';
import muiMaterialPopoverDefault, * as muiMaterialPopover from '@mui/material/Popover';
import muiMaterialTableBodyDefault, * as muiMaterialTableBody from '@mui/material/TableBody';
import muiMaterialCardActionAreaDefault, * as muiMaterialCardActionArea from '@mui/material/CardActionArea';
import muiMaterialIconButtonDefault, * as muiMaterialIconButton from '@mui/material/IconButton';
import muiMaterialPopperDefault, * as muiMaterialPopper from '@mui/material/Popper';
import muiMaterialTableCellDefault, * as muiMaterialTableCell from '@mui/material/TableCell';
import muiMaterialtransitionsDefault, * as muiMaterialtransitions from '@mui/material/transitions';
import muiMaterialCardActionsDefault, * as muiMaterialCardActions from '@mui/material/CardActions';
import muiMaterialImageListDefault, * as muiMaterialImageList from '@mui/material/ImageList';
import muiMaterialPortalDefault, * as muiMaterialPortal from '@mui/material/Portal';
import muiMaterialTableContainerDefault, * as muiMaterialTableContainer from '@mui/material/TableContainer';
import muiMaterialCardContentDefault, * as muiMaterialCardContent from '@mui/material/CardContent';
import muiMaterialImageListItemDefault, * as muiMaterialImageListItem from '@mui/material/ImageListItem';
import muiMaterialTableFooterDefault, * as muiMaterialTableFooter from '@mui/material/TableFooter';
import muiMaterialuseAutocompleteDefault, * as muiMaterialuseAutocomplete from '@mui/material/useAutocomplete';
import muiMaterialCardHeaderDefault, * as muiMaterialCardHeader from '@mui/material/CardHeader';
import muiMaterialImageListItemBarDefault, * as muiMaterialImageListItemBar from '@mui/material/ImageListItemBar';
import muiMaterialRadioDefault, * as muiMaterialRadio from '@mui/material/Radio';
import muiMaterialTableHeadDefault, * as muiMaterialTableHead from '@mui/material/TableHead';
import muiMaterialuseMediaQueryDefault, * as muiMaterialuseMediaQuery from '@mui/material/useMediaQuery';
import muiMaterialCardMediaDefault, * as muiMaterialCardMedia from '@mui/material/CardMedia';
import muiMaterialInputDefault, * as muiMaterialInput from '@mui/material/Input';
import muiMaterialRadioGroupDefault, * as muiMaterialRadioGroup from '@mui/material/RadioGroup';
import muiMaterialTablePaginationDefault, * as muiMaterialTablePagination from '@mui/material/TablePagination';
import muiMaterialusePaginationDefault, * as muiMaterialusePagination from '@mui/material/usePagination';
import muiMaterialCheckboxDefault, * as muiMaterialCheckbox from '@mui/material/Checkbox';
import muiMaterialInputAdornmentDefault, * as muiMaterialInputAdornment from '@mui/material/InputAdornment';
import muiMaterialRatingDefault, * as muiMaterialRating from '@mui/material/Rating';
import muiMaterialTableRowDefault, * as muiMaterialTableRow from '@mui/material/TableRow';
import muiMaterialuseScrollTriggerDefault, * as muiMaterialuseScrollTrigger from '@mui/material/useScrollTrigger';
import muiMaterialChipDefault, * as muiMaterialChip from '@mui/material/Chip';
import muiMaterialInputBaseDefault, * as muiMaterialInputBase from '@mui/material/InputBase';
import muiMaterialScopedCssBaselineDefault, * as muiMaterialScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import muiMaterialTableSortLabelDefault, * as muiMaterialTableSortLabel from '@mui/material/TableSortLabel';
import muiMaterialuseTouchRippleDefault, * as muiMaterialuseTouchRipple from '@mui/material/useTouchRipple';
import muiMaterialCircularProgressDefault, * as muiMaterialCircularProgress from '@mui/material/CircularProgress';
import muiMaterialInputLabelDefault, * as muiMaterialInputLabel from '@mui/material/InputLabel';
import muiMaterialSelectDefault, * as muiMaterialSelect from '@mui/material/Select';
import muiMaterialTabsDefault, * as muiMaterialTabs from '@mui/material/Tabs';
import muiMaterialutilsDefault, * as muiMaterialutils from '@mui/material/utils';
import muiMaterialClickAwayListenerDefault, * as muiMaterialClickAwayListener from '@mui/material/ClickAwayListener';
import muiMaterialSkeletonDefault, * as muiMaterialSkeleton from '@mui/material/Skeleton';
import muiMaterialTextFieldDefault, * as muiMaterialTextField from '@mui/material/TextField';
import muiMaterialCollapseDefault, * as muiMaterialCollapse from '@mui/material/Collapse';
import muiMaterialLinearProgressDefault, * as muiMaterialLinearProgress from '@mui/material/LinearProgress';
import muiMaterialSlideDefault, * as muiMaterialSlide from '@mui/material/Slide';
import muiMaterialTextareaAutosizeDefault, * as muiMaterialTextareaAutosize from '@mui/material/TextareaAutosize';
import muiMaterialContainerDefault, * as muiMaterialContainer from '@mui/material/Container';
import muiMaterialLinkDefault, * as muiMaterialLink from '@mui/material/Link';
import muiMaterialSliderDefault, * as muiMaterialSlider from '@mui/material/Slider';
import muiMaterialToggleButtonDefault, * as muiMaterialToggleButton from '@mui/material/ToggleButton';

import muiXDatePickersDefault, * as muiXDatePickers from '@mui/x-date-pickers';
import muiXDatePickersCalendarPickerSkeletonDefault, * as muiXDatePickersCalendarPickerSkeleton from '@mui/x-date-pickers/CalendarPickerSkeleton';
import muiXDatePickersDesktopTimePickerDefault, * as muiXDatePickersDesktopTimePicker from '@mui/x-date-pickers/DesktopTimePicker';
import muiXDatePickersMonthPickerDefault, * as muiXDatePickersMonthPicker from '@mui/x-date-pickers/MonthPicker';
import muiXDatePickersStaticTimePickerDefault, * as muiXDatePickersStaticTimePicker from '@mui/x-date-pickers/StaticTimePicker';
import muiXDatePickersAdapterDayjsDefault, * as muiXDatePickersAdapterDayjs from '@mui/x-date-pickers/AdapterDayjs';
import muiXDatePickersClockPickerDefault, * as muiXDatePickersClockPicker from '@mui/x-date-pickers/ClockPicker';
import muiXDatePickersPickersActionBarDefault, * as muiXDatePickersPickersActionBar from '@mui/x-date-pickers/PickersActionBar';
import muiXDatePickersTimePickerDefault, * as muiXDatePickersTimePicker from '@mui/x-date-pickers/TimePicker';
import muiXDatePickerslocalesDefault, * as muiXDatePickerslocales from '@mui/x-date-pickers/locales';
import muiXDatePickersDatePickerDefault, * as muiXDatePickersDatePicker from '@mui/x-date-pickers/DatePicker';
import muiXDatePickersLocalizationProviderDefault, * as muiXDatePickersLocalizationProvider from '@mui/x-date-pickers/LocalizationProvider';
import muiXDatePickersPickersDayDefault, * as muiXDatePickersPickersDay from '@mui/x-date-pickers/PickersDay';
import muiXDatePickersYearPickerDefault, * as muiXDatePickersYearPicker from '@mui/x-date-pickers/YearPicker';
import muiXDatePickersDateTimePickerDefault, * as muiXDatePickersDateTimePicker from '@mui/x-date-pickers/DateTimePicker';
import muiXDatePickersMobileDatePickerDefault, * as muiXDatePickersMobileDatePicker from '@mui/x-date-pickers/MobileDatePicker';
import muiXDatePickersDesktopDatePickerDefault, * as muiXDatePickersDesktopDatePicker from '@mui/x-date-pickers/DesktopDatePicker';
import muiXDatePickersMobileDateTimePickerDefault, * as muiXDatePickersMobileDateTimePicker from '@mui/x-date-pickers/MobileDateTimePicker';
import muiXDatePickersStaticDatePickerDefault, * as muiXDatePickersStaticDatePicker from '@mui/x-date-pickers/StaticDatePicker';
import muiXDatePickersCalendarPickerDefault, * as muiXDatePickersCalendarPicker from '@mui/x-date-pickers/CalendarPicker';
import muiXDatePickersDesktopDateTimePickerDefault, * as muiXDatePickersDesktopDateTimePicker from '@mui/x-date-pickers/DesktopDateTimePicker';
import muiXDatePickersMobileTimePickerDefault, * as muiXDatePickersMobileTimePicker from '@mui/x-date-pickers/MobileTimePicker';
import muiXDatePickersStaticDateTimePickerDefault, * as muiXDatePickersStaticDateTimePicker from '@mui/x-date-pickers/StaticDateTimePicker';

import muiXDatePickersProDefault, * as muiXDatePickersPro from '@mui/x-date-pickers-pro';
import muiXDatePickersProDateRangePickerDefault, * as muiXDatePickersProDateRangePicker from '@mui/x-date-pickers-pro/DateRangePicker';
import muiXDatePickersProMultiInputDateRangeFieldDefault, * as muiXDatePickersProMultiInputDateRangeField from '@mui/x-date-pickers-pro/MultiInputDateRangeField';
import muiXDatePickersProAdapterDayjsDefault, * as muiXDatePickersProAdapterDayjs from '@mui/x-date-pickers-pro/AdapterDayjs';
import muiXDatePickersProDateRangePickerDayDefault, * as muiXDatePickersProDateRangePickerDay from '@mui/x-date-pickers-pro/DateRangePickerDay';
import muiXDatePickersProDesktopDateRangePickerDefault, * as muiXDatePickersProDesktopDateRangePicker from '@mui/x-date-pickers-pro/DesktopDateRangePicker';
import muiXDatePickersProSingleInputDateRangeFieldDefault, * as muiXDatePickersProSingleInputDateRangeField from '@mui/x-date-pickers-pro/SingleInputDateRangeField';
import muiXDatePickersProStaticDateRangePickerDefault, * as muiXDatePickersProStaticDateRangePicker from '@mui/x-date-pickers-pro/StaticDateRangePicker';
import muiXDatePickersProMobileDateRangePickerDefault, * as muiXDatePickersProMobileDateRangePicker from '@mui/x-date-pickers-pro/MobileDateRangePicker';

import muiXDataGridDefault, * as muiXDataGrid from '@mui/x-data-grid';
import muiXDataGridDataGridDefault, * as muiXDataGridDataGrid from '@mui/x-data-grid/DataGrid';

import muiXDataGridProDefault, * as muiXDataGridPro from '@mui/x-data-grid-pro';
import muiXDataGridProDataGridProDefault, * as muiXDataGridProDataGridPro from '@mui/x-data-grid-pro/DataGridPro';

import muiXDataGridGeneratorDefault, * as muiXDataGridGenerator from '@mui/x-data-grid-generator';

function esm(defaultExport: any, namedExports: any) {
  return { ...namedExports, default: defaultExport, __esModule: true };
}

const muiMaterialExports = new Map([
  ['@mui/material', esm(muiMaterialDefault, muiMaterial)],
  ['@mui/material/Accordion', esm(muiMaterialAccordionDefault, muiMaterialAccordion)],
  ['@mui/material/CssBaseline', esm(muiMaterialCssBaselineDefault, muiMaterialCssBaseline)],
  ['@mui/material/List', esm(muiMaterialListDefault, muiMaterialList)],
  ['@mui/material/Snackbar', esm(muiMaterialSnackbarDefault, muiMaterialSnackbar)],
  [
    '@mui/material/ToggleButtonGroup',
    esm(muiMaterialToggleButtonGroupDefault, muiMaterialToggleButtonGroup),
  ],
  [
    '@mui/material/AccordionActions',
    esm(muiMaterialAccordionActionsDefault, muiMaterialAccordionActions),
  ],
  ['@mui/material/Dialog', esm(muiMaterialDialogDefault, muiMaterialDialog)],
  ['@mui/material/ListItem', esm(muiMaterialListItemDefault, muiMaterialListItem)],
  [
    '@mui/material/SnackbarContent',
    esm(muiMaterialSnackbarContentDefault, muiMaterialSnackbarContent),
  ],
  ['@mui/material/Toolbar', esm(muiMaterialToolbarDefault, muiMaterialToolbar)],
  [
    '@mui/material/AccordionDetails',
    esm(muiMaterialAccordionDetailsDefault, muiMaterialAccordionDetails),
  ],
  ['@mui/material/DialogActions', esm(muiMaterialDialogActionsDefault, muiMaterialDialogActions)],
  [
    '@mui/material/ListItemAvatar',
    esm(muiMaterialListItemAvatarDefault, muiMaterialListItemAvatar),
  ],
  ['@mui/material/SpeedDial', esm(muiMaterialSpeedDialDefault, muiMaterialSpeedDial)],
  ['@mui/material/Tooltip', esm(muiMaterialTooltipDefault, muiMaterialTooltip)],
  [
    '@mui/material/AccordionSummary',
    esm(muiMaterialAccordionSummaryDefault, muiMaterialAccordionSummary),
  ],
  ['@mui/material/DialogContent', esm(muiMaterialDialogContentDefault, muiMaterialDialogContent)],
  [
    '@mui/material/ListItemButton',
    esm(muiMaterialListItemButtonDefault, muiMaterialListItemButton),
  ],
  [
    '@mui/material/SpeedDialAction',
    esm(muiMaterialSpeedDialActionDefault, muiMaterialSpeedDialAction),
  ],
  ['@mui/material/Typography', esm(muiMaterialTypographyDefault, muiMaterialTypography)],
  ['@mui/material/Alert', esm(muiMaterialAlertDefault, muiMaterialAlert)],
  [
    '@mui/material/DialogContentText',
    esm(muiMaterialDialogContentTextDefault, muiMaterialDialogContentText),
  ],
  ['@mui/material/ListItemIcon', esm(muiMaterialListItemIconDefault, muiMaterialListItemIcon)],
  ['@mui/material/SpeedDialIcon', esm(muiMaterialSpeedDialIconDefault, muiMaterialSpeedDialIcon)],
  [
    '@mui/material/Unstable_Grid2',
    esm(muiMaterialUnstable_Grid2Default, muiMaterialUnstable_Grid2),
  ],
  ['@mui/material/AlertTitle', esm(muiMaterialAlertTitleDefault, muiMaterialAlertTitle)],
  ['@mui/material/DialogTitle', esm(muiMaterialDialogTitleDefault, muiMaterialDialogTitle)],
  [
    '@mui/material/ListItemSecondaryAction',
    esm(muiMaterialListItemSecondaryActionDefault, muiMaterialListItemSecondaryAction),
  ],
  ['@mui/material/Stack', esm(muiMaterialStackDefault, muiMaterialStack)],
  [
    '@mui/material/Unstable_TrapFocus',
    esm(muiMaterialUnstable_TrapFocusDefault, muiMaterialUnstable_TrapFocus),
  ],
  ['@mui/material/AppBar', esm(muiMaterialAppBarDefault, muiMaterialAppBar)],
  ['@mui/material/Divider', esm(muiMaterialDividerDefault, muiMaterialDivider)],
  ['@mui/material/ListItemText', esm(muiMaterialListItemTextDefault, muiMaterialListItemText)],
  ['@mui/material/Step', esm(muiMaterialStepDefault, muiMaterialStep)],
  ['@mui/material/Zoom', esm(muiMaterialZoomDefault, muiMaterialZoom)],
  ['@mui/material/Autocomplete', esm(muiMaterialAutocompleteDefault, muiMaterialAutocomplete)],
  ['@mui/material/Drawer', esm(muiMaterialDrawerDefault, muiMaterialDrawer)],
  ['@mui/material/ListSubheader', esm(muiMaterialListSubheaderDefault, muiMaterialListSubheader)],
  ['@mui/material/StepButton', esm(muiMaterialStepButtonDefault, muiMaterialStepButton)],
  ['@mui/material/className', esm(muiMaterialclassNameDefault, muiMaterialclassName)],
  ['@mui/material/Avatar', esm(muiMaterialAvatarDefault, muiMaterialAvatar)],
  ['@mui/material/Fab', esm(muiMaterialFabDefault, muiMaterialFab)],
  ['@mui/material/Menu', esm(muiMaterialMenuDefault, muiMaterialMenu)],
  ['@mui/material/StepConnector', esm(muiMaterialStepConnectorDefault, muiMaterialStepConnector)],
  ['@mui/material/colors', esm(muiMaterialcolorsDefault, muiMaterialcolors)],
  ['@mui/material/AvatarGroup', esm(muiMaterialAvatarGroupDefault, muiMaterialAvatarGroup)],
  ['@mui/material/Fade', esm(muiMaterialFadeDefault, muiMaterialFade)],
  ['@mui/material/MenuItem', esm(muiMaterialMenuItemDefault, muiMaterialMenuItem)],
  ['@mui/material/StepContent', esm(muiMaterialStepContentDefault, muiMaterialStepContent)],
  ['@mui/material/darkScrollbar', esm(muiMaterialdarkScrollbarDefault, muiMaterialdarkScrollbar)],
  ['@mui/material/Backdrop', esm(muiMaterialBackdropDefault, muiMaterialBackdrop)],
  ['@mui/material/FilledInput', esm(muiMaterialFilledInputDefault, muiMaterialFilledInput)],
  ['@mui/material/MenuList', esm(muiMaterialMenuListDefault, muiMaterialMenuList)],
  ['@mui/material/StepIcon', esm(muiMaterialStepIconDefault, muiMaterialStepIcon)],
  ['@mui/material/Badge', esm(muiMaterialBadgeDefault, muiMaterialBadge)],
  ['@mui/material/FormControl', esm(muiMaterialFormControlDefault, muiMaterialFormControl)],
  ['@mui/material/MobileStepper', esm(muiMaterialMobileStepperDefault, muiMaterialMobileStepper)],
  ['@mui/material/StepLabel', esm(muiMaterialStepLabelDefault, muiMaterialStepLabel)],
  [
    '@mui/material/BottomNavigation',
    esm(muiMaterialBottomNavigationDefault, muiMaterialBottomNavigation),
  ],
  [
    '@mui/material/FormControlLabel',
    esm(muiMaterialFormControlLabelDefault, muiMaterialFormControlLabel),
  ],
  ['@mui/material/Modal', esm(muiMaterialModalDefault, muiMaterialModal)],
  ['@mui/material/Stepper', esm(muiMaterialStepperDefault, muiMaterialStepper)],
  [
    '@mui/material/BottomNavigationAction',
    esm(muiMaterialBottomNavigationActionDefault, muiMaterialBottomNavigationAction),
  ],
  ['@mui/material/FormGroup', esm(muiMaterialFormGroupDefault, muiMaterialFormGroup)],
  ['@mui/material/NativeSelect', esm(muiMaterialNativeSelectDefault, muiMaterialNativeSelect)],
  [
    '@mui/material/StyledEngineProvider',
    esm(muiMaterialStyledEngineProviderDefault, muiMaterialStyledEngineProvider),
  ],
  ['@mui/material/Box', esm(muiMaterialBoxDefault, muiMaterialBox)],
  [
    '@mui/material/FormHelperText',
    esm(muiMaterialFormHelperTextDefault, muiMaterialFormHelperText),
  ],
  ['@mui/material/NoSsr', esm(muiMaterialNoSsrDefault, muiMaterialNoSsr)],
  ['@mui/material/SvgIcon', esm(muiMaterialSvgIconDefault, muiMaterialSvgIcon)],
  ['@mui/material/locale', esm(muiMateriallocaleDefault, muiMateriallocale)],
  ['@mui/material/Breadcrumbs', esm(muiMaterialBreadcrumbsDefault, muiMaterialBreadcrumbs)],
  ['@mui/material/FormLabel', esm(muiMaterialFormLabelDefault, muiMaterialFormLabel)],
  ['@mui/material/OutlinedInput', esm(muiMaterialOutlinedInputDefault, muiMaterialOutlinedInput)],
  [
    '@mui/material/SwipeableDrawer',
    esm(muiMaterialSwipeableDrawerDefault, muiMaterialSwipeableDrawer),
  ],
  ['@mui/material/Button', esm(muiMaterialButtonDefault, muiMaterialButton)],
  ['@mui/material/GlobalStyles', esm(muiMaterialGlobalStylesDefault, muiMaterialGlobalStyles)],
  ['@mui/material/Switch', esm(muiMaterialSwitchDefault, muiMaterialSwitch)],
  ['@mui/material/ButtonBase', esm(muiMaterialButtonBaseDefault, muiMaterialButtonBase)],
  ['@mui/material/Grid', esm(muiMaterialGridDefault, muiMaterialGrid)],
  ['@mui/material/Pagination', esm(muiMaterialPaginationDefault, muiMaterialPagination)],
  ['@mui/material/Tab', esm(muiMaterialTabDefault, muiMaterialTab)],
  ['@mui/material/ButtonGroup', esm(muiMaterialButtonGroupDefault, muiMaterialButtonGroup)],
  ['@mui/material/Grow', esm(muiMaterialGrowDefault, muiMaterialGrow)],
  [
    '@mui/material/PaginationItem',
    esm(muiMaterialPaginationItemDefault, muiMaterialPaginationItem),
  ],
  [
    '@mui/material/TabScrollButton',
    esm(muiMaterialTabScrollButtonDefault, muiMaterialTabScrollButton),
  ],
  ['@mui/material/Hidden', esm(muiMaterialHiddenDefault, muiMaterialHidden)],
  ['@mui/material/Paper', esm(muiMaterialPaperDefault, muiMaterialPaper)],
  ['@mui/material/Table', esm(muiMaterialTableDefault, muiMaterialTable)],
  ['@mui/material/styles', esm(muiMaterialstylesDefault, muiMaterialstyles)],
  ['@mui/material/Card', esm(muiMaterialCardDefault, muiMaterialCard)],
  ['@mui/material/Icon', esm(muiMaterialIconDefault, muiMaterialIcon)],
  ['@mui/material/Popover', esm(muiMaterialPopoverDefault, muiMaterialPopover)],
  ['@mui/material/TableBody', esm(muiMaterialTableBodyDefault, muiMaterialTableBody)],
  [
    '@mui/material/CardActionArea',
    esm(muiMaterialCardActionAreaDefault, muiMaterialCardActionArea),
  ],
  ['@mui/material/IconButton', esm(muiMaterialIconButtonDefault, muiMaterialIconButton)],
  ['@mui/material/Popper', esm(muiMaterialPopperDefault, muiMaterialPopper)],
  ['@mui/material/TableCell', esm(muiMaterialTableCellDefault, muiMaterialTableCell)],
  ['@mui/material/transitions', esm(muiMaterialtransitionsDefault, muiMaterialtransitions)],
  ['@mui/material/CardActions', esm(muiMaterialCardActionsDefault, muiMaterialCardActions)],
  ['@mui/material/ImageList', esm(muiMaterialImageListDefault, muiMaterialImageList)],
  ['@mui/material/Portal', esm(muiMaterialPortalDefault, muiMaterialPortal)],
  [
    '@mui/material/TableContainer',
    esm(muiMaterialTableContainerDefault, muiMaterialTableContainer),
  ],
  ['@mui/material/CardContent', esm(muiMaterialCardContentDefault, muiMaterialCardContent)],
  ['@mui/material/ImageListItem', esm(muiMaterialImageListItemDefault, muiMaterialImageListItem)],
  ['@mui/material/TableFooter', esm(muiMaterialTableFooterDefault, muiMaterialTableFooter)],
  [
    '@mui/material/useAutocomplete',
    esm(muiMaterialuseAutocompleteDefault, muiMaterialuseAutocomplete),
  ],
  ['@mui/material/CardHeader', esm(muiMaterialCardHeaderDefault, muiMaterialCardHeader)],
  [
    '@mui/material/ImageListItemBar',
    esm(muiMaterialImageListItemBarDefault, muiMaterialImageListItemBar),
  ],
  ['@mui/material/Radio', esm(muiMaterialRadioDefault, muiMaterialRadio)],
  ['@mui/material/TableHead', esm(muiMaterialTableHeadDefault, muiMaterialTableHead)],
  ['@mui/material/useMediaQuery', esm(muiMaterialuseMediaQueryDefault, muiMaterialuseMediaQuery)],
  ['@mui/material/CardMedia', esm(muiMaterialCardMediaDefault, muiMaterialCardMedia)],
  ['@mui/material/Input', esm(muiMaterialInputDefault, muiMaterialInput)],
  ['@mui/material/RadioGroup', esm(muiMaterialRadioGroupDefault, muiMaterialRadioGroup)],
  [
    '@mui/material/TablePagination',
    esm(muiMaterialTablePaginationDefault, muiMaterialTablePagination),
  ],
  ['@mui/material/usePagination', esm(muiMaterialusePaginationDefault, muiMaterialusePagination)],
  ['@mui/material/Checkbox', esm(muiMaterialCheckboxDefault, muiMaterialCheckbox)],
  [
    '@mui/material/InputAdornment',
    esm(muiMaterialInputAdornmentDefault, muiMaterialInputAdornment),
  ],
  ['@mui/material/Rating', esm(muiMaterialRatingDefault, muiMaterialRating)],
  ['@mui/material/TableRow', esm(muiMaterialTableRowDefault, muiMaterialTableRow)],
  [
    '@mui/material/useScrollTrigger',
    esm(muiMaterialuseScrollTriggerDefault, muiMaterialuseScrollTrigger),
  ],
  ['@mui/material/Chip', esm(muiMaterialChipDefault, muiMaterialChip)],
  ['@mui/material/InputBase', esm(muiMaterialInputBaseDefault, muiMaterialInputBase)],
  [
    '@mui/material/ScopedCssBaseline',
    esm(muiMaterialScopedCssBaselineDefault, muiMaterialScopedCssBaseline),
  ],
  [
    '@mui/material/TableSortLabel',
    esm(muiMaterialTableSortLabelDefault, muiMaterialTableSortLabel),
  ],
  [
    '@mui/material/useTouchRipple',
    esm(muiMaterialuseTouchRippleDefault, muiMaterialuseTouchRipple),
  ],
  [
    '@mui/material/CircularProgress',
    esm(muiMaterialCircularProgressDefault, muiMaterialCircularProgress),
  ],
  ['@mui/material/InputLabel', esm(muiMaterialInputLabelDefault, muiMaterialInputLabel)],
  ['@mui/material/Select', esm(muiMaterialSelectDefault, muiMaterialSelect)],
  ['@mui/material/Tabs', esm(muiMaterialTabsDefault, muiMaterialTabs)],
  ['@mui/material/utils', esm(muiMaterialutilsDefault, muiMaterialutils)],
  [
    '@mui/material/ClickAwayListener',
    esm(muiMaterialClickAwayListenerDefault, muiMaterialClickAwayListener),
  ],
  ['@mui/material/Skeleton', esm(muiMaterialSkeletonDefault, muiMaterialSkeleton)],
  ['@mui/material/TextField', esm(muiMaterialTextFieldDefault, muiMaterialTextField)],
  ['@mui/material/Collapse', esm(muiMaterialCollapseDefault, muiMaterialCollapse)],
  [
    '@mui/material/LinearProgress',
    esm(muiMaterialLinearProgressDefault, muiMaterialLinearProgress),
  ],
  ['@mui/material/Slide', esm(muiMaterialSlideDefault, muiMaterialSlide)],
  [
    '@mui/material/TextareaAutosize',
    esm(muiMaterialTextareaAutosizeDefault, muiMaterialTextareaAutosize),
  ],
  ['@mui/material/Container', esm(muiMaterialContainerDefault, muiMaterialContainer)],
  ['@mui/material/Link', esm(muiMaterialLinkDefault, muiMaterialLink)],
  ['@mui/material/Slider', esm(muiMaterialSliderDefault, muiMaterialSlider)],
  ['@mui/material/ToggleButton', esm(muiMaterialToggleButtonDefault, muiMaterialToggleButton)],
]);

const muiDatePickersExports = new Map([
  ['@mui/x-date-pickers', esm(muiXDatePickersDefault, muiXDatePickers)],
  // ['@mui/x-date-pickers/AdapterDateFns', esm(muiXDatePickersAdapterDateFnsDefault, muiXDatePickersAdapterDateFns)],
  [
    '@mui/x-date-pickers/CalendarPickerSkeleton',
    esm(muiXDatePickersCalendarPickerSkeletonDefault, muiXDatePickersCalendarPickerSkeleton),
  ],
  [
    '@mui/x-date-pickers/DesktopTimePicker',
    esm(muiXDatePickersDesktopTimePickerDefault, muiXDatePickersDesktopTimePicker),
  ],
  [
    '@mui/x-date-pickers/MonthPicker',
    esm(muiXDatePickersMonthPickerDefault, muiXDatePickersMonthPicker),
  ],
  [
    '@mui/x-date-pickers/StaticTimePicker',
    esm(muiXDatePickersStaticTimePickerDefault, muiXDatePickersStaticTimePicker),
  ],
  [
    '@mui/x-date-pickers/AdapterDayjs',
    esm(muiXDatePickersAdapterDayjsDefault, muiXDatePickersAdapterDayjs),
  ],
  [
    '@mui/x-date-pickers/ClockPicker',
    esm(muiXDatePickersClockPickerDefault, muiXDatePickersClockPicker),
  ],
  [
    '@mui/x-date-pickers/PickersActionBar',
    esm(muiXDatePickersPickersActionBarDefault, muiXDatePickersPickersActionBar),
  ],
  [
    '@mui/x-date-pickers/TimePicker',
    esm(muiXDatePickersTimePickerDefault, muiXDatePickersTimePicker),
  ],
  ['@mui/x-date-pickers/locales', esm(muiXDatePickerslocalesDefault, muiXDatePickerslocales)],
  // ['@mui/x-date-pickers/AdapterLuxon', esm(muiXDatePickersAdapterLuxonDefault, muiXDatePickersAdapterLuxon)],
  [
    '@mui/x-date-pickers/DatePicker',
    esm(muiXDatePickersDatePickerDefault, muiXDatePickersDatePicker),
  ],
  [
    '@mui/x-date-pickers/LocalizationProvider',
    esm(muiXDatePickersLocalizationProviderDefault, muiXDatePickersLocalizationProvider),
  ],
  [
    '@mui/x-date-pickers/PickersDay',
    esm(muiXDatePickersPickersDayDefault, muiXDatePickersPickersDay),
  ],
  [
    '@mui/x-date-pickers/YearPicker',
    esm(muiXDatePickersYearPickerDefault, muiXDatePickersYearPicker),
  ],
  // ['@mui/x-date-pickers/AdapterMoment', esm(muiXDatePickersAdapterMomentDefault, muiXDatePickersAdapterMoment)],
  [
    '@mui/x-date-pickers/DateTimePicker',
    esm(muiXDatePickersDateTimePickerDefault, muiXDatePickersDateTimePicker),
  ],
  [
    '@mui/x-date-pickers/MobileDatePicker',
    esm(muiXDatePickersMobileDatePickerDefault, muiXDatePickersMobileDatePicker),
  ],
  [
    '@mui/x-date-pickers/DesktopDatePicker',
    esm(muiXDatePickersDesktopDatePickerDefault, muiXDatePickersDesktopDatePicker),
  ],
  [
    '@mui/x-date-pickers/MobileDateTimePicker',
    esm(muiXDatePickersMobileDateTimePickerDefault, muiXDatePickersMobileDateTimePicker),
  ],
  [
    '@mui/x-date-pickers/StaticDatePicker',
    esm(muiXDatePickersStaticDatePickerDefault, muiXDatePickersStaticDatePicker),
  ],
  [
    '@mui/x-date-pickers/CalendarPicker',
    esm(muiXDatePickersCalendarPickerDefault, muiXDatePickersCalendarPicker),
  ],
  [
    '@mui/x-date-pickers/DesktopDateTimePicker',
    esm(muiXDatePickersDesktopDateTimePickerDefault, muiXDatePickersDesktopDateTimePicker),
  ],
  [
    '@mui/x-date-pickers/MobileTimePicker',
    esm(muiXDatePickersMobileTimePickerDefault, muiXDatePickersMobileTimePicker),
  ],
  [
    '@mui/x-date-pickers/StaticDateTimePicker',
    esm(muiXDatePickersStaticDateTimePickerDefault, muiXDatePickersStaticDateTimePicker),
  ],
]);

const muiDatePickersProExports = new Map([
  ['@mui/x-date-pickers-pro', esm(muiXDatePickersProDefault, muiXDatePickersPro)],
  // ['@mui/x-date-pickers-pro/AdapterDateFns', esm(muiXDatePickersProAdapterDateFnsDefault, muiXDatePickersProAdapterDateFns)],
  [
    '@mui/x-date-pickers-pro/DateRangePicker',
    esm(muiXDatePickersProDateRangePickerDefault, muiXDatePickersProDateRangePicker),
  ],
  [
    '@mui/x-date-pickers-pro/MultiInputDateRangeField',
    esm(
      muiXDatePickersProMultiInputDateRangeFieldDefault,
      muiXDatePickersProMultiInputDateRangeField,
    ),
  ],
  [
    '@mui/x-date-pickers-pro/AdapterDayjs',
    esm(muiXDatePickersProAdapterDayjsDefault, muiXDatePickersProAdapterDayjs),
  ],
  [
    '@mui/x-date-pickers-pro/DateRangePickerDay',
    esm(muiXDatePickersProDateRangePickerDayDefault, muiXDatePickersProDateRangePickerDay),
  ],
  // ['@mui/x-date-pickers-pro/AdapterLuxon', esm(muiXDatePickersProAdapterLuxonDefault, muiXDatePickersProAdapterLuxon)],
  [
    '@mui/x-date-pickers-pro/DesktopDateRangePicker',
    esm(muiXDatePickersProDesktopDateRangePickerDefault, muiXDatePickersProDesktopDateRangePicker),
  ],
  [
    '@mui/x-date-pickers-pro/SingleInputDateRangeField',
    esm(
      muiXDatePickersProSingleInputDateRangeFieldDefault,
      muiXDatePickersProSingleInputDateRangeField,
    ),
  ],
  // ['@mui/x-date-pickers-pro/AdapterMoment', esm(muiXDatePickersProAdapterMomentDefault, muiXDatePickersProAdapterMoment)],
  [
    '@mui/x-date-pickers-pro/StaticDateRangePicker',
    esm(muiXDatePickersProStaticDateRangePickerDefault, muiXDatePickersProStaticDateRangePicker),
  ],
  [
    '@mui/x-date-pickers-pro/MobileDateRangePicker',
    esm(muiXDatePickersProMobileDateRangePickerDefault, muiXDatePickersProMobileDateRangePicker),
  ],
]);

const muiDataGridExports = new Map([
  ['@mui/x-data-grid', esm(muiXDataGridDefault, muiXDataGrid)],
  ['@mui/x-data-grid/DataGrid', esm(muiXDataGridDataGridDefault, muiXDataGridDataGrid)],
]);

const muiDataGridProExports = new Map([
  ['@mui/x-data-grid-pro', esm(muiXDataGridProDefault, muiXDataGridPro)],
  [
    '@mui/x-data-grid-pro/DataGridPro',
    esm(muiXDataGridProDataGridProDefault, muiXDataGridProDataGridPro),
  ],
]);

export default new Map([
  ['react', esm(ReactDefault, React)],
  ['react-dom', esm(ReactDomDefault, ReactDom)],
  ['dayjs', esm(DayJsDefault, DayJs)],
  ['@mui/toolpad-core', esm(muiToolpadCoreDefault, muiToolpadCore)],
  ['@mui/icons-material', esm(muiIconsMaterialDefault, muiIconsMaterial)],

  ...muiMaterialExports,
  ...muiDatePickersExports,
  ...muiDatePickersProExports,
  ...muiDataGridExports,
  ...muiDataGridProExports,
  ['@mui/x-data-grid-generator', esm(muiXDataGridGeneratorDefault, muiXDataGridGenerator)],
]);
