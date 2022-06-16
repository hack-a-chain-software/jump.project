import { useNavigate } from "react-router";
import { PageContainer } from "../components";
import { BackButton } from "../components/shared/back-button";

/**
 * @description - Launchpad project details page
 * @name Project
 */
export const Project = () => {
  const navigate = useNavigate();
  return (
    <PageContainer>
      <BackButton onClick={() => navigate("/")} />
    </PageContainer>
  );
};
