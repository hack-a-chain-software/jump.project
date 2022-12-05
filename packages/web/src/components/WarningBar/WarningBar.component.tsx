import { HTMLAttributes } from "react";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

function WarningBar(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex items-center rounded-full bg-[03A9F4]/10 py-[5px] px-4 w-full ${props.className}`}
    >
      <ExclamationCircleIcon className="h-8 w-8" />
      <p className="text-3.5 font-extrabold leading-3.5 tracking-tight">
        {props.children}
      </p>
    </div>
  );
}

export default WarningBar;
