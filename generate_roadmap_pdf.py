from fpdf import FPDF

class RoadmapPDF(FPDF):
    def header(self):
        self.set_font('Helvetica', 'B', 9)
        self.cell(0, 5, 'MediFlow SaaS Backend Roadmap - Java Spring Boot + PostgreSQL', new_x="LMARGIN", new_y="NEXT", align='C')
        self.line(10, 12, 200, 12)
        self.ln(5)
    
    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}/{{nb}}', new_x="RIGHT", new_y="TOP", align='C')

pdf = RoadmapPDF()
pdf.alias_nb_pages()
pdf.set_auto_page_break(auto=True, margin=15)
pdf.add_page()

# Title
pdf.set_font('Helvetica', 'B', 16)
pdf.cell(0, 10, 'MediFlow SaaS Backend Roadmap', new_x="LMARGIN", new_y="NEXT", align='C')
pdf.set_font('Helvetica', '', 11)
pdf.cell(0, 6, 'Java Spring Boot 3.x + PostgreSQL 15+', new_x="LMARGIN", new_y="NEXT", align='C')
pdf.cell(0, 6, 'Target: Pharmacy Management SaaS Platform', new_x="LMARGIN", new_y="NEXT", align='C')
pdf.ln(8)

# 1. System Overview & Roles
pdf.set_font('Helvetica', 'B', 13)
pdf.cell(0, 7, '1. System Overview & Roles', new_x="LMARGIN", new_y="NEXT", align='L')
pdf.set_font('Helvetica', '', 10)
roles = [
    ("Super Admin", "Top-level administrator overseeing all tenants. Full system access, user management, subscription control, cross-tenant analytics."),
    ("Retail User", "Pharmacy owner/manager. Manage own pharmacy, employees, inventory, sales, tier-dependent analytics and marketplace access."),
    ("Wholesale User", "Supplier/distributor. Product catalog management, requisition handling, inventory allocation."),
    ("Employee", "Staff member. Limited pharmacy operations within assigned pharmacy.")
]
for role, desc in roles:
    pdf.set_font('Helvetica', 'B', 10)
    pdf.cell(25, 6, role, new_x="RIGHT", new_y="TOP")
    pdf.set_font('Helvetica', '', 10)
    pdf.multi_cell(0, 6, desc)
    pdf.ln(2)
pdf.ln(3)

# 2. Subscription Tiers
pdf.set_font('Helvetica', 'B', 13)
pdf.cell(0, 7, '2. Subscription Tiers (per pharmacy per month)', new_x="LMARGIN", new_y="NEXT", align='L')
pdf.set_font('Helvetica', '', 9)

# Retail tiers table header
pdf.set_fill_color(40, 40, 40)
pdf.set_text_color(255, 255, 255)
pdf.set_font('Helvetica', 'B', 8)
cols = [('Tier', 30), ('Price (TSH)', 25), ('Pharmacies', 25), ('Employees', 25), ('Analytics', 20), ('Suppliers', 20), ('Marketplace', 20)]
for (hdr, w) in cols:
    pdf.cell(w, 6, hdr, border=1, align='C', fill=True)
pdf.ln()
pdf.set_text_color(0, 0, 0)
pdf.set_font('Helvetica', '', 7.5)

retail = [
    ("Basic", "30,000", "1", "1", "No", "No", "No"),
    ("Professional", "45,000", "2", "3 per ph.", "Yes", "Yes", "Yes"),
    ("Enterprise", "60,000", "Unlimited", "Unlimited", "Yes+", "Yes+", "Yes+")
]
for row in retail:
    for (val, (_, w)) in zip(row, cols):
        pdf.cell(w, 5.5, val, border=1, align='C')
    pdf.ln()
pdf.ln(3)

