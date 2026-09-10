import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function generateMetadata() {
  return {
    title: "Luxaeon Spaces | Business OS",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function Home() {
  const session = await getServerSession(authOptions);
  redirect(session ? "/dashboard" : "/login");
}
