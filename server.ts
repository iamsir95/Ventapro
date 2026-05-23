import express from "express";
import { createServer as createViteServer } from "vite";
import { ProductService } from "./src/server/productService";
import { OrderService } from "./src/server/orderService";
import { PaymentService } from "./src/server/paymentService";
import { UserService } from "./src/server/userService";
import { AnalyticsService } from "./src/server/analyticsService";
import { ExpressAuth, getSession } from "@auth/express";
import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import Credentials from "@auth/core/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcrypt";
import path from "path";

const ADMIN_EMAIL = "admin@pro-gaming.com";

// Initialize Prisma
const prisma = new PrismaClient();

// Ensure Auth.js knows the correct host when behind a proxy
if (process.env.APP_URL) {
  process.env.AUTH_URL = process.env.APP_URL + "/api/auth";
}

async function startServer() {
  // Seed default admin user
  try {
    const adminEmail = "admin@pro-gaming.com";
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const hashed = await bcrypt.hash("admin123", 10);
      await prisma.user.create({
        data: { email: adminEmail, password: hashed, name: "System Admin", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" }
      });
      console.log("Default admin seeded: admin@pro-gaming.com");
    }

    const defaultCategory = await prisma.category.findUnique({ where: { id: "1" } });
    if (!defaultCategory) {
      await prisma.category.create({
        data: { id: "1", name: "General Gear" }
      });
      console.log("Default category seeded");
    }
  } catch (err) {
    console.error("Failed to seed admin user:", err);
  }

  const app = express();
  const PORT = 3000;

  // Essential for cookies to work properly behind proxies (like AI Studio's preview)
  app.set("trust proxy", true);
  app.use(express.json());

  const useSecureCookies = true;
  const cookiePrefix = useSecureCookies ? "__Secure-" : "";

  // Define Auth.js Options
  const authConfig: any = {
    adapter: PrismaAdapter(prisma),
    session: { 
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    useSecureCookies,
    cookies: {
      sessionToken: {
        name: `${cookiePrefix}authjs.session-token`,
        options: { httpOnly: true, sameSite: "none", path: "/", secure: true },
      },
      callbackUrl: {
        name: `${cookiePrefix}authjs.callback-url`,
        options: { sameSite: "none", path: "/", secure: true },
      },
      csrfToken: {
        name: `${cookiePrefix}authjs.csrf-token`,
        options: { httpOnly: true, sameSite: "none", path: "/", secure: true },
      },
      pkceCodeVerifier: {
        name: `${cookiePrefix}authjs.pkce.code_verifier`,
        options: { httpOnly: true, sameSite: "none", path: "/", secure: true },
      },
      state: {
        name: `${cookiePrefix}authjs.state`,
        options: { httpOnly: true, sameSite: "none", path: "/", secure: true },
      },
      nonce: {
        name: `${cookiePrefix}authjs.nonce`,
        options: { httpOnly: true, sameSite: "none", path: "/", secure: true },
      },
    },
    trustHost: true,
    providers: [
      GitHub({
        clientId: process.env.GITHUB_ID || "mock_github_id",
        clientSecret: process.env.GITHUB_SECRET || "mock_github_secret",
      }),
      Google({
        clientId: process.env.GOOGLE_ID || "mock_google_id",
        clientSecret: process.env.GOOGLE_SECRET || "mock_google_secret",
      }),
      Credentials({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials: any) {
          if (!credentials?.email || !credentials?.password) return null;
          try {
            const user = await prisma.user.findUnique({
               where: { email: credentials.email as string }
            });
            if (!user || !user.password) return null;
            const isValid = await bcrypt.compare(credentials.password, user.password);
            if (!isValid) return null;
            
            // Return user object fulfilling the Auth.js expected signature
            return { id: user.id, name: user.name, email: user.email, image: user.image };
          } catch (error) {
            console.error("Authorize error:", error);
            return null;
          }
        }
      })
    ],
    secret: process.env.AUTH_SECRET || "fallback_secret_for_dev_environment_only",
  };

  // Admin auth middleware: validates the Auth.js session and admin email
  const requireAdmin = async (req: any, res: any, next: any) => {
    try {
      const session = await getSession(req, authConfig);
      if (!session?.user || session.user.email !== ADMIN_EMAIL) {
        return res.status(403).json({ error: "Forbidden: admin only" });
      }
      req.session = session;
      next();
    } catch (err: any) {
      console.error("requireAdmin error:", err);
      res.status(500).json({ error: "Auth check failed" });
    }
  };

  // --- Product API Routes ---
  app.get("/api/products/search", async (req, res) => {
    try {
      const q = req.query.q as string || "";
      const page = parseInt(req.query.page as string || "1");
      const limit = parseInt(req.query.limit as string || "10");

      const results = await ProductService.searchProducts(q, page, limit);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const page = parseInt((req.query.page as string) || "1");
      const limit = parseInt((req.query.limit as string) || "20");
      const results = await ProductService.listProducts(page, limit);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await ProductService.getProductById(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/products", requireAdmin, async (req, res) => {
    try {
      const newProduct = await ProductService.createProduct(req.body);
      res.json(newProduct);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await ProductService.updateProduct(req.params.id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      await ProductService.deleteProduct(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Admin: Orders ---
  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const page = parseInt((req.query.page as string) || "1");
      const limit = parseInt((req.query.limit as string) || "20");
      const status = req.query.status as string | undefined;
      const results = await OrderService.listOrders(page, limit, status);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/orders/:id", requireAdmin, async (req, res) => {
    try {
      const order = await OrderService.getOrderById(req.params.id);
      if (!order) return res.status(404).json({ error: "Order not found" });
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const updated = await OrderService.updateOrderStatus(req.params.id, status);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // --- Admin: Users ---
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const page = parseInt((req.query.page as string) || "1");
      const limit = parseInt((req.query.limit as string) || "20");
      const search = req.query.search as string | undefined;
      const results = await UserService.listUsers(page, limit, search);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const user = await UserService.getUserById(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Admin: Analytics ---
  app.get("/api/admin/analytics", requireAdmin, async (_req, res) => {
    try {
      const data = await AnalyticsService.getDashboard();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Order & Payment API Routes ---
  app.post("/api/orders/checkout", async (req, res) => {
    try {
      const { userId, items, paymentMethod } = req.body;
      
      if (!userId || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Missing userId or items array." });
      }

      const order = await OrderService.checkout(userId, items);
      
      let paymentUrl = "";
      if (paymentMethod === "VNPAY") {
         paymentUrl = PaymentService.createVNPayUrl(req, order.id, Number(order.totalAmount), "Thanh toan don hang Venta");
      } else if (paymentMethod === "MOMO") {
         const momoPayload = await PaymentService.createMoMoRequest(order.id, Number(order.totalAmount), "Thanh toan don hang Venta");
         const momoRes = await fetch(process.env.MOMO_API_URL || 'https://test-payment.momo.vn/v2/gateway/api/create', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(momoPayload)
         });
         const momoResult = await momoRes.json();
         paymentUrl = momoResult.payUrl || "";
      }

      res.json({
        success: true,
        message: "Đặt hàng thành công",
        order,
        paymentUrl
      });
    } catch (error: any) {
      console.error("Lỗi quá trình thanh toán:", error);
      res.status(400).json({ success: false, error: error.message });
    }
  });

  app.get("/api/orders/vnpay_return", async (req, res) => {
      const result = PaymentService.verifyVNPayIPN(req.query);
      if (result.success && result.orderId) {
          try { await OrderService.updateOrderStatus(result.orderId, "COMPLETED"); } catch {}
          res.redirect("/orders/success?orderId=" + result.orderId);
      } else {
          res.redirect("/orders/failed");
      }
  });

  app.post("/api/orders/momo_ipn", async (req, res) => {
      const result = PaymentService.verifyMoMoIPN(req.body);
      if (result.success && result.orderId) {
          try { await OrderService.updateOrderStatus(result.orderId, "COMPLETED"); } catch {}
          res.status(200).json({ message: "Received IPN success."});
      } else {
          res.status(400).json({ message: "Invalid IPN setup."});
      }
  });

  // --- Custom Registration & Password Reset Endpoints ---
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || email.split('@')[0],
        }
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const { email } = req.body;
    console.log(`Password reset requested for: ${email}`);
    res.json({ success: true, message: "If this email is registered, a password reset link has been sent." });
  });

  // Mount Auth.js Catch-all Route AFTER custom routes
  app.use("/api/auth/*", ExpressAuth(authConfig));

  // Vite middleware for development routing
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
