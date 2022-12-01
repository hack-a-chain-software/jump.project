import Skeleton from "react-loading-skeleton";
import { HTMLAttributes } from "react";

function Badge(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-full font-extrabold bg-white py-[5px] text-purple px-4 absolute bottom-6 right-6 w-fit tracking-tight ${props.className}`}
    >
      <p className="text-3.5 leading-3.5">
        {props.children || <Skeleton width="120px" />}
      </p>
    </div>
  );
}

export default Badge;
