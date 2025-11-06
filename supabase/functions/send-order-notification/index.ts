import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "https://esm.sh/resend@4.0.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderNotificationRequest {
  orderId: string;
  customerEmail: string;
  orderDetails: {
    items: Array<{ name: string; quantity: number; price: number }>;
    total: number;
    phone: string;
    address: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, customerEmail, orderDetails }: OrderNotificationRequest = await req.json();

    console.log("Processing order notification for order:", orderId);

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get all admin emails
    const { data: adminRoles, error: adminError } = await supabaseClient
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (adminError) {
      console.error("Error fetching admin roles:", adminError);
      throw new Error("Failed to fetch admin emails");
    }

    const adminUserIds = adminRoles.map((role) => role.user_id);
    
    // Get admin user details
    const { data: { users: adminUsers }, error: usersError } = await supabaseClient.auth.admin.listUsers();
    
    if (usersError) {
      console.error("Error fetching admin users:", usersError);
      throw new Error("Failed to fetch admin user details");
    }

    const adminEmails = adminUsers
      .filter((user) => adminUserIds.includes(user.id))
      .map((user) => user.email)
      .filter((email): email is string => email !== undefined);

    console.log("Found admin emails:", adminEmails.length);

    // Create email HTML
    const itemsHtml = orderDetails.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">R${item.price.toFixed(2)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">R${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `
      )
      .join("");

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8B4513; text-align: center;">PureBreed Pork - Order Confirmation</h1>
        <p>Order ID: <strong>${orderId}</strong></p>
        <h2 style="color: #8B4513;">Order Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Quantity</th>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Price</th>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <p style="font-size: 18px; font-weight: bold; margin-top: 20px;">Total: R${orderDetails.total.toFixed(2)}</p>
        <h2 style="color: #8B4513;">Delivery Information</h2>
        <p><strong>Phone:</strong> ${orderDetails.phone}</p>
        <p><strong>Address:</strong> ${orderDetails.address}</p>
        <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
          This is an automated notification from PureBreed Pork. Please do not reply to this email.
        </p>
      </div>
    `;

    // Send email to customer
    const customerEmailPromise = resend.emails.send({
      from: "PureBreed Pork <onboarding@resend.dev>",
      to: [customerEmail],
      subject: `Order Confirmation - ${orderId}`,
      html: emailHtml,
    });

    // Send emails to all admins
    const adminEmailPromises = adminEmails.map((adminEmail) =>
      resend.emails.send({
        from: "PureBreed Pork <onboarding@resend.dev>",
        to: [adminEmail],
        subject: `New Order Received - ${orderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8B4513; text-align: center;">New Order Notification</h1>
            <p><strong>Customer Email:</strong> ${customerEmail}</p>
            ${emailHtml}
          </div>
        `,
      })
    );

    // Wait for all emails to be sent
    await Promise.all([customerEmailPromise, ...adminEmailPromises]);

    console.log("All order notification emails sent successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Order notifications sent" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-order-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