# Wholesale tiers (suggested)
pdf.set_font('Helvetica', 'B', 9)
pdf.cell(0, 6, 'Suggested Wholesale Tiers (per month)', new_x="LMARGIN", new_y="NEXT", align='L')
pdf.set_font('Helvetica', '', 8)
cols2 = [('Tier', 25), ('Price (TSH)', 25), ('Product Listings', 30), ('Active Requests', 30), ('Support', 35)]
for (hdr, w) in cols2:
    pdf.cell(w, 6, hdr, border=1, align='C', fill=True)
pdf.ln()
pdf.set_font('Helvetica', '', 7.5)
wholesale = [
    ("Starter", "20,000", "up to 50", "5 concurrent", "Email"),
    ("Growth", "40,000", "up to 200", "20 concurrent", "Priority email"),
    ("Premium", "80,000", "unlimited", "unlimited", "Phone + 24h SLA")
]
for row in wholesale:
    for (val, (_, w)) in zip(row, cols2):
        pdf.cell(w, 5.5, val, border=1, align='C')
    pdf.ln()
pdf.ln(3)

# 3. Database Design
pdf.set_font('Helvetica', 'B', 13)
pdf.cell(0, 7, '3. Core Database Design (PostgreSQL)', new_x="LMARGIN", new_y="NEXT", align='L')
pdf.ln(2)

tables = [
    ("tenants", "id UUID PK, name, subdomain VARCHAR UNIQUE, status, timestamps"),
    ("pharmacies", "id UUID PK, tenant_id FK, name, address, phone, tier, status, timestamps"),
    ("users", "id UUID PK, email UNIQUE NOT NULL, password_hash, role, is_active, last_login, timestamps"),
    ("subscriptions", "id UUID PK, pharmacy_id FK, tier, price_cents, status, billing_period, period_start/end, cancel_at_period_end, timestamps"),
    ("payments", "id UUID PK, subscription_id FK, gateway_payment_id, amount_cents, status, gateway, payment_method, timestamps")
]
for (tbl, desc) in tables:
    pdf.set_font('Helvetica', 'B', 9)
    pdf.cell(0, 5.5, tbl, new_x="LMARGIN", new_y="NEXT")
    pdf.set_font('Helvetica', '', 8)
    pdf.multi_cell(0, 5, desc)
    pdf.ln(1)
pdf.ln(3)

# 4. Authentication & Security
pdf.set_font('Helvetica', 'B', 13)
pdf.cell(0, 7, '4. Authentication & Security', new_x="LMARGIN", new_y="NEXT", align='L')
pdf.ln(2)

sec_items = [
    ("JWT-Based Authentication", "Login returns signed JWT with claims: {sub, role, pharmacyId, tier, exp}. Refresh endpoint issues new access tokens."),
    ("Spring Security Config", "Stateless session, permitAll on /auth/** and webhooks, authenticated on other endpoints, JWT authentication converter for role claims."),
    ("Password Policy", "Minimum 8 chars with uppercase, lowercase, number, special. Bcrypt cost factor 12."),
    ("Rate Limiting", "Sliding window per IP/endpoint via Redis. Configurable thresholds per tier."),
    ("Secure Headers", "HSTS, X-Content-Type-Options, X-Frame-Options enabled via Spring Security.")
]
for title, desc in sec_items:
    pdf.set_font('Helvetica', 'B', 10)
    pdf.cell(30, 6, title, new_x="RIGHT", new_y="TOP")
    pdf.set_font('Helvetica', '', 10)
    pdf.multi_cell(0, 6, desc)
    pdf.ln(2)
pdf.ln(3)

# 5. API Design
pdf.set_font('Helvetica', 'B', 13)
pdf.cell(0, 7, '5. API Design (REST) - Base Path: /api/v1/', new_x="LMARGIN", new_y="NEXT", align='L')
pdf.ln(2)

