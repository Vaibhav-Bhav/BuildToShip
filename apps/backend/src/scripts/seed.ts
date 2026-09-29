import bcrypt from "bcryptjs";
import { count, eq } from "drizzle-orm";
import {
  db,
  pool,
  usersTable,
  ordersTable,
  casesTable,
  caseEventsTable,
  messagesTable,
  attachmentsTable,
  promisesTable,
  policiesTable,
} from "@workspace/db";
import { logger } from "../lib/logger";

const ago = (days: number, hours = 0) =>
  new Date(Date.now() - (days * 24 + hours) * 60 * 60 * 1000).toISOString();
const dateOnly = (daysFromNow: number) =>
  new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

export async function runSeed(reset = false): Promise<void> {
  if (reset) {
    logger.info("Resetting existing database tables...");
    await db.delete(promisesTable);
    await db.delete(policiesTable);
    await db.delete(attachmentsTable);
    await db.delete(messagesTable);
    await db.delete(caseEventsTable);
    await db.delete(casesTable);
    await db.delete(ordersTable);
    await db.delete(usersTable);
    logger.info("Tables cleared.");
  } else {
    const [{ value: userCount }] = await db.select({ value: count() }).from(usersTable);
    if (Number(userCount) > 0) {
      logger.info("Database already seeded. Run with --reset to wipe and reseed.");
      return;
    }
  }

  const agentPassword = await bcrypt.hash("Agent@123", 10);
  const customerPassword = await bcrypt.hash("Customer@123", 10);

  const [agent] = await db
    .insert(usersTable)
    .values({
      name: "Alex Morgan",
      email: "agent@demo.com",
      passwordHash: agentPassword,
      role: "agent",
      createdAt: ago(20),
    })
    .returning();

  const [customer1] = await db
    .insert(usersTable)
    .values({
      name: "Priya Shah",
      email: "customer1@demo.com",
      passwordHash: customerPassword,
      role: "customer",
      createdAt: ago(20),
    })
    .returning();

  const [customer2] = await db
    .insert(usersTable)
    .values({
      name: "Jordan Lee",
      email: "customer2@demo.com",
      passwordHash: customerPassword,
      role: "customer",
      createdAt: ago(20),
    })
    .returning();

  const orderRows = await db
    .insert(ordersTable)
    .values([
      {
        orderCode: "ORD-4812",
        userId: customer1.id,
        productName: "NovaBook Pro 14",
        price: 1299,
        orderDate: dateOnly(-12),
        deliveryDate: dateOnly(-1),
        status: "Delivered",
      },
      {
        orderCode: "ORD-4750",
        userId: customer1.id,
        productName: "Pulse Wireless Headphones",
        price: 249,
        orderDate: dateOnly(-24),
        deliveryDate: dateOnly(-17),
        status: "Delivered",
      },
      {
        orderCode: "ORD-4631",
        userId: customer1.id,
        productName: "Arc Mechanical Keyboard",
        price: 179,
        orderDate: dateOnly(-36),
        deliveryDate: dateOnly(-29),
        status: "Delivered",
      },
      {
        orderCode: "ORD-4924",
        userId: customer2.id,
        productName: "Orbit Phone 12",
        price: 899,
        orderDate: dateOnly(-8),
        deliveryDate: dateOnly(-3),
        status: "Delivered",
      },
      {
        orderCode: "ORD-4888",
        userId: customer2.id,
        productName: "Studio Monitor Pair",
        price: 599,
        orderDate: dateOnly(-18),
        deliveryDate: dateOnly(-11),
        status: "Delivered",
      },
      {
        orderCode: "ORD-4703",
        userId: customer2.id,
        productName: "AirMesh Router",
        price: 129,
        orderDate: dateOnly(-40),
        deliveryDate: dateOnly(-33),
        status: "Delivered",
      },
    ])
    .returning();

  // Seed sample policies
  await db.insert(policiesTable).values([
    {
      category: "Damaged Product",
      title: "Damaged Upon Delivery Policy",
      content: "Customers reporting items damaged within 48 hours of confirmed delivery are eligible for an immediate express replacement or full refund upon submitting photo evidence.",
      createdAt: ago(30),
    },
    {
      category: "Refund",
      title: "Standard 30-Day Return & Refund",
      content: "Items in original packaging can be returned within 30 days of delivery. Refunds are processed to the original payment method within 3 business days of return receipt.",
      createdAt: ago(30),
    },
    {
      category: "Warranty",
      title: "1-Year Hardware Limited Warranty",
      content: "All electronics are covered by a 1-year limited warranty against manufacturing defects. Verification of serial number/IMEI is required.",
      createdAt: ago(30),
    },
  ]);

  const sampleCases = [
    {
      code: "RF1024",
      userId: customer1.id,
      orderId: orderRows[0].id,
      status: "New",
      category: "Damaged Product",
      priority: "Critical",
      sentiment: "Frustrated",
      summary: "Cracked screen on NovaBook Pro 14 received yesterday.",
      recommendedAction: "Review the photos and verify replacement eligibility",
      nextStep: "Agent review required",
      escalated: true,
      reason: "Customer contacted us 1 day ago with photos, no agent replied.",
      created: ago(1),
      due: ago(0, -2),
      message:
        "My laptop arrived yesterday with a cracked screen. I attached photos because this is really frustrating and I need it for work.",
      aiSource: "groq",
    },
    {
      code: "RF1023",
      userId: customer1.id,
      orderId: orderRows[1].id,
      status: "Investigating",
      category: "Refund",
      priority: "High",
      sentiment: "Concerned",
      summary: "Customer is requesting a refund for a headphone order.",
      recommendedAction: "Verify refund eligibility and purchase date",
      nextStep: "Agent is checking eligibility",
      escalated: false,
      reason: null,
      created: ago(2),
      due: ago(0, -10),
      message: "I would like a refund for these headphones. They are not working as expected.",
      aiSource: "groq",
    },
    {
      code: "RF1022",
      userId: customer1.id,
      orderId: orderRows[2].id,
      status: "Awaiting Customer",
      category: "Warranty",
      priority: "Medium",
      sentiment: "Neutral",
      summary: "Keyboard key stopped responding.",
      recommendedAction: "Request a short video showing the issue",
      nextStep: "Please send the requested video",
      escalated: false,
      reason: null,
      created: ago(3),
      due: dateOnly(1),
      message: "One key on my keyboard stopped responding. What information do you need from me?",
      aiSource: "groq",
    },
    {
      code: "RF1021",
      userId: customer1.id,
      orderId: orderRows[1].id,
      status: "Resolved",
      category: "Return",
      priority: "Low",
      sentiment: "Neutral",
      summary: "Return completed for a previous headphone issue.",
      recommendedAction: "No further action required",
      nextStep: "This case is resolved",
      escalated: false,
      reason: null,
      created: ago(5),
      due: ago(4),
      message: "I sent back the headphones as requested.",
      aiSource: "groq",
    },
    {
      code: "RF1020",
      userId: customer2.id,
      orderId: orderRows[3].id,
      status: "Approved",
      category: "Replacement",
      priority: "High",
      sentiment: "Concerned",
      summary: "Phone battery is draining faster than expected.",
      recommendedAction: "Approve replacement after IMEI verification",
      nextStep: "Agent will finalize replacement",
      escalated: false,
      reason: null,
      created: ago(2),
      due: dateOnly(1),
      message: "The phone battery is draining very quickly. I would prefer a replacement.",
      aiSource: "groq",
    },
    {
      code: "RF1019",
      userId: customer2.id,
      orderId: orderRows[4].id,
      status: "Investigating",
      category: "Delivery Delay",
      priority: "Medium",
      sentiment: "Concerned",
      summary: "Monitor delivery tracking has not updated.",
      recommendedAction: "Check carrier scan and latest estimated delivery",
      nextStep: "Support is checking carrier status",
      escalated: false,
      reason: null,
      created: ago(4),
      due: dateOnly(1),
      message: "The tracking has not moved in four days. Can you check where the monitors are?",
      aiSource: "groq",
    },
    {
      code: "RF1018",
      userId: customer2.id,
      orderId: orderRows[5].id,
      status: "Rejected",
      category: "Cancellation",
      priority: "Low",
      sentiment: "Neutral",
      summary: "Cancellation arrived after the order shipped.",
      recommendedAction: "Explain return options after delivery",
      nextStep: "Review the return options in your account",
      escalated: false,
      reason: null,
      created: ago(6),
      due: ago(4),
      message: "Please cancel the router order.",
      aiSource: "fallback",
    },
    {
      code: "RF1017",
      userId: customer2.id,
      orderId: orderRows[3].id,
      status: "Resolved",
      category: "Damaged Product",
      priority: "High",
      sentiment: "Neutral",
      summary: "Phone packaging was damaged but device was intact.",
      recommendedAction: "No further action required",
      nextStep: "This case is resolved",
      escalated: false,
      reason: null,
      created: ago(7),
      due: ago(6),
      message: "The box was damaged but the phone seems okay now.",
      aiSource: "groq",
    },
    {
      code: "RF1016",
      userId: customer2.id,
      orderId: orderRows[4].id,
      status: "New",
      category: "Refund",
      priority: "Medium",
      sentiment: "Neutral",
      summary: "Customer asks about a partial refund.",
      recommendedAction: "Review promotion and order pricing",
      nextStep: "An agent will review the order",
      escalated: false,
      reason: null,
      created: ago(8),
      due: dateOnly(1),
      message: "I noticed the monitors are now on sale. Can you help with a price adjustment?",
      aiSource: "groq",
    },
    {
      code: "RF1015",
      userId: customer1.id,
      orderId: orderRows[2].id,
      status: "Resolved",
      category: "Other",
      priority: "Low",
      sentiment: "Positive",
      summary: "Customer asked for a product manual.",
      recommendedAction: "Share the digital manual",
      nextStep: "This case is resolved",
      escalated: false,
      reason: null,
      created: ago(9),
      due: ago(8),
      message: "Could you send me the manual for my keyboard?",
      aiSource: "groq",
    },
    {
      code: "RF1014",
      userId: customer2.id,
      orderId: orderRows[5].id,
      status: "Awaiting Customer",
      category: "Warranty",
      priority: "Medium",
      sentiment: "Neutral",
      summary: "Router warranty claim needs serial number.",
      recommendedAction: "Verify serial number and purchase date",
      nextStep: "Please share the serial number",
      escalated: false,
      reason: null,
      created: ago(11),
      due: dateOnly(2),
      message: "The router keeps restarting. I think it is covered by warranty.",
      aiSource: "groq",
    },
    {
      code: "RF1013",
      userId: customer1.id,
      orderId: orderRows[0].id,
      status: "Resolved",
      category: "Delivery Delay",
      priority: "Low",
      sentiment: "Neutral",
      summary: "Laptop delivery was delayed by one day.",
      recommendedAction: "No further action required",
      nextStep: "This case is resolved",
      escalated: false,
      reason: null,
      created: ago(13),
      due: ago(12),
      message: "My laptop arrived a day late but it is here now.",
      aiSource: "groq",
    },
  ];

  for (const item of sampleCases) {
    const [caseRow] = await db
      .insert(casesTable)
      .values({
        caseCode: item.code,
        userId: item.userId,
        orderId: item.orderId,
        status: item.status,
        category: item.category,
        priority: item.priority,
        sentiment: item.sentiment,
        customerIntent: "Request a resolution",
        summary: item.summary,
        recommendedAction: item.recommendedAction,
        nextStep: item.nextStep,
        escalationRequired: item.escalated ? 1 : 0,
        escalationReason: item.reason,
        missingInformation: JSON.stringify(
          item.category === "Damaged Product" ? ["Photo of the damage"] : [],
        ),
        resolutionPlan: JSON.stringify([
          "Verify order and delivery details",
          "Review submitted evidence",
          "Check eligibility",
          "Confirm preferred outcome",
          "Send the resolution",
        ]),
        assignedAgentId: item.status === "New" ? null : agent.id,
        aiFailed: 0,
        aiSource: item.aiSource,
        archived: false,
        createdAt: item.created,
        updatedAt: item.created,
        dueAt: item.due,
      })
      .returning();

    // Timeline events: mark customer-facing events with visibleToCustomer: true
    await db.insert(caseEventsTable).values({
      caseId: caseRow.id,
      eventType: "ORDER_PLACED",
      description: "Order placed",
      actorType: "system",
      createdAt: item.created,
      metadata: "{}",
      visibleToCustomer: true,
    });

    await db.insert(caseEventsTable).values({
      caseId: caseRow.id,
      eventType: "CASE_CREATED",
      description: "Case created from customer message",
      actorType: "customer",
      actorId: item.userId,
      createdAt: item.created,
      metadata: "{}",
      visibleToCustomer: true,
    });

    if (item.escalated) {
      await db.insert(caseEventsTable).values({
        caseId: caseRow.id,
        eventType: "ESCALATED",
        description: item.reason!,
        actorType: "system",
        createdAt: ago(0, -2),
        metadata: JSON.stringify({ reason: item.reason }),
        visibleToCustomer: false, // Internal to agent
      });
    }

    await db.insert(messagesTable).values({
      caseId: caseRow.id,
      senderType: "customer",
      body: item.message,
      createdAt: item.created,
    });

    // For the escalated laptop case RF1024, attach a sample promise
    if (item.code === "RF1024") {
      await db.insert(promisesTable).values({
        caseId: caseRow.id,
        text: "Replacement confirmation and tracking number",
        dueAt: ago(0, -4),
        status: "pending",
        createdAt: item.created,
      });
    }
  }

  logger.info("ResolveAI demo data seeded successfully.");
}

// When executed directly as a script (e.g. via pnpm db:seed)
const isDirectRun = process.argv[1]?.includes("seed");
if (isDirectRun) {
  const resetFlag = process.argv.includes("--reset");
  runSeed(resetFlag)
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error("Seeding failed:", err);
      await pool.end();
      process.exit(1);
    });
}
