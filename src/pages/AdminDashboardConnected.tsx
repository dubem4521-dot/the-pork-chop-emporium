import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { toast } from "sonner";
import { Package, ShoppingCart, DollarSign, Plus, Edit, Trash2, LogOut, TrendingUp, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

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
    await Promise.all([loadProducts(), loadOrders()]);
    setLoading(false);
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
  const topCustomers = getTopCustomers();
  
  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', '#10b981', '#f59e0b'];

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 animate-fade-in hover:shadow-[var(--shadow-card)] transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold text-foreground">{products.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 animate-fade-in hover:shadow-[var(--shadow-card)] transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-accent/10">
                <ShoppingCart className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold text-foreground">{pendingOrders}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 animate-fade-in hover:shadow-[var(--shadow-card)] transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">R{totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Traffic Overview</h2>
              </div>
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
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>

          <Card className="p-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-6">
              <Users className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-bold text-foreground">Top Customers</h2>
            </div>
            {topCustomers.length > 0 ? (
              <>
                <ChartContainer
                  config={{
                    value: {
                      label: "Total Spent",
                      color: "hsl(var(--primary))",
                    },
                  }}
                  className="h-[200px] mb-4"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topCustomers}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="hsl(var(--primary))"
                        dataKey="value"
                      >
                        {topCustomers.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="space-y-3">
                  {topCustomers.map((customer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="font-medium text-sm">{customer.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">R{customer.value.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{customer.orders} orders</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-8">No customer data yet</p>
            )}
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
  );
};

export default AdminDashboard;
