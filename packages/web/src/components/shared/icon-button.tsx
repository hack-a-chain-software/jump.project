import { QuestionMarkCircleIcon } from "@heroicons/react/solid";

export function IconButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}>
      <QuestionMarkCircleIcon className="w-[32px] h-[32px] hover:opacity-[.7]" />
    </button>
  );
}
