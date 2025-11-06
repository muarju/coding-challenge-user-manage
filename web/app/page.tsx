"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSessionId } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const sid = getSessionId();
    if (sid) router.replace("/dashboard");
    else router.replace("/signin");
  }, [router]);
  return null;
}
