import { useNavigate } from "react-router";
import {
  PageContainer,
  FormCardStep1,
  TokenLauncherTopCard,
  FormCardStep2,
} from "../components";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";

export type TokenDataProps = {
  name: string;
  symbol: string;
  tokenImage: string;
  decimals: number;
  reference?: string;
  hashReference?: string;
  type: string;
  supplyType: string;
  supply?: string;
};

export const TokenLauncher = () => {
  const [step, setStep] = useState<string>("step 1");
  const [tokenData, setTokenData] = useState({});

  const newTokenForm = useForm<TokenDataProps>();

  const { handleSubmit, reset } = newTokenForm;

  function handleFormStepChange() {
    step == "step 1" ? setStep("step 2") : setStep("step 1");
  }

  function handleUpdateTokenType(tokenType: string) {
    if (tokenType == "Mintable Token") {
      setTokenData((prevState) => {
        return {
          ...prevState,
          type: "mintable",
          supplyType: "unlimited",
        };
      });
    }
    if (tokenType == "Simple Token") {
      setTokenData((prevState) => {
        return {
          ...prevState,
          type: "simple",
          supplyType: "fixed",
        };
      });
    }
  }

  const handleStep1FormSubmit = handleSubmit((data) => {
    setTokenData(() => data);
    handleFormStepChange();
  });

  const handleStep2FormSubmit = handleSubmit((data) => {
    setTokenData((prevState) => {
      return { ...prevState, ...data };
    });
    reset();
  });

  console.log(tokenData);

  return (
    <PageContainer>
      <FormProvider {...newTokenForm}>
        <TokenLauncherTopCard />
        {step == "step 1" && (
          <FormCardStep1 onSubmitStepForm={handleStep1FormSubmit} />
        )}

        {step == "step 2" && (
          <FormCardStep2
            onSubmitStep2Form={handleStep2FormSubmit}
            onReturnFunction={handleFormStepChange}
            onUpdateTokenType={handleUpdateTokenType}
          />
        )}
      </FormProvider>
    </PageContainer>
  );
};
