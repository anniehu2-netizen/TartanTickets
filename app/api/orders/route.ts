import { createTicketOrder } from "../../events.ts";

export async function POST(request: Request) {
  let input: unknown;

  try {
    input = await request.json();
  } catch {
    return Response.json(
      { error: "Enter your ticket details and try again." },
      { status: 400 },
    );
  }

  const result = createTicketOrder(input);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return Response.json(
    {
      orderId: result.orderId,
      seats: result.seats,
      seatsRemaining: result.seatsRemaining,
      simulated: true,
    },
    { status: 201 },
  );
}
