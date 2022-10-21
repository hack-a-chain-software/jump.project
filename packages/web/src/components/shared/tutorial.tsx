import { Steps } from "intro.js-react";
import { IconButton } from "@/components";
import { ReactNode, useState } from "react";

export interface TutorialItemInterface {
  title: string;
  element: string;
  intro: ReactNode;
}

export const Tutorial = ({ items }: { items: TutorialItemInterface[] }) => {
  const [show, setShow] = useState(false);

  return (
    <>
      <div className="absolute right-[12px] top-[12px] z-[12]">
        <IconButton onClick={() => setShow(!show)} />
      </div>

      <Steps
        enabled={show}
        steps={items}
        initialStep={0}
        onExit={() => setShow(false)}
        options={{
          showProgress: false,
          showBullets: false,
          scrollToElement: false,
        }}
      />
    </>
  );
};
