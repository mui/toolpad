import * as React from 'react';
import {
  Menu,
  Box,
  MenuItem,
  MenuList,
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface Project {
  id: number;
  title: string;
}

interface ProjectsListProps {
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  handleMenuClose: () => void;
  handleLeave: (event: React.MouseEvent<HTMLUListElement>) => void;
  handleEnter: () => void;
  projects: Project[];
}

// Function to generate a random color
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i += 1) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const accounts = [
  {
    id: 1,
    name: 'Bharat Kashyap',
    email: 'bharatkashyap@outlook.com',
    image: 'https://avatars.githubusercontent.com/u/19550456',
    color: getRandomColor(),
    projects: [
      {
        id: 3,
        title: 'Project X',
      },
    ],
  },
  {
    id: 2,
    name: 'Bharat MUI',
    email: 'bharat@mui.com',
    color: getRandomColor(),
    projects: [{ id: 4, title: 'Project A' }],
  },
];

function ProjectsList(props: ProjectsListProps) {
  const { open, anchorEl, handleMenuClose, handleEnter, handleLeave, projects } =
    props;

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      slotProps={{
        root: {
          sx: {
            pointerEvents: 'none',
          },
        },
      }}
      anchorOrigin={{
        horizontal: 'right',
        vertical: 'top',
      }}
    >
      <MenuList
        sx={{
          pointerEvents: 'auto',
          minWidth: 200,
        }}
        disablePadding
        onMouseEnter={() => {
          handleEnter();
        }}
        onMouseLeave={handleLeave}
      >
        <Typography variant="caption" padding={1}>
          Projects
        </Typography>
        <Divider />
        {projects?.map((project) => (
          <MenuItem
            key={project.id}
            onClick={handleMenuClose}
            sx={{ px: 1, my: 1, columnGap: '1.25rem' }}
          >
            <ListItemText
              primary={project.title}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </MenuItem>
        ))}
        <Divider />
        <Button
          variant="text"
          sx={{ textTransform: 'capitalize', mx: 2 }}
          size="small"
          startIcon={<AddIcon />}
          disableElevation
        >
          Create new
        </Button>
      </MenuList>
    </Menu>
  );
}

export default function CustomMenu() {
  const mouseOnSubMenu = React.useRef<boolean>(false);

  const [selectedProjects, setSelectedProjects] = React.useState<Project[]>([]);

  const handleSelectProjects = React.useCallback((id: number) => {
    setSelectedProjects(
      accounts.find((account) => account.id === id)?.projects ?? [],
    );
  }, []);

  const [subMenuAnchorEl, setSubMenuAnchorEl] =
    React.useState<HTMLButtonElement | null>(null);
  const subMenuOpen = Boolean(subMenuAnchorEl);

  const handleTriggerEnter = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, id: number) => {
      handleSelectProjects(id);
      setSubMenuAnchorEl(event.currentTarget);
    },
    [handleSelectProjects],
  );

  const handleTriggerLeave = React.useCallback(() => {
    // Wait for 300ms to see if the mouse has moved to the sub menu
    setTimeout(() => {
      if (mouseOnSubMenu.current) {
        return;
      }
      setSubMenuAnchorEl(null);
    }, 300);
  }, []);

  const handleSubMenuEnter = React.useCallback(() => {
    mouseOnSubMenu.current = true;
  }, []);

  const handleSubMenuLeave = (event: React.MouseEvent<HTMLUListElement>) => {
    mouseOnSubMenu.current = false;
    if (subMenuAnchorEl?.contains(event.relatedTarget as Node)) {
      return;
    }
    setSubMenuAnchorEl(null);
  };

  const handleSubMenuClose = React.useCallback(() => {
    setSubMenuAnchorEl(null);
  }, []);

  return (
    <MenuList dense disablePadding>
      <Typography variant="body2" margin={1}>
        Accounts
      </Typography>
      {accounts.map((account) => (
        <MenuItem
          key={account.id}
          component="button"
          sx={{
            justifyContent: 'flex-start',
            width: '100%',
            columnGap: 2,
          }}
          // onClick={() => handleSelectProjects(account.id)}
          onMouseEnter={(event) => handleTriggerEnter(event, account.id)}
          onMouseLeave={handleTriggerLeave}
        >
          <ListItemIcon>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: '0.95rem',
                bgcolor: account.color,
              }}
              src={account.image ?? ''}
              alt={account.name ?? ''}
            >
              {account.name[0]}
            </Avatar>
          </ListItemIcon>
          <ListItemText
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              width: '100%',
            }}
            primary={account.name}
            secondary={account.email}
            primaryTypographyProps={{ variant: 'body2' }}
            secondaryTypographyProps={{ variant: 'caption' }}
          />
        </MenuItem>
      ))}

      <Divider />
      <ProjectsList
        open={subMenuOpen}
        anchorEl={subMenuAnchorEl}
        handleEnter={handleSubMenuEnter}
        handleLeave={handleSubMenuLeave}
        handleMenuClose={handleSubMenuClose}
        projects={selectedProjects}
      />
    </MenuList>
  );
}
