import isEmpty from "lodash/isEmpty";
import { useNavigate } from "react-router";
import { ProjectCard } from "./project-card";
import { FolderOpenIcon } from "@heroicons/react/outline";
import { useWalletSelector } from "@/context/wallet-selector";
import { StatusEnum, useLaunchpadConenctionQuery } from "@near/apollo";

export const PreviewProjects = ({
  title,
  status,
}: {
  title: string;
  status: StatusEnum;
}) => {
  const navigate = useNavigate();

  const { accountId } = useWalletSelector();

  const {
    data: { launchpad_projects: { data: projects } = { data: [] } } = {},
    loading,
  } = useLaunchpadConenctionQuery({
    variables: {
      status,
      limit: 4,
      offset: 0,
      accountId: accountId ?? "",
    },
    skip: !status,
    fetchPolicy: "no-cache",
  });

  return (
    <div className="mb-[48px] w-full">
      <div className="flex justify-between items-center mb-[56px]">
        <div>
          <span
            children={title}
            className="font-inter text-white text-[20px] font-[700]"
          />
        </div>

        <div>
          <button
            onClick={() => navigate("/projects")}
            className="bg-[#6E3A85] px-[33px] py-[10px] rounded-[9.5px] hover:opacity-[.8]"
          >
            <span className="text-white text-[13px] font-[700]">
              View all sales
            </span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-start h-[80px]">
          <div className="animate-spin h-[32px] w-[32px] border border-l-white rounded-full" />
        </div>
      )}

      {isEmpty(projects) && !loading && (
        <div className="flex items-center">
          <FolderOpenIcon className="h-[28px] text-white mr-[4px]" />
          No items here
        </div>
      )}

      <div className="flex space-x-[18px] justify-between w-[1500px] max-w-full overflow-auto">
        {!isEmpty(projects) &&
          !loading &&
          projects?.map((project, i) => (
            <ProjectCard
              {...(project as any)}
              key={"launchpad-preview-" + title + "-" + i}
            />
          ))}
      </div>
    </div>
  );
};