api_sections = [
    ("Authentication", "/auth/login, /auth/register, /auth/refresh-token, /auth/request-password-reset, /auth/reset-password"),
    ("Pharmacy Management", "/pharmacies - list/create/update/own pharmacy"),
    ("Users & Employees", "/users - list/create/invite/update roles/revoke access"),
    ("Subscriptions", "/subscriptions/current, /subscriptions/upgrade, /subscriptions/cancel, /subscriptions/history"),
    ("Payments (Skeleton)", "/payments/initialize, /payments/status/{id}, /payments/webhook/{gateway} - gateway-agnostic"),
    ("Analytics", "/analytics/kpis, /analytics/revenue, /analytics/employees, /analytics/marketplace"),
    ("Marketplace", "/marketplace/products, /marketplace/requests, /marketplace/requests/{id}, /suppliers"),
    ("Wholesale Operations", "/wholesale/products, /wholesale/orders, /wholesale/orders/{id}/status")
]
for (title, desc) in api_sections:
    pdf.set_font('Helvetica', 'B', 10)
    pdf.cell(30, 6, title, new_x="RIGHT", new_y="TOP")
    pdf.set_font('Helvetica', '', 10)
    pdf.multi_cell(0, 6, desc)
    pdf.ln(2)
pdf.ln(3)

# 6. Caching Strategy
pdf.set_font('Helvetica', 'B', 13)
pdf.cell(0, 7, '6. Caching Strategy (Redis)', new_x="LMARGIN", new_y="NEXT", align='L')
pdf.ln(2)

cache_items = [
    ("tenant:{id}:subscription", "1 hour", "Subscription validation (expensive check)"),
    ("analytics:{pharmacyId}:kpis", "5 minutes", "Pre-computed KPIs"),
    ("product:catalog:{tenant}", "10 minutes", "Marketplace product list"),
    ("api:rate-limit:{ip}", "1 minute", "Request throttling"),
    ("auth:session:{token}", "until expiry", "Session revocation")
]
for (key, ttl, purpose) in cache_items:
    pdf.set_font('Helvetica', 'B', 9)
    pdf.cell(60, 5.5, key, new_x="RIGHT", new_y="TOP")
    pdf.set_font('Helvetica', '', 9)
    pdf.cell(25, 5.5, ttl, align='C', new_x="RIGHT", new_y="TOP")
    pdf.set_font('Helvetica', '', 9)
    pdf.cell(0, 5.5, purpose, new_x="LMARGIN", new_y="NEXT", align='L')
pdf.ln(3)

# 7. Payment Provider Skeleton
pdf.set_font('Helvetica', 'B', 13)
pdf.cell(0, 7, '7. Payment Provider Skeleton (Gateway-Agnostic)', new_x="LMARGIN", new_y="NEXT", align='L')
pdf.ln(2)

pdf.set_font('Helvetica', 'I', 9)
pdf.multi_cell(0, 5, "Abstract PaymentService interface with initializePayment(), checkStatus(), handleWebhook(). Implementations: Stripe, SSLCommerz, Razorpay. Gateway selected via spring.profiles.active. All responses mapped to common PaymentStatus enum.")
pdf.ln(3)

# 8. Files & Project Structure
pdf.set_font('Helvetica', 'B', 13)
pdf.cell(0, 7, '8. Files & Project Structure', new_x="LMARGIN", new_y="NEXT", align='L')
pdf.ln(2)

