import { HTMLAttributes } from "react";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

function WarningBar(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex items-center rounded-sm bg-[#03A9F4]/10 py-2.5 px-4 gap-2.5 border-[#03A9F4]/50 border-[1px] w-full ${props.className}`}
    >
      <ExclamationCircleIcon className="h-6 w-6 stroke-[#03A9F4]" />
      <p className="text-3.5 font-medium leading-3.5 tracking-normal">
        {props.children}
      </p>
    </div>
  );
}

export default WarningBar;
