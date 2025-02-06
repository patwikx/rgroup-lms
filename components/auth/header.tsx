import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";
import Image from "next/image";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

interface HeaderProps {
  label: string;
};

export const Header = ({
  label,
}: HeaderProps) => {
  return (
    <div className="w-full flex flex-col gap-y-4 items-center justify-center">
      <div className="flex items-center">
      
              <Image src='/assets/rdrdc.webp' alt="rdrdc-logo" width={60} height={60}/>
      <Image src='/assets/TWC.png' alt="rdrdc-logo" width={160} height={160}/>
      

        <Image src='/assets/rdh.webp' alt="rdrdc-logo" width={90} height={90}/>
        
        </div>
        <h1 className={cn(
        "text-3xl font-semibold text-center items-center",
        font.className,
      )}>
       RD Realty Group
      </h1>
      <h1 className={cn(
        "text-xl text-muted-foreground text-center items-center",
        font.className,
      )}>
       Leave Management System
      </h1>
      <p className="text-muted-foreground text-sm">
        {label}
      </p>
    </div>
  );
};
