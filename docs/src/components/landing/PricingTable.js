import * as React from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconImage from 'docs/src/components/icon/IconImage';

function PlanName({ planInfo, centered = false, disableDescription = false }) {
  const { title, color, description } = planInfo;
  return (
    <React.Fragment>
      {centered ? (
        <Typography
          variant="body2"
          fontWeight="bold"
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <IconImage name={`block-${color}`} sx={{ mr: 1 }} /> {title}
        </Typography>
      ) : (
        <Typography
          variant="body2"
          fontWeight="bold"
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          {title} <IconImage name={`block-${color}`} />
        </Typography>
      )}
      {!disableDescription ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, minHeight: { md: 63 } }}>
          {description}
        </Typography>
      ) : null}
    </React.Fragment>
  );
}

PlanName.propTypes = {
  centered: PropTypes.bool,
  disableDescription: PropTypes.bool,
  planInfo: PropTypes.shape({
    color: PropTypes.string.isRequired,
    description: PropTypes.string,
    title: PropTypes.string.isRequired,
  }),
};

const Cell = ({ highlighted = false, ...props }) => (
  <Box
    {...props}
    sx={{
      py: 2,
      px: 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      ...(highlighted && {
        borderWidth: '0 1px 0 1px',
        borderStyle: 'solid',
        borderColor: (theme) => (theme.palette.mode === 'dark' ? 'primaryDark.700' : 'grey.100'),
        bgcolor: (theme) =>
          theme.palette.mode === 'dark'
            ? alpha(theme.palette.primaryDark[900], 0.5)
            : alpha(theme.palette.grey[50], 0.5),
      }),
      ...props.sx,
    }}
  />
);

Cell.propTypes = {
  highlighted: PropTypes.bool,
  sx: PropTypes.object,
};

const RowHead = ({ children, startIcon, ...props }) => (
  <Box
    {...props}
    sx={{
      justifyContent: 'flex-start',
      borderRadius: 1,
      bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'primaryDark.900' : 'grey.50'),
      p: 1,
      transition: 'none',
      typography: 'body2',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      ...props.sx,
    }}
  >
    {startIcon ? <Box sx={{ lineHeight: 0, mr: 1 }}>{startIcon}</Box> : null}
    {children}
  </Box>
);

RowHead.propTypes = {
  children: PropTypes.node.isRequired,
  startIcon: PropTypes.node,
  sx: PropTypes.object,
};

const RowCategory = (props) => (
  <Box
    {...props}
    sx={{
      typography: 'caption',
      display: 'block',
      fontWeight: 500,
      bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'primaryDark.900' : 'grey.50'),
      py: 1,
      ml: 1,
      pl: 1.5,
      borderBottom: '1px solid',
      borderColor: (theme) => (theme.palette.mode === 'dark' ? 'primaryDark.600' : 'grey.200'),
      ...props.sx,
    }}
  />
);

RowCategory.propTypes = {
  sx: PropTypes.object,
};

