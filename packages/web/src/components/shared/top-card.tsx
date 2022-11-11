import { JumpBigWhite } from "@/assets/svg";
import { twMerge } from "tailwind-merge";
import { Tutorial, TutorialItemInterface } from "@/components";
import isEmpty from "lodash/isEmpty";
import { ReactNode } from "react";

type Props = {
  maxW?: string;
  gradientText: string;
  bigText: string;
  bottomDescription: string;
  renderAsset?: JSX.Element;
  content?: JSX.Element;
  jumpLogo?: boolean;
  py?: boolean;
  children?: ReactNode;
  onClick?: () => void;
  stepItems?: TutorialItemInterface[];
};

export const TopCard = ({
  gradientText,
  bigText,
  bottomDescription,
  jumpLogo = false,
  content = <></>,
  maxW = "",
  children,
  stepItems,
}: Props) => {
  return (
    <div className={twMerge("launchpad top-card flex", maxW)}>
      <div
        className="overflow-hidden
                      flex
                      flex-wrap
                      align-middle
                      justify-between
                      w-full
                      color-white
                      font-extrabold
                      py-7
                      px-6
                      pb-16
                      h-full
                      rounded-lg
                      bg-white-600
                      gap-1.5
                      relative"
      >
        {!isEmpty(stepItems) && <Tutorial items={stepItems || []} />}

        <div className="flex flex-col relative flex-grow z-20 gap-y-4">
          <p className="text-base tracking leading-4 mb-0.5">{gradientText}</p>
          <h1 className="text-2xl tracking-tighter font-bolder leading-6">
            {bigText}
          </h1>
          <p className="font-semibold text-3.5 max-w-3xl tracking leading-4.5">
            {bottomDescription}
          </p>
          {children}
        </div>

        {content && (
          <div className="relative z-20 flex space-x-[1.25rem]">{content}</div>
        )}

        <div className="absolute bottom-0 right-0 z-10 max-h-full overflow-hidden">
          {jumpLogo && <JumpBigWhite />}
        </div>
      </div>
    </div>
  );
};