pdf.set_font('Helvetica', '', 8)
struct = [
    ("src/main/java/com/mediflow/config/", "Spring config: Security, Swagger, Cache"),
    ("src/main/java/com/mediflow/model/", "JPA entities (Tenants, Pharmacies, Users, Subscriptions, Products, Suppliers, Employees, Payments)"),
    ("src/main/java/com/mediflow/dto/", "Request/Response DTOs for all API endpoints"),
    ("src/main/java/com/mediflow/repository/", "Spring Data JPA repositories"),
    ("src/main/java/com/mediflow/service/", "Business logic services (subscription, payment, analytics)"),
    ("src/main/java/com/mediflow/security/", "JWT auth, authentication filters, security config"),
    ("src/main/java/com/mediflow/util/", "Helpers, validators, date/time utilities"),
    ("src/main/java/com/mediflow/payment/", "Payment service implementations (Stripe, pluggable gateway)"),
    ("src/main/resources/application.yml", "Configuration: DB, Redis, Mail, JWT, cache TTL, payment gateway settings"),
    ("src/main/resources/data.sql", "Initial seed data, default tenants, subscription tiers"),
    ("src/main/resources/migration/*.sql", "Flyway migration scripts for versioned schema evolution"),
    ("pom.xml", "Maven dependencies: Spring Boot 3.x, Spring Security, Spring Data JPA, PostgreSQL, Redis, Stripe Java, MapStruct, Validation, Actuator, Flyway, Swagger"),
    ("Dockerfile", "Multi-stage build: Java 17 runtime, OpenJDK, optimized jar"),
    ("docker-compose.yml", "PostgreSQL 15, Redis 7, app service with health checks"),
    (".env.example", "Variables: POSTGRES_USER/PASSWORD, POSTGRES_DB, JWT_SECRET, STRIPE_API_KEY, SSLCOMMERZ_*, REDIS_URL, MAIL_*"),
    ("mvnw/gradlew", "Wrapper for Maven/Gradle builds")
]
for (path, desc) in struct:
    pdf.set_font('Helvetica', '', 7.5)
    pdf.cell(55, 4.5, path, new_x="RIGHT", new_y="TOP")
    pdf.set_font('Helvetica', '', 7.5)
    pdf.multi_cell(0, 4.5, desc)
    pdf.ln(1)
pdf.ln(3)

# 9. Roadmap / Implementation Phases
pdf.set_font('Helvetica', 'B', 13)
pdf.cell(0, 7, '9. Roadmap / Implementation Phases', new_x="LMARGIN", new_y="NEXT", align='L')
pdf.ln(2)

phases = [
    ("Phase 1: Foundation (Weeks 1-4)", "Project setup (Java 17, Spring Boot 3.2, Maven), PostgreSQL schema + Flyway, Spring Security + JWT auth, basic user/pharmacy CRUD, user role management (Super Admin, Retail, Wholesale, Employee), Docker + Docker-compose."),
    ("Phase 2: Subscription & Billing (Weeks 5-6)", "Subscription tier model (Basic/Professional/Enterprise), payment integration skeleton (Stripe + pluggable gateway), webhook handling, proration logic for upgrades/downgrades, cancel-at-any-time logic."),
    ("Phase 3: Core Features (Weeks 7-10)", "Pharmacy management (create/edit/delete), employee management per pharmacy, product & inventory management, supplier directory, basic analytics data model."),
    ("Phase 4: Advanced Features (Weeks 11-14)", "Marketplace product listing & requests, revenue/profit analytics with chart data, employee performance metrics, subscription limit enforcement per tier, rate limiting & abuse protection."),
    ("Phase 5: Polish & Scale (Weeks 15-16)", "Redis caching layer, API documentation (OpenAPI 3/Swagger), comprehensive test suite (integration + unit), performance optimization, monitoring & health checks, deploy to production (Fly.io/Render/VPS)."),
    ("Phase 6: Wholesale & Multi-Tenant (Weeks 17-20)", "Wholesale tier structure, cross-tenant isolation verification, Super Admin dashboard, multi-pharmacy management (Enterprise tier), final security audit.")
]
for (title, desc) in phases:
    pdf.set_font('Helvetica', 'B', 9)
    pdf.cell(0, 5.5, title, new_x="LMARGIN", new_y="NEXT")
    pdf.set_font('Helvetica', '', 8.5)
    pdf.multi_cell(0, 5, desc)
    pdf.ln(2)
pdf.ln(3)

# 10. Security Checklist
pdf.set_font('Helvetica', 'B', 13)
pdf.cell(0, 7, '10. Security Checklist', new_x="LMARGIN", new_y="NEXT", align='L')
pdf.ln(2)