const StickyHead = ({ plans, planInfo, container, disableCalculation = false }) => {
  const [hidden, setHidden] = React.useState(true);
  React.useEffect(() => {
    function handleScroll() {
      if (container.current) {
        const rect = container.current.getBoundingClientRect();
        const appHeaderHeight = 64;
        const headHeight = 41;
        const tablePaddingTop = 40;
        if (
          rect.top + appHeaderHeight < 0 &&
          rect.height + rect.top - appHeaderHeight - headHeight - tablePaddingTop > 0
        ) {
          setHidden(false);
        } else {
          setHidden(true);
        }
      }
    }
    if (!disableCalculation) {
      document.addEventListener('scroll', handleScroll);
      return () => {
        document.removeEventListener('scroll', handleScroll);
      };
    }
    return () => {};
  }, [container, disableCalculation]);
  return (
    <Box
      sx={{
        position: 'fixed',
        zIndex: 1,
        top: 56,
        left: 0,
        right: 0,
        transition: '0.3s',
        ...(hidden && {
          opacity: 0,
          top: 0,
        }),
        py: 1,
        display: { xs: 'none', md: 'block' },
        backdropFilter: 'blur(20px)',
        boxShadow: (theme) =>
          `inset 0px -1px 1px ${
            theme.palette.mode === 'dark' ? theme.palette.primaryDark[700] : theme.palette.grey[100]
          }`,
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark'
            ? alpha(theme.palette.primaryDark[900], 0.72)
            : 'rgba(255,255,255,0.72)',
      }}
    >
      <Container
        sx={{
          display: 'grid',
          gridTemplateColumns: `minmax(160px, 1fr) repeat(${plans.length}, minmax(240px, 1fr))`,
        }}
      >
        <Typography variant="body2" fontWeight="bold" sx={{ px: 2, py: 1 }}>
          Plans
        </Typography>
        {plans.map((plan) => (
          <Box key={plan} sx={{ px: 2, py: 1 }}>
            <PlanName planInfo={planInfo[plan]} centered disableDescription />
          </Box>
        ))}
      </Container>
    </Box>
  );
};

StickyHead.propTypes = {
  container: PropTypes.shape({
    current: PropTypes.shape({
      getBoundingClientRect: PropTypes.func.isRequired,
    }),
  }).isRequired,
  disableCalculation: PropTypes.bool,
  planInfo: PropTypes.object,
  plans: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const divider = <Divider />;

function PricingTable({
  columnHeaderHidden,
  planInfo,
  plans,
  rowHeaders,
  communityData,
  commercialData,
  ...props
}) {
  const tableRef = React.useRef(null);
  const gridSx = {
    display: 'grid',
    gridTemplateColumns: `minmax(160px, 1fr) repeat(${plans.length}, minmax(${
      columnHeaderHidden ? '0px' : '240px'
    }, 1fr))`,
  };
  function renderRow(key) {
    return (
      <Box
        sx={{
          ...gridSx,
          '&:hover': {
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.primaryDark[900], 0.3)
                : alpha(theme.palette.grey[50], 0.4),
            '@media (hover: none)': {
              bgcolor: 'initial',
            },
          },
        }}
      >
        {rowHeaders[key]}
        {plans.map((id, index) => (
          <Cell key={id} highlighted={index % 2 === 1}>
            {id === 'community' ? communityData[key] : null}
            {id === 'commercial' ? commercialData[key] : null}
          </Cell>
        ))}
      </Box>
    );
  }
  return (
    <Box
      ref={tableRef}
      {...props}
      sx={{
        width: '100%',
        overflow: 'auto',
        py: { xs: 2, md: 4 },
        ...props.sx,
      }}
    >
      <StickyHead
        plans={plans}
        planInfo={planInfo}
        container={tableRef}
        disableCalculation={columnHeaderHidden}
      />
      {!columnHeaderHidden ? (
        <Box sx={gridSx}>
          <Typography variant="body2" fontWeight="bold" sx={{ p: 2 }}>
            Plans
          </Typography>
          {plans.map((plan) => (
            <Box key={plan} sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
              <PlanName planInfo={planInfo[plan]} />
            </Box>
          ))}
        </Box>
      ) : null}
      <RowHead>Apps</RowHead>
      {renderRow('Self-hosting')}
      {divider}
      {renderRow('Cloud hosting')}
      {divider}
      {renderRow('Basic components')}
      {divider}
      {renderRow('Custom components')}
      {divider}
      {renderRow('Advanced components')}
      {divider}
      {renderRow('Version control')}
      {divider}
      {renderRow('Git Sync')}
      {divider}
      {renderRow('Import ESM')}
      {divider}
      {renderRow('Eject ESM')}
      {divider}
      {renderRow('Custom themes')}
      {divider}
      {renderRow('Multiple environments')}
      {divider}
      {renderRow('White label')}
      <RowHead>Users</RowHead>

      {divider}
      {renderRow('Unlimited applications and users')}
      <RowHead>Data</RowHead>
      {divider}
      {renderRow('Unlimited REST data sources')}
      <RowHead>Support</RowHead>
      {renderRow('community')}
      {divider}
    </Box>
  );
}

