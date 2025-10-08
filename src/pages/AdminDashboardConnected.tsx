import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Package, ShoppingCart, DollarSign, Plus, Edit, Trash2, LogOut, TrendingUp, Users, BarChart3, PieChart as PieChartIcon, Settings, Bell, Home, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area } from "recharts";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string | null;
  image_url: string | null;
}

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  user_id: string;
  phone: string | null;
  address: string | null;
  profiles: {
    email: string;
    full_name: string | null;
  };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [trafficPeriod, setTrafficPeriod] = useState<"day" | "week" | "month">("week");
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeGoal, setActiveGoal] = useState<string>("");

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error("Access denied");
      navigate("/admin");
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadData();

      // Subscribe to realtime changes
      const ordersChannel = supabase
        .channel('admin-orders')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders'
          },
          () => {
            loadOrders();
            toast.info("New order received!", { duration: 5000 });
          }
        )
        .subscribe();

      const productsChannel = supabase
        .channel('admin-products')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'products'
          },
          () => {
            loadProducts();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(ordersChannel);
        supabase.removeChannel(productsChannel);
      };
    }
  }, [isAdmin]);

  const loadData = async () => {
    await Promise.all([loadProducts(), loadOrders(), loadCustomers(), loadTopProducts()]);
    setLoading(false);
  };

  const loadCustomers = async () => {
    const { count, error } = await supabase
      .from("profiles")
      .select("*", { count: 'exact', head: true });
    
    if (!error && count !== null) {
      setTotalCustomers(count);
    }
  };

  const loadTopProducts = async () => {
    const { data, error } = await supabase
      .from("order_items")
      .select("product_id, quantity, products(name, price)");
    
    if (!error && data) {
      const productStats: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
      
      data.forEach(item => {
        const productId = item.product_id;
        if (!productStats[productId]) {
          productStats[productId] = {
            name: (item.products as any)?.name || "Unknown",
            quantity: 0,
            revenue: 0
          };
        }
        productStats[productId].quantity += item.quantity;
        productStats[productId].revenue += item.quantity * Number((item.products as any)?.price || 0);
      });

      const topThree = Object.values(productStats)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 3);
      
      setTopProducts(topThree);
    }
  };

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      toast.error("Failed to load products");
      console.error(error);
    } else {
      setProducts(data || []);
    }
  };

  const loadOrders = async () => {
    // Get orders with phone and address
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (ordersError) {
      toast.error("Failed to load orders");
      console.error(ordersError);
      return;
    }

    // Then get profiles for each order (just email and name)
    const ordersWithProfiles = await Promise.all(
      (ordersData || []).map(async (order) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", order.user_id)
          .single();

        return {
          ...order,
          profiles: profile || { email: "N/A", full_name: null }
        };
      })
    );

    setOrders(ordersWithProfiles as Order[]);
  };

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
  const pendingOrders = orders.filter(o => o.status === "pending").length;

  // Traffic data based on orders
  const getTrafficData = () => {
    const now = new Date();
    const data: { name: string; orders: number }[] = [];

    if (trafficPeriod === "day") {
      for (let i = 23; i >= 0; i--) {
        const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hourOrders = orders.filter(o => {
          const orderDate = new Date(o.created_at);
          return orderDate.getHours() === hour.getHours() &&
                 orderDate.getDate() === hour.getDate();
        });
        data.push({
          name: `${hour.getHours()}:00`,
          orders: hourOrders.length
        });
      }
    } else if (trafficPeriod === "week") {
      for (let i = 6; i >= 0; i--) {
        const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayOrders = orders.filter(o => {
          const orderDate = new Date(o.created_at);
          return orderDate.toDateString() === day.toDateString();
        });
        data.push({
          name: day.toLocaleDateString('en-US', { weekday: 'short' }),
          orders: dayOrders.length
        });
      }
    } else {
      for (let i = 29; i >= 0; i--) {
        const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayOrders = orders.filter(o => {
          const orderDate = new Date(o.created_at);
          return orderDate.toDateString() === day.toDateString();
        });
        data.push({
          name: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          orders: dayOrders.length
        });
      }
    }
    
    return data;
  };

  // Top customers data
  const getTopCustomers = () => {
    const customerOrders: { [key: string]: { name: string; email: string; total: number; count: number } } = {};
    
    orders.forEach(order => {
      const userId = order.user_id;
      if (!customerOrders[userId]) {
        customerOrders[userId] = {
          name: order.profiles.full_name || "N/A",
          email: order.profiles.email,
          total: 0,
          count: 0
        };
      }
      customerOrders[userId].total += Number(order.total);
      customerOrders[userId].count += 1;
    });

    return Object.values(customerOrders)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map(customer => ({
        name: customer.name,
        value: customer.total,
        orders: customer.count
      }));
  };

  const trafficData = getTrafficData();
  const topCustomers = getTopCustomers().slice(0, 3);
  
  const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4'];
  
  const goals = [
    { name: "Monthly Revenue", current: totalRevenue, target: 50000, color: COLORS[0] },
    { name: "New Customers", current: totalCustomers, target: 100, color: COLORS[1] },
    { name: "Products Sold", current: orders.reduce((sum, o) => sum + 1, 0), target: 200, color: COLORS[2] }
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/admin");
  };

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const imageFile = formData.get("product-image") as File;

    let imageUrl = "/placeholder.svg";

    // Upload image if provided
    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        toast.error("Failed to upload image");
        console.error(uploadError);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      imageUrl = publicUrl;
    }

    const { error } = await supabase
      .from("products")
      .insert({
        name: formData.get("product-name") as string,
        price: parseFloat(formData.get("product-price") as string),
        stock: parseInt(formData.get("product-stock") as string),
        description: formData.get("product-description") as string,
        image_url: imageUrl,
      });

    if (error) {
      toast.error("Failed to add product");
      console.error(error);
    } else {
      toast.success("Product added successfully");
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete product");
    } else {
      toast.success("Product deleted");
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update order status");
    } else {
      toast.success(`Order status updated to ${newStatus}`);
    }
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-card border-r border-border transition-all duration-300 flex flex-col`}>
        <div className="p-6 border-b border-border">
          <h2 className={`font-bold text-lg ${sidebarCollapsed ? 'text-center' : ''}`}>
            {sidebarCollapsed ? 'AD' : 'Admin Dashboard'}
          </h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium">
            <Home className="h-5 w-5" />
            {!sidebarCollapsed && <span>Dashboard</span>}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors">
            <Bell className="h-5 w-5" />
            {!sidebarCollapsed && <span>Notifications</span>}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors">
            <Package className="h-5 w-5" />
            {!sidebarCollapsed && <span>Products</span>}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors">
            <ShoppingCart className="h-5 w-5" />
            {!sidebarCollapsed && <span>Orders</span>}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors">
            <BarChart3 className="h-5 w-5" />
            {!sidebarCollapsed && <span>Analytics</span>}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors">
            <PieChartIcon className="h-5 w-5" />
            {!sidebarCollapsed && <span>Reports</span>}
          </button>
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors">
            <Settings className="h-5 w-5" />
            {!sidebarCollapsed && <span>Settings</span>}
          </button>
          <Button variant="outline" onClick={handleLogout} className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            {!sidebarCollapsed && 'Logout'}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-card border-b border-border shadow-sm px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Last 7 days</Button>
              <Button variant="outline" size="sm">Export</Button>
              <Button variant="default" size="sm">Info</Button>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 animate-fade-in hover:shadow-lg transition-all border-l-4" style={{ borderLeftColor: COLORS[0] }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Total Products</p>
                <Package className="h-5 w-5" style={{ color: COLORS[0] }} />
              </div>
              <p className="text-3xl font-bold mb-1">{products.length}</p>
              <p className="text-xs text-muted-foreground">Active inventory</p>
            </Card>

            <Card className="p-6 animate-fade-in hover:shadow-lg transition-all border-l-4" style={{ borderLeftColor: COLORS[1] }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Pending Orders</p>
                <ShoppingCart className="h-5 w-5" style={{ color: COLORS[1] }} />
              </div>
              <p className="text-3xl font-bold mb-1">{pendingOrders}</p>
              <p className="text-xs text-muted-foreground">Awaiting processing</p>
            </Card>

            <Card className="p-6 animate-fade-in hover:shadow-lg transition-all border-l-4" style={{ borderLeftColor: COLORS[3] }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <DollarSign className="h-5 w-5" style={{ color: COLORS[3] }} />
              </div>
              <p className="text-3xl font-bold mb-1">R{totalRevenue.toFixed(2)}</p>
              <p className="text-xs" style={{ color: COLORS[3] }}>+12% since last month</p>
            </Card>

            <Card className="p-6 animate-fade-in hover:shadow-lg transition-all border-l-4" style={{ borderLeftColor: COLORS[4] }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <Users className="h-5 w-5" style={{ color: COLORS[4] }} />
              </div>
              <p className="text-3xl font-bold mb-1">{totalCustomers}</p>
              <p className="text-xs" style={{ color: COLORS[4] }}>+14% since last month</p>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Traffic Chart - Larger */}
            <Card className="p-6 animate-fade-in lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Traffic to Site</h2>
                <div className="flex gap-2">
                  <Button
                    variant={trafficPeriod === "day" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTrafficPeriod("day")}
                  >
                    Day
                  </Button>
                  <Button
                    variant={trafficPeriod === "week" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTrafficPeriod("week")}
                  >
                    Week
                  </Button>
                  <Button
                    variant={trafficPeriod === "month" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTrafficPeriod("month")}
                  >
                    Month
                  </Button>
                </div>
              </div>
              <ChartContainer
                config={{
                  orders: {
                    label: "Orders",
                    color: COLORS[0],
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficData}>
                    <defs>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="orders" stroke={COLORS[0]} fillOpacity={1} fill="url(#colorOrders)" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Card>

            {/* Device Stats Card */}
            <Card className="p-6 animate-fade-in">
              <h2 className="text-lg font-bold mb-6">Order Status</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Completed</span>
                    <span className="font-medium">{orders.filter(o => o.status === 'completed').length}</span>
                  </div>
                  <Progress value={(orders.filter(o => o.status === 'completed').length / orders.length) * 100} className="h-2" style={{ backgroundColor: 'hsl(var(--muted))' }} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Pending</span>
                    <span className="font-medium">{pendingOrders}</span>
                  </div>
                  <Progress value={(pendingOrders / orders.length) * 100} className="h-2" style={{ backgroundColor: 'hsl(var(--muted))' }} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Processing</span>
                    <span className="font-medium">{orders.filter(o => o.status === 'processing').length}</span>
                  </div>
                  <Progress value={(orders.filter(o => o.status === 'processing').length / orders.length) * 100} className="h-2" style={{ backgroundColor: 'hsl(var(--muted))' }} />
                </div>
              </div>
            </Card>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Top Products */}
            <Card className="p-6 animate-fade-in">
              <h2 className="text-lg font-bold mb-6">Top 3 Selling Products</h2>
              {topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${COLORS[index]}15` }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: COLORS[index] }}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.quantity} sold</p>
                        </div>
                      </div>
                      <p className="font-bold text-sm">R{product.revenue.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No sales data yet</p>
              )}
            </Card>

            {/* Top Customers */}
            <Card className="p-6 animate-fade-in">
              <h2 className="text-lg font-bold mb-6">Top 3 Customers</h2>
              {topCustomers.length > 0 ? (
                <div className="space-y-4">
                  {topCustomers.map((customer, index) => (
                    <div key={index} className="p-3 rounded-lg" style={{ backgroundColor: `${COLORS[index + 3]}15` }}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: COLORS[index + 3] }}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">{customer.orders} orders</p>
                        </div>
                      </div>
                      <p className="font-bold text-right">R{customer.value.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No customer data yet</p>
              )}
            </Card>

            {/* Goals */}
            <Card className="p-6 animate-fade-in">
              <div className="flex items-center gap-2 mb-6">
                <Target className="h-5 w-5" style={{ color: COLORS[2] }} />
                <h2 className="text-lg font-bold">Goals Progress</h2>
              </div>
              <div className="space-y-4">
                {goals.map((goal, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">{goal.name}</span>
                      <span className="text-muted-foreground">{Math.round((goal.current / goal.target) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(goal.current / goal.target) * 100} 
                      className="h-2"
                      style={{ 
                        backgroundColor: `${goal.color}20`,
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {goal.current.toFixed(0)} / {goal.target.toFixed(0)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Input
                  placeholder="Set new goal..."
                  value={activeGoal}
                  onChange={(e) => setActiveGoal(e.target.value)}
                  className="mb-2"
                />
                <Button size="sm" className="w-full" style={{ backgroundColor: COLORS[2] }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="products" className="animate-fade-in-up">
            <TabsList className="mb-6">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="add">Add Product</TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <Card className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-6">Product Management</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>R{Number(product.price).toFixed(2)}</TableCell>
                        <TableCell>{product.stock} units</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="mr-2">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-6">Order Management</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">#{order.id.substring(0, 8)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.profiles.full_name || "N/A"}</p>
                            <p className="text-xs text-muted-foreground">{order.profiles.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{order.phone || "N/A"}</TableCell>
                        <TableCell className="text-sm max-w-xs truncate">{order.address || "N/A"}</TableCell>
                        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="font-semibold">R{Number(order.total).toFixed(2)}</TableCell>
                        <TableCell>
                          <select 
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="px-3 py-1.5 rounded-md border border-border bg-background text-foreground text-sm font-medium hover:bg-muted transition-colors"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                          </select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="add">
              <Card className="p-6 max-w-2xl">
                <h2 className="text-xl font-bold text-foreground mb-6">Add New Product</h2>
                <form onSubmit={handleAddProduct} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="product-name">Product Name</Label>
                    <Input
                      id="product-name"
                      name="product-name"
                      placeholder="e.g., Premium Pork Shoulder"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="product-price">Price (R)</Label>
                      <Input
                        id="product-price"
                        name="product-price"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="product-stock">Stock</Label>
                      <Input
                        id="product-stock"
                        name="product-stock"
                        type="number"
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-description">Description</Label>
                    <Input
                      id="product-description"
                      name="product-description"
                      placeholder="Product description"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-image">Product Image</Label>
                    <Input
                      id="product-image"
                      name="product-image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload a product image (max 5MB, JPG/PNG/WEBP)
                    </p>
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
