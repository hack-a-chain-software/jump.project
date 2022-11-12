import React, { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  white?: boolean;
  inline?: boolean;
  outline?: boolean;
  full?: boolean;
  onClick?: React.MouseEvent<HTMLButtonElement>;
};

export function Button(props: ButtonProps) {
  let style =
    " disabled:grayscale-[.8] disabled:text-green py-2.5 px-6 rounded-sm flex gap-x-2 text-3.5 leading-4 items-center justify-center font-semibold active:opacity-40 hover:opacity-40";
  if (props.white) style += " bg-white text-purple";
  else if (props.inline) style += " text-white";
  else if (props.outline)
    style +=
      " text-white border-white-300 border-[1px] disabled:border-white-600";
  else style += " bg-purple text-white";

  if (props.full) style += " w-full flex justify-center";

  return (
    <button onClick={props.onClick} className={twMerge(style, props.className)}>
      {props.children}
    </button>
  );
}
