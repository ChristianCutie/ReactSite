import React from "react";
import { Button } from "@mui/material";
import Sidebar from "../../components/layout/Sidebar.jsx";
import { useNavigate } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { Grid, Card, CardContent, Typography, AppBar, Toolbar, Avatar } from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PeopleIcon from "@mui/icons-material/People";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const Dashboard = ({setIsAuthenticated}) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <>
      <CssBaseline />
      <Sidebar onLogout={handleLogout} />
      <main className="ml-72 min-h-screen bg-gray-50 transition-all duration-300">
        {/* Top AppBar */}
        <AppBar position="sticky" sx={{ ml: 0, backgroundColor: "white", color: "black", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <Toolbar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Admin Dashboard
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: "primary.main", cursor: "pointer" }}>AD</Avatar>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Welcome back! 👋
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Here's what's happening with your inventory today.
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Total Products */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: "100%", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", transition: "transform 0.2s", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" } }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Total Products
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        1,234
                      </Typography>
                      <Typography variant="caption" sx={{ color: "success.main" }}>
                        +12% from last month
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: "primary.light", width: 50, height: 50 }}>
                      <InventoryIcon sx={{ color: "primary.main" }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Total Orders */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: "100%", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", transition: "transform 0.2s", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" } }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Total Orders
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        856
                      </Typography>
                      <Typography variant="caption" sx={{ color: "success.main" }}>
                        +8% from last month
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: "info.light", width: 50, height: 50 }}>
                      <ShoppingCartIcon sx={{ color: "info.main" }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Total Customers */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: "100%", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", transition: "transform 0.2s", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" } }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Total Customers
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        542
                      </Typography>
                      <Typography variant="caption" sx={{ color: "success.main" }}>
                        +5% from last month
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: "warning.light", width: 50, height: 50 }}>
                      <PeopleIcon sx={{ color: "warning.main" }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Revenue */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: "100%", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", transition: "transform 0.2s", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" } }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Revenue
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        $12.5k
                      </Typography>
                      <Typography variant="caption" sx={{ color: "success.main" }}>
                        +23% from last month
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: "success.light", width: 50, height: 50 }}>
                      <TrendingUpIcon sx={{ color: "success.main" }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Additional Info Card */}
          <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button variant="contained" color="primary">
                  Add Product
                </Button>
                <Button variant="outlined" color="primary">
                  View Reports
                </Button>
                <Button variant="outlined" color="primary">
                  Manage Orders
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </main>
    </>
  );
};

export default Dashboard;
