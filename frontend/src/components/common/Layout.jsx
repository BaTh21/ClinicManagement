import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LogoutIcon from '@mui/icons-material/Logout';

import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;
const collapsedWidth = 70;

const allMenuItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/',
    roles: ['admin', 'doctor', 'receptionist'],
  },
  {
    text: 'Patients',
    icon: <PeopleIcon />,
    path: '/patients',
    roles: ['admin', 'doctor', 'receptionist'],
  },
  {
    text: 'Doctors',
    icon: <LocalHospitalIcon />,
    path: '/doctors',
    roles: ['admin', 'receptionist'],
  },
  {
    text: 'Appointments',
    icon: <CalendarTodayIcon />,
    path: '/appointments',
    roles: ['admin', 'doctor', 'receptionist'],
  },
  {
    text: 'Medical Records',
    icon: <MedicalServicesIcon />,
    path: '/medical-records',
    roles: ['admin', 'doctor'],
  },
  {
    text: 'Billing',
    icon: <ReceiptIcon />,
    path: '/billing',
    roles: ['admin', 'receptionist'],
  },
  {
    text: 'Users',
    icon: <PeopleIcon />,
    path: '/users',
    roles: ['admin'],
  },
];

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setDrawerOpen((prev) => !prev);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = allMenuItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* APP BAR */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            {drawerOpen ? <MenuOpenIcon /> : <MenuIcon />}
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1 }}
          >
            Clinic Management System
          </Typography>

          <Button color="inherit" onClick={handleMenuOpen}>
            <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
              {user?.username?.charAt(0)?.toUpperCase()}
            </Avatar>

            {drawerOpen && user?.username}
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* SIDEBAR */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerOpen ? drawerWidth : collapsedWidth,
          flexShrink: 0,

          '& .MuiDrawer-paper': {
            width: drawerOpen ? drawerWidth : collapsedWidth,
            overflowX: 'hidden',
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.easeInOut,
                duration: 200,
              }),
            boxSizing: 'border-box',
            borderRight: '1px solid #e0e0e0',
          },
        }}
      >
        <Toolbar>
          {drawerOpen && (
            <Typography variant="h6" noWrap>
              Clinic System
            </Typography>
          )}
        </Toolbar>

        <Divider />

        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                minHeight: 50,
                justifyContent: drawerOpen ? 'initial' : 'center',
                px: 2,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: drawerOpen ? 2 : 0,
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.text}
                sx={{
                  opacity: drawerOpen ? 1 : 0,
                  transition: 'opacity 0.2s',
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* MAIN CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          transition: 'all 0.2s ease',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}