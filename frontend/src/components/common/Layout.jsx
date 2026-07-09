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
  alpha,
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
      {/* APP BAR – blue → teal gradient, matching the Dashboard header */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, #1A73E8 0%, #0D9488 100%)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
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
            sx={{ flexGrow: 1, fontWeight: 600, letterSpacing: '0.5px' }}
          >
            Clinic Management System
          </Typography>

          <Button
            color="inherit"
            onClick={handleMenuOpen}
            sx={{
              textTransform: 'none',
              '&:hover': { backgroundColor: alpha('#fff', 0.1) },
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                mr: 1,
                bgcolor: '#2E7D32', // soft green for user avatar
                color: '#fff',
                fontWeight: 600,
              }}
            >
              {user?.username?.charAt(0)?.toUpperCase()}
            </Avatar>

            {drawerOpen && (
              <Typography variant="body2" fontWeight={500}>
                {user?.username}
              </Typography>
            )}
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              },
            }}
          >
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1, color: '#1A73E8' }} />
              <Typography variant="body2">Logout</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* SIDEBAR – clean white with subtle accents */}
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
            borderRight: '1px solid',
            borderColor: alpha('#0D9488', 0.15),
            backgroundColor: '#FFFFFF',
          },
        }}
      >
        {/* Sidebar header */}
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: drawerOpen ? 'flex-start' : 'center',
            px: 2,
          }}
        >
          {drawerOpen && (
            <Typography
              variant="h6"
              noWrap
              sx={{
                color: '#1A73E8',
                fontWeight: 700,
                letterSpacing: '0.3px',
              }}
            >
              Clinic System
            </Typography>
          )}
        </Toolbar>

        <Divider sx={{ borderColor: alpha('#0D9488', 0.15) }} />

        <List sx={{ pt: 1 }}>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                minHeight: 50,
                justifyContent: drawerOpen ? 'initial' : 'center',
                px: 2,
                mx: 1,
                borderRadius: 3,
                mb: 0.5,
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: alpha('#1A73E8', 0.08),
                },
                // active state can be added via location later
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: drawerOpen ? 2 : 0,
                  justifyContent: 'center',
                  color: '#1A73E8',
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  color: '#334155',
                }}
                sx={{
                  opacity: drawerOpen ? 1 : 0,
                  transition: 'opacity 0.2s',
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* MAIN CONTENT – light background matching the Dashboard */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          mt: 8,
          backgroundColor: '#F8FAFC',
          minHeight: '100vh',
          transition: 'all 0.2s ease',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}