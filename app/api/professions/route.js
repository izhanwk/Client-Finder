import { NextResponse } from "next/server";

export async function GET() {
  try {
    const professions = [
      "Web Developer",
      "Software Engineer",
      "UI/UX Designer",
      "Graphic Designer",
      "Data Scientist",
      "Doctor",
      "Nurse",
      "Teacher",
      "Professor",
      "Mechanical Engineer",
      "Electrical Engineer",
      "Civil Engineer",
      "Accountant",
      "Lawyer",
      "Police Officer",
      "Firefighter",
      "Architect",
      "Pharmacist",
      "Dentist",
      "Pilot",
      "Flight Attendant",
      "Chef",
      "Photographer",
      "Videographer",
      "Journalist",
      "Content Writer",
      "Digital Marketer",
      "SEO Specialist",
      "Social Media Manager",
      "Business Analyst",
      "Financial Analyst",
      "Real Estate Agent",
      "Entrepreneur",
      "Fitness Trainer",
      "Nutritionist",
      "Psychologist",
      "Therapist",
      "Plumber",
      "Electrician",
      "Mechanic",
    ];
    return NextResponse.json(professions, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
