import connectDB from "@/lib/db";
import Customers from "@/models/Customers";

export async function POST(req) {
  await connectDB();
  const body = await req.json();
  const email = body.email;

  const user = await Customers.findOne({ email: email });
  if (user) {
    if (!user.city || !user.profession || !user.country) {
      console.log("Incomplete");
      return Response.json(
        { message: "Essential data not found" },
        { status: 408 }
      );
    } else {
      console.log("completed");
      return Response.json({ message: "Success" }, { status: 200 });
    }
  } else {
    console.log("User not found");
    return Response.json({ message: "User not found" }, { status: 404 });
  }
}
