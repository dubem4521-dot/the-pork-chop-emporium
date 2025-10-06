import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Package, ShoppingCart, DollarSign, Plus, Edit, Trash2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";

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
  profiles: {
    email: string;
    full_name: string | null;
    phone: string | null;
    address: string | null;
  };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
    // First get orders
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (ordersError) {
      toast.error("Failed to load orders");
      console.error(ordersError);
      return;
    }

    // Then get profiles for each order
    const ordersWithProfiles = await Promise.all(
      (ordersData || []).map(async (order) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name, phone, address")
          .eq("id", order.user_id)
          .single();

        return {
          ...order,
          profiles: profile || { email: "N/A", full_name: null, phone: null, address: null }
        };
      })
    );

    setOrders(ordersWithProfiles as Order[]);
  };

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
  const pendingOrders = orders.filter(o => o.status === "pending").length;

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
                      <TableCell className="text-sm">{order.profiles.phone || "N/A"}</TableCell>
                      <TableCell className="text-sm max-w-xs truncate">{order.profiles.address || "N/A"}</TableCell>
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
