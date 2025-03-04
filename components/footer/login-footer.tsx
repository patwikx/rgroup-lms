"use client";


import { Mail, Facebook } from "lucide-react";
import Link from "next/link";

export function HomepageFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-background h-10">
      <div className="container h-full flex items-center">
        <div className="flex-1 flex justify-center items-center gap-2">
          <p className="text-xs text-muted-foreground">
            © {currentYear} RD Realty Group LMS
          </p>
          <span className="text-xs text-muted-foreground mx-1">•</span>
          <p className="text-xs text-muted-foreground">
  Developed by{" "}
  <Link
    href="https://www.facebook.com/fatwiks/"
    passHref
    className="underline text-blue-500 hover:text-blue-700"
  >
    Patrick L. Miranda
  </Link>
</p>
        </div>
      </div>
    </footer>
  );
}
