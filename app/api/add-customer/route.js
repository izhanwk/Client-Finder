import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Customers from "@/models/Customers";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (session) {
    try {
      const body = await req.json();
      console.log(body);
      const user = await Customers.findOne({ email: body.email });
      if (user) {
        return Response.json({ message: "Conflict" }, { status: 409 });
      }
      const newCustomer = new Customers({
        email: body.email,
        profession: body.profession,
        country: body.country,
        city: body.city,
      });
      await newCustomer.save();
      return Response.json({ message: "success" }, { status: 200 });
    } catch (err) {
      return Response.json(
        { message: "Internal server occurred" },
        { status: 500 }
      );
    }
  } else {
    return Response.json({ message: "Not signed in" }, { status: 401 });
  }
}