security_items = [
    "HTTPS everywhere (TLS 1.3)",
    "JWT tokens short-lived + refresh token rotation",
    "Passwords bcrypt, never stored in plain text",
    "SQL injection prevention (JPA parameters)",
    "XSS protection via Spring Security headers",
    "CSRF disabled for API (stateless)",
    "Rate limiting per IP/tenant",
    "Input validation on all DTOs (Jakarta Validation)",
    "Secure headers: HSTS, X-Content-Type-Options, X-Frame-Options",
    "GDPR/Privacy data handling (data export/deletion)",
    "Audit logging for critical operations"
]
for item in security_items:
    pdf.set_font('Helvetica', '', 9)
    pdf.cell(5, 5.5, "-", new_x="RIGHT", new_y="TOP")
    pdf.multi_cell(0, 5.5, f"  {item}")
    pdf.ln(0.5)
pdf.ln(3)

# 11. Monitoring & Observability
pdf.set_font('Helvetica', 'B', 13)
pdf.cell(0, 7, '11. Monitoring & Observability', new_x="LMARGIN", new_y="NEXT", align='L')
pdf.ln(2)

monitor_items = [
    ("Health Endpoints", "/actuator/health, custom checks (DB, Redis, Stripe connectivity)"),
    ("Metrics", "/actuator/prometheus - request latency, error rates, cache hit ratio"),
    ("Logging", "Structured JSON logs (Logback), correlation IDs for request tracing"),
    ("Alerting", "Error rate > 1% triggers Slack/email alert"),
    ("Backup", "Daily PostgreSQL snapshots, point-in-time recovery configured")
]
for (title, desc) in monitor_items:
    pdf.set_font('Helvetica', 'B', 9)
    pdf.cell(35, 5.5, title, new_x="RIGHT", new_y="TOP")
    pdf.set_font('Helvetica', '', 9)
    pdf.multi_cell(0, 5.5, desc)
    pdf.ln(2)
pdf.ln(3)

# 12. Dependencies
pdf.set_font('Helvetica', 'B', 13)
pdf.cell(0, 7, '12. Key Maven Dependencies (pom.xml snippet)', new_x="LMARGIN", new_y="NEXT", align='L')
pdf.ln(2)

deps = [
    "spring-boot-starter, spring-boot-starter-web",
    "spring-boot-starter-security, java-jwt (auth)",
    "spring-boot-starter-data-jpa, postgresql driver",
    "spring-boot-starter-data-redis (cache)",
    "stripe-java (payments)",
    "mapstruct, jakarta.validation-api",
    "spring-boot-starter-actuator (monitoring)",
    "springfox-swagger2 (API docs)",
    "spring-boot-starter-test (testing)",
    "flyway-core (DB migrations)"
]
for d in deps:
    pdf.set_font('Helvetica', '', 8)
    pdf.cell(0, 5, "- " + d, new_x="LMARGIN", new_y="NEXT")
pdf.ln(3)

# 13. Production Checklist
pdf.set_font('Helvetica', 'B', 13)
pdf.cell(0, 7, '13. Production Checklist', new_x="LMARGIN", new_y="NEXT", align='L')
pdf.ln(2)

prod_items = [
    "Domain SSL certificate configured",
    "Environment variables secured (no secrets in code)",
    "Database backups automated",
    "Monitoring dashboards operational",
    "CI/CD pipeline (GitHub Actions or GitLab CI)",
    "Disaster recovery plan documented",
    "SLA defined for payment webhook responses (< 5 seconds)",
    "Feature flags for gradual rollout of new tiers",
    "Documentation for onboarding new developers"
]
for item in prod_items:
    pdf.set_font('Helvetica', '', 9)
    pdf.cell(5, 5.5, "-", new_x="RIGHT", new_y="TOP")
    pdf.multi_cell(0, 5.5, f"  {item}")
    pdf.ln(0.5)
pdf.ln(3)

# Output
output_path = "MediFlow_SaaS_Backend_Roadmap.pdf"
pdf.output(output_path)
print(f"PDF generated successfully: {output_path}")