PricingTable.propTypes = {
  columnHeaderHidden: PropTypes.bool,
  commercialData: PropTypes.object,
  communityData: PropTypes.object,
  planInfo: PropTypes.object,
  plans: PropTypes.arrayOf(PropTypes.string),
  rowHeaders: PropTypes.object,
  sx: PropTypes.object,
};

const Plan = ({ planInfo, benefits, unavailable, sx, ...props }) => {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, ...(unavailable && { '& .MuiTypography-root': { opacity: 0.5 } }), ...sx }}
      {...props}
    >
      <PlanName planInfo={planInfo} />
    </Paper>
  );
};

Plan.propTypes = {
  benefits: PropTypes.arrayOf(PropTypes.string),
  planInfo: PropTypes.object,
  sx: PropTypes.object,
  unavailable: PropTypes.bool,
};

function PricingList({ plans, planInfo, rowHeaders, commercialData, communityData }) {
  const [selectedPlan, setSelectedPlan] = React.useState(plans[0]);
  const selectedIndex = React.useMemo(() => plans.indexOf(selectedPlan), [plans, selectedPlan]);
  return (
    <Container sx={{ pb: 2, mt: '-1px', display: { xs: 'block', md: 'none' } }}>
      <Tabs
        value={selectedIndex}
        variant="fullWidth"
        onChange={(_event, value) => setSelectedPlan(plans[value])}
        sx={{
          mb: 2,
          position: 'sticky',
          top: 55,
          bgcolor: 'background.paper',
          zIndex: 1,
          mx: { xs: -2, sm: -3 },
          borderTop: '1px solid',
          borderColor: 'divider',
          '& .MuiTab-root': {
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&.Mui-selected': {
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'primaryDark.700' : 'grey.50'),
            },
          },
        }}
      >
        {plans.map((plan, index) => (
          <Tab
            key={plan}
            label={planInfo[plan].title}
            value={index}
            sx={
              // Only add borders to plans in odd indices (not the last one)
              index % 2 !== 0 && typeof plans[index + 1] !== 'undefined'
                ? { borderWidth: '0 1px 0 1px', borderStyle: 'solid', borderColor: 'divider' }
                : null
            }
          />
        ))}
      </Tabs>
      <Fade in>
        <div>
          <Plan planInfo={planInfo[selectedPlan]} />
          <PricingTable
            commercialData={commercialData}
            communityData={communityData}
            rowHeaders={rowHeaders}
            columnHeaderHidden
            plans={[`${selectedPlan}`]}
            planInfo={planInfo}
          />
        </div>
      </Fade>
    </Container>
  );
}

PricingList.propTypes = {
  commercialData: PropTypes.object,
  communityData: PropTypes.object,
  planInfo: PropTypes.object.isRequired,
  plans: PropTypes.arrayOf(PropTypes.string).isRequired,
  rowHeaders: PropTypes.object,
};

export default function Pricing({ plans, planInfo, rowHeaders, commercialData, communityData }) {
  return (
    <React.Fragment>
      <PricingList
        plans={plans}
        planInfo={planInfo}
        rowHeaders={rowHeaders}
        communityData={communityData}
        commercialData={commercialData}
      />
      <Container sx={{ display: { xs: 'none', md: 'block' } }}>
        <PricingTable
          plans={plans}
          planInfo={planInfo}
          rowHeaders={rowHeaders}
          communityData={communityData}
          commercialData={commercialData}
        />
        {/* Desktop */}
      </Container>
    </React.Fragment>
  );
}

Pricing.propTypes = {
  commercialData: PropTypes.object,
  communityData: PropTypes.object,
  planInfo: PropTypes.object.isRequired,
  plans: PropTypes.arrayOf(PropTypes.string).isRequired,
  rowHeaders: PropTypes.object,
};
