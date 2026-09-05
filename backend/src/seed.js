import "dotenv/config";
import mongoose from "mongoose";
import { connectDb } from "./config/db.js";
import User from "./models/User.js";
import Role from "./models/Role.js";
import Permission from "./models/Permission.js";
import Lead from "./models/Lead.js";
import Customer from "./models/Customer.js";
import Deal from "./models/Deal.js";
import Activity from "./models/Activity.js";
import TimelineEvent from "./models/TimelineEvent.js";
import Notification from "./models/Notification.js";
import { addTimeline } from "./services/events.js";

async function seed() {
  await connectDb();
  await Promise.all([
    User.deleteMany({}),
    Role.deleteMany({}),
    Permission.deleteMany({}),
    Lead.deleteMany({}),
    Customer.deleteMany({}),
    Deal.deleteMany({}),
    Activity.deleteMany({}),
    TimelineEvent.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  // Create dynamic permissions
  const permissions = await Permission.insertMany([
    // User Management Permissions
    { name: "view_users", displayName: "View Users", description: "Can view user list", category: "user", action: "view", resource: "users", isSystem: true },
    { name: "add_users", displayName: "Add Users", description: "Can create new users", category: "user", action: "add", resource: "users", isSystem: true },
    { name: "edit_users", displayName: "Edit Users", description: "Can edit user information", category: "user", action: "edit", resource: "users", isSystem: true },
    { name: "delete_users", displayName: "Delete Users", description: "Can delete users", category: "user", action: "delete", resource: "users", isSystem: true },
    { name: "list_users", displayName: "List Users", description: "Can access user list page", category: "user", action: "list", resource: "users", isSystem: true },
    
    // Lead Management Permissions
    { name: "view_leads", displayName: "View Leads", description: "Can view lead details", category: "lead", action: "view", resource: "leads", isSystem: true },
    { name: "add_leads", displayName: "Add Leads", description: "Can create new leads", category: "lead", action: "add", resource: "leads", isSystem: true },
    { name: "edit_leads", displayName: "Edit Leads", description: "Can edit lead information", category: "lead", action: "edit", resource: "leads", isSystem: true },
    { name: "delete_leads", displayName: "Delete Leads", description: "Can delete leads", category: "lead", action: "delete", resource: "leads", isSystem: true },
    { name: "list_leads", displayName: "List Leads", description: "Can access lead list page", category: "lead", action: "list", resource: "leads", isSystem: true },
    { name: "convert_leads", displayName: "Convert Leads", description: "Can convert leads to customers", category: "lead", action: "edit", resource: "leads", isSystem: true },
    { name: "assign_leads", displayName: "Assign Leads", description: "Can assign leads to users", category: "lead", action: "edit", resource: "leads", isSystem: true },
    
    // Customer Management Permissions
    { name: "view_customers", displayName: "View Customers", description: "Can view customer details", category: "customer", action: "view", resource: "customers", isSystem: true },
    { name: "add_customers", displayName: "Add Customers", description: "Can create new customers", category: "customer", action: "add", resource: "customers", isSystem: true },
    { name: "edit_customers", displayName: "Edit Customers", description: "Can edit customer information", category: "customer", action: "edit", resource: "customers", isSystem: true },
    { name: "delete_customers", displayName: "Delete Customers", description: "Can delete customers", category: "customer", action: "delete", resource: "customers", isSystem: true },
    { name: "list_customers", displayName: "List Customers", description: "Can access customer list page", category: "customer", action: "list", resource: "customers", isSystem: true },
    
    // Deal Management Permissions
    { name: "view_deals", displayName: "View Deals", description: "Can view deal details", category: "deal", action: "view", resource: "deals", isSystem: true },
    { name: "add_deals", displayName: "Add Deals", description: "Can create new deals", category: "deal", action: "add", resource: "deals", isSystem: true },
    { name: "edit_deals", displayName: "Edit Deals", description: "Can edit deal information", category: "deal", action: "edit", resource: "deals", isSystem: true },
    { name: "delete_deals", displayName: "Delete Deals", description: "Can delete deals", category: "deal", action: "delete", resource: "deals", isSystem: true },
    { name: "list_deals", displayName: "List Deals", description: "Can access deal list page", category: "deal", action: "list", resource: "deals", isSystem: true },
    { name: "move_deals", displayName: "Move Deals", description: "Can move deals between stages", category: "deal", action: "edit", resource: "deals", isSystem: true },
    
    // Activity Management Permissions
    { name: "view_activities", displayName: "View Activities", description: "Can view activity details", category: "activity", action: "view", resource: "activities", isSystem: true },
    { name: "add_activities", displayName: "Add Activities", description: "Can create new activities", category: "activity", action: "add", resource: "activities", isSystem: true },
    { name: "edit_activities", displayName: "Edit Activities", description: "Can edit activity information", category: "activity", action: "edit", resource: "activities", isSystem: true },
    { name: "delete_activities", displayName: "Delete Activities", description: "Can delete activities", category: "activity", action: "delete", resource: "activities", isSystem: true },
    { name: "list_activities", displayName: "List Activities", description: "Can access activity list page", category: "activity", action: "list", resource: "activities", isSystem: true },
    
    // Dashboard & Reports Permissions
    { name: "view_dashboard", displayName: "View Dashboard", description: "Can access dashboard", category: "dashboard", action: "view", resource: "dashboard", isSystem: true },
    { name: "view_reports", displayName: "View Reports", description: "Can view reports", category: "dashboard", action: "view", resource: "reports", isSystem: true },
    { name: "view_team_performance", displayName: "View Team Performance", description: "Can view team performance metrics", category: "dashboard", action: "view", resource: "team_performance", isSystem: true },
    
    // Settings Permissions
    { name: "list_roles", displayName: "List Roles", description: "Can access roles list", category: "settings", action: "list", resource: "roles", isSystem: true },
    { name: "view_roles", displayName: "View Roles", description: "Can view role details", category: "settings", action: "view", resource: "roles", isSystem: true },
    { name: "add_roles", displayName: "Add Roles", description: "Can create roles", category: "settings", action: "add", resource: "roles", isSystem: true },
    { name: "edit_roles", displayName: "Edit Roles", description: "Can edit roles and assign permissions", category: "settings", action: "edit", resource: "roles", isSystem: true },
    { name: "delete_roles", displayName: "Delete Roles", description: "Can delete roles", category: "settings", action: "delete", resource: "roles", isSystem: true },
    { name: "list_permissions", displayName: "List Permissions", description: "Can access permissions list", category: "settings", action: "list", resource: "permissions", isSystem: true },
    { name: "view_permissions", displayName: "View Permissions", description: "Can view permission details", category: "settings", action: "view", resource: "permissions", isSystem: true },
    { name: "add_permissions", displayName: "Add Permissions", description: "Can create permissions", category: "settings", action: "add", resource: "permissions", isSystem: true },
    { name: "edit_permissions", displayName: "Edit Permissions", description: "Can edit permissions", category: "settings", action: "edit", resource: "permissions", isSystem: true },
    { name: "delete_permissions", displayName: "Delete Permissions", description: "Can delete permissions", category: "settings", action: "delete", resource: "permissions", isSystem: true },
    { name: "manage_roles", displayName: "Manage Roles", description: "Full role management", category: "settings", action: "manage", resource: "roles", isSystem: true },
    { name: "manage_permissions", displayName: "Manage Permissions", description: "Full permission management", category: "settings", action: "manage", resource: "permissions", isSystem: true },
    { name: "manage_settings", displayName: "Manage Settings", description: "Can access system settings", category: "settings", action: "edit", resource: "settings", isSystem: true },
  ]);

  // Create dynamic roles with fine-grained permissions
  const adminRole = await Role.create({
    name: "Admin",
    description: "Full system access. Admin bypasses permission checks.",
    permissions: permissions.map((p) => p.name),
    isActive: true,
    isAdmin: true,
    isSystemRole: true,
  });

  const salesManagerRole = await Role.create({
    name: "Sales Manager",
    description: "Team management and sales oversight",
    permissions: [
      "view_dashboard", "view_reports", "view_team_performance",
      "list_leads", "view_leads", "add_leads", "edit_leads", "assign_leads", "convert_leads",
      "list_customers", "view_customers", "add_customers", "edit_customers",
      "list_deals", "view_deals", "add_deals", "edit_deals", "move_deals",
      "list_activities", "view_activities", "add_activities", "edit_activities",
      "list_users", "view_users",
    ],
    isActive: true,
  });

  const salesExecutiveRole = await Role.create({
    name: "Sales Executive",
    description: "Sales representative with basic access",
    permissions: [
      "view_dashboard",
      "list_leads", "view_leads", "add_leads", "edit_leads", "convert_leads",
      "list_customers", "view_customers", "add_customers", "edit_customers",
      "list_deals", "view_deals", "add_deals", "edit_deals",
      "list_activities", "view_activities", "add_activities", "edit_activities",
    ],
    isActive: true,
  });

  // Create users with dynamic roles
  const admin = await User.create({
    name: "Asha Admin",
    email: "admin@crm.com",
    password: "Admin@123",
    role: adminRole._id,
    phone: "9000000001",
    department: "Management",
    designation: "System Administrator",
    employeeId: "EMP001",
  });
  
  const manager = await User.create({
    name: "Mohan Manager",
    email: "manager@crm.com",
    password: "Manager@123",
    role: salesManagerRole._id,
    phone: "9000000002",
    department: "Sales",
    designation: "Sales Manager",
    employeeId: "EMP002",
  });
  
  const exec1 = await User.create({
    name: "Ravi Executive",
    email: "exec1@crm.com",
    password: "Exec@123",
    role: salesExecutiveRole._id,
    phone: "9000000003",
    department: "Sales",
    designation: "Sales Executive",
    employeeId: "EMP003",
  });
  
  const exec2 = await User.create({
    name: "Priya Executive",
    email: "exec2@crm.com",
    password: "Exec@123",
    role: salesExecutiveRole._id,
    phone: "9000000004",
    department: "Sales",
    designation: "Sales Executive",
    employeeId: "EMP004",
  });

  const leads = await Lead.insertMany([
    {
      firstName: "Anil",
      lastName: "Shah",
      email: "anil@acme.com",
      phone: "9811111111",
      company: "Acme Retail",
      source: "website",
      status: "qualified",
      priority: "high",
      assignedTo: exec1._id,
      notes: "Requested a product demo next week.",
    },
    {
      firstName: "Neha",
      lastName: "Kapoor",
      email: "neha@globex.com",
      phone: "9822222222",
      company: "Globex Foods",
      source: "referral",
      status: "contacted",
      priority: "medium",
      assignedTo: exec1._id,
    },
    {
      firstName: "Omar",
      lastName: "Khan",
      email: "omar@initech.io",
      phone: "9833333333",
      company: "Initech",
      source: "social_media",
      status: "new",
      priority: "low",
      assignedTo: exec2._id,
    },
    {
      firstName: "Sana",
      lastName: "Iyer",
      email: "sana@umbrella.com",
      phone: "9844444444",
      company: "Umbrella Health",
      source: "email",
      status: "qualified",
      priority: "high",
      assignedTo: exec2._id,
    },
  ]);

  for (const lead of leads) {
    await addTimeline({
      entityType: "lead",
      entityId: lead._id,
      action: "created",
      message: `Lead ${lead.firstName} ${lead.lastName} created`,
      actor: manager._id,
    });
  }

  const qualified = leads[0];
  const customer = await Customer.create({
    firstName: qualified.firstName,
    lastName: qualified.lastName,
    email: qualified.email,
    phone: qualified.phone,
    company: qualified.company,
    assignedTo: exec1._id,
    lead: qualified._id,
  });
  qualified.status = "converted";
  qualified.convertedToCustomer = customer._id;
  qualified.convertedAt = new Date();
  await qualified.save();

  const deal = await Deal.create({
    title: "Acme Retail annual plan",
    value: 120000,
    probability: 40,
    stage: "proposal",
    expectedCloseDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21),
    assignedTo: exec1._id,
    customer: customer._id,
    lead: qualified._id,
  });

  await addTimeline({
    entityType: "lead",
    entityId: qualified._id,
    action: "converted",
    message: "Lead converted to customer",
    actor: exec1._id,
  });
  await addTimeline({
    entityType: "deal",
    entityId: deal._id,
    action: "created",
    message: "Deal created from converted lead",
    actor: exec1._id,
  });

  await Activity.create({
    type: "demo",
    title: "Product demo with Acme",
    description: "Walk through premium plan features",
    dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
    entityType: "deal",
    entityId: deal._id,
    assignedTo: exec1._id,
    createdBy: manager._id,
  });
  await Activity.create({
    type: "call",
    title: "Follow-up call with Globex",
    dueAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    status: "overdue",
    entityType: "lead",
    entityId: leads[1]._id,
    assignedTo: exec1._id,
    createdBy: exec1._id,
  });

  console.log("Seed complete");
  console.log("Admin:    admin@crm.com / Admin@123");
  console.log("Manager:  manager@crm.com / Manager@123");
  console.log("Exec 1:   exec1@crm.com / Exec@123");
  console.log("Exec 2:   exec2@crm.com / Exec@123");
  console.log("Dynamic permissions created:", permissions.length);
  console.log("Dynamic roles created: Admin, Sales Manager, Sales Executive");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
