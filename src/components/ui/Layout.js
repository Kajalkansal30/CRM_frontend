// components/ui/Layout.js
import React, { useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, Box, Toolbar, Typography, Drawer, List, 
  ListItem, ListItemIcon, ListItemText, Divider, Avatar, 
  IconButton, styled, useTheme, useMediaQuery
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CategoryIcon from '@mui/icons-material/Category';
import CampaignIcon from '@mui/icons-material/Campaign';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { AuthContext } from '../../contexts/AuthContext';

const drawerWidth = 240;

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  background: theme.palette.background.default,
  color: theme.palette.text.primary,
  boxShadow: 'none',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: 'border-box',
    borderRight: 'none',
    background: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
  },
}));

const NavListItem = styled(ListItem)(({ theme, selected }) => ({
  padding: theme.spacing(1.5, 3),
  cursor: 'pointer',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:focus': {
    outline: 'none',
  },
  ...(selected && {
    backgroundColor: theme.palette.action.selected,
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
    '& .MuiTypography-root': {
      fontWeight: 600,
    },
    '&:hover': {
      backgroundColor: theme.palette.action.selected,
    },
  }),
}));

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };
  
  const menuItems = [
    { path: '/dashboard', icon: <DashboardIcon />, text: 'Dashboard' },
    { path: '/customers', icon: <PeopleIcon />, text: 'Customers' },
    { path: '/segments', icon: <CategoryIcon />, text: 'Segments' },
    { path: '/campaigns', icon: <CampaignIcon />, text: 'Campaigns' },
    { path: '/orders', icon: <ShoppingCartIcon />, text: 'Orders' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <StyledAppBar position="fixed">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" noWrap component="div" sx={{ 
              fontWeight: 600,
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(90deg, #90caf9, #42a5f5)' 
                : 'linear-gradient(90deg, #1976d2, #0d47a1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Mini CRM Pro
            </Typography>
          </Box>
          
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                src={user.picture} 
                alt={user.name} 
                sx={{ 
                  width: 36, 
                  height: 36,
                  border: `2px solid ${theme.palette.primary.main}`
                }} 
              />
              <Typography variant="subtitle1" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {user.name}
              </Typography>
              <IconButton 
                color="inherit" 
                onClick={logout}
                sx={{
                  '&:hover': {
                    background: theme.palette.action.hover
                  }
                }}
              >
                <LogoutIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </StyledAppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                background: theme.palette.background.paper,
              },
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'flex-end',
              p: theme.spacing(0, 1),
              ...theme.mixins.toolbar 
            }}>
              <IconButton onClick={handleDrawerToggle}>
                {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </Box>
            <Divider />
            <List>
              {menuItems.map((item) => {
                const selected = location.pathname === item.path;
                return (
                  <NavListItem
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    selected={selected}
                  >
                    <ListItemIcon sx={{ minWidth: '40px' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ 
                        fontWeight: selected ? 600 : 400 
                      }} 
                    />
                  </NavListItem>
                );
              })}
            </List>
          </Drawer>
        ) : (
          <StyledDrawer variant="permanent" open>
            <Toolbar />
            <Divider />
            <List>
              {menuItems.map((item) => {
                const selected = location.pathname === item.path;
                return (
                  <NavListItem
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    selected={selected}
                  >
                    <ListItemIcon sx={{ minWidth: '40px' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ 
                        fontWeight: selected ? 600 : 400 
                      }} 
                    />
                  </NavListItem>
                );
              })}
            </List>
          </StyledDrawer>
        )}
      </Box>
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { md: `calc(100% - ${drawerWidth}px)` },
          background: theme.palette.background.default,
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        <Box sx={{ 
          borderRadius: 2,
          p: isMobile ? 2 : 3,
          background: theme.palette.background.paper,
          boxShadow: theme.shadows[1],
          minHeight: 'calc(100vh - 64px - 24px)'
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;