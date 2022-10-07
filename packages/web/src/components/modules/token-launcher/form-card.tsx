import { Box, Flex, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { JumpBigIcon } from "../../../assets/svg";
import { GradientText, Card } from "../../shared";
import { GlobeAltIcon } from "@heroicons/react/outline";
import { FormButton } from "./form-button";
import { FormInputAndLabel } from "./form-input-label";
import { useFormContext } from "react-hook-form";

interface FormCardProps {
  onSubmitStepForm: (data: any) => void;
}

export function FormCardStep1({ onSubmitStepForm }: FormCardProps) {
  const { register, watch } = useFormContext();

  const requiredInputs = {
    tokenName: watch("name"),
    symbol: watch("symbol"),
    tokenImage: watch("tokenImage"),
    decimals: watch("decimals"),
  };

  function checkInputLenghtGreaterThanZero(input: string) {
    return input?.length > 0;
  }

  const requiredInputsFilled = Object.values(requiredInputs).every(
    checkInputLenghtGreaterThanZero
  );

  const isButtonDisabled = !requiredInputsFilled;

  return (
    <Card
      p="3px"
      flexGrow="1"
      borderRadius="25px"
      height={{ sm: "auto", md: "914px" }}
    >
      <Flex
        pl={{ base: "none", md: "10.3%" }}
        pr="3%"
        flex={1.6}
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="center"
        height="100%"
      >
        <Flex
          width="100%"
          direction={{ base: "column", md: "row" }}
          alignItems={{ base: "start", md: "end" }}
          justifyContent="flex-start"
          pl={4}
          gap="30px"
          height="fit-content"
        >
          <GradientText
            fontSize="40px"
            fontWeight="700"
            letterSpacing="-3%"
            lineHeight="40px"
          >
            Set the basics
          </GradientText>
          <Box
            width="109px"
            height="33.4px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            backgroundColor="#6E3A85"
            borderRadius="43.95px"
          >
            <GradientText
              fontSize="16px"
              fontWeight="600"
              letterSpacing="-3%"
              lineHeight="16px"
            >
              Step 1/2
            </GradientText>
          </Box>
        </Flex>
        <FormControl id="form-step-1" mt="37px" pl={4}>
          <form id="form-step-1" onSubmit={onSubmitStepForm}>
            <FormInputAndLabel
              label="Token name"
              placeholder="Ex: Bitcoin, Ethereum"
              inputName="name"
            />
            <FormInputAndLabel
              label="Symbol"
              placeholder="Ex: BTC, ETH"
              inputName="symbol"
            />
            <FormLabel
              fontSize="16px"
              fontWeight="600"
              lineHeight="16px"
              mb="13px"
              mt="31px"
            >
              Token image
            </FormLabel>
            <div className="relative">
              <Input
                pl="57px"
                border="0px"
                backgroundColor="rgba(255,255,255,0.2)"
                borderRadius="10px"
                width="93%"
                height="40px"
                fontWeight="400"
                fontSize="14px"
                lineHeight="40px"
                _placeholder={{ color: "#FFF", opacity: "0.5" }}
                placeholder="Paste URL here"
                {...register("tokenImage")}
              />
              <div
                className="h-[40px] w-[40px] border-r-[1px] 
                        absolute left-0 top-0 border-[rgba(255,255,255,0.19)]"
              />
              <GlobeAltIcon
                className="h-[14px] w-[14px] 
                            absolute left-[13px] top-[13px] "
              />
            </div>
            <FormInputAndLabel
              label="Decimals"
              placeholder="Ex: 18"
              inputName="decimals"
            />
            <FormInputAndLabel
              label={
                <>
                  Reference <span className="font-normal">(optional)</span>
                </>
              }
              placeholder="Ex: 18"
              inputName="reference"
            />
            <FormInputAndLabel
              label={
                <>
                  Hash reference <span className="font-normal">(optional)</span>
                </>
              }
              placeholder="Ex: 18"
              inputName="hashReference"
            />
          </form>
        </FormControl>
        <FormButton
          isDisabled={isButtonDisabled}
          mt={{ base: "41px", md: "61px" }}
          mb={{ base: "30px", md: "none" }}
          title="Create token"
          bg="#6E3A85"
          color="#FFF"
          type="submit"
          form="form-step-1"
        />
      </Flex>
    </Card>
  );
}
