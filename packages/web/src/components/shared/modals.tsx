import {
  Flex,
  Modal,
  ModalBody,
  ModalOverlay,
  ModalContent,
  Text,
  ModalContentProps,
  Box,
  useMediaQuery,
} from "@chakra-ui/react";
import { CloseIcon } from "../../assets/svg";
import { useTheme } from "../../hooks/theme";

const modalRadius = 20;

export interface DialogParams extends Partial<ModalContentProps> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function ModalImageDialog({
  isOpen = false,
  onClose = () => {},
  title = "",
  minW = "700px",
  minH = "400px",
  footer = null,
  children = null,
  color = "white",
  bg,
  image = "https://images.unsplash.com/photo-1638437447452-5be2df845877?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3431&q=80",
  shouldBlurBackdrop,
  closeLocked = false,
  ...modalContentProps
}: Partial<DialogParams> & {
  image?: string;
  shouldBlurBackdrop?: boolean;
  closeLocked?: boolean;
  children?: React.ReactNode;
}) {
  const { jumpGradient } = useTheme();
  const [isMobile] = useMediaQuery("(max-width: 810px)");
  return (
    <Modal
      closeOnEsc={!closeLocked}
      closeOnOverlayClick={!closeLocked}
      blockScrollOnMount={false}
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      size={isMobile ? "full" : "md"}
    >
      <ModalOverlay
        backdropFilter={shouldBlurBackdrop ? "blur(20px)" : ""}
        border="none"
      />
      <ModalContent
        id="content"
        flexDirection="row"
        bg="transparent"
        minW={isMobile ? "auto" : minW}
        minH={isMobile ? "auto" : minH}
        overflow="hidden"
        borderRadius={modalRadius}
        {...modalContentProps}
      >
        <Box
          w="100%"
          bg={jumpGradient}
          p="6px"
          display="flex"
          borderRadius={25}
          overflow="hidden"
          maxWidth="100vw"
        >
          <ModalBody
            p="30px"
            pl="40px"
            position="relative"
            bg={bg || jumpGradient}
            overflowY="scroll"
            overflow="hidden"
            borderRadius={`${modalRadius}px 0 0 ${modalRadius}px`}
          >
            <Flex direction="column" height="100%">
              <Text
                as="h1"
                mt="10px"
                mb="15px"
                fontSize="20px"
                fontWeight="bold"
                color={color}
              >
                {title}
              </Text>

              {children}
              <Flex
                p="10px"
                position="absolute"
                right="51%"
                bottom="20px"
                left="20px"
              >
                {footer}
              </Flex>
            </Flex>

            {isMobile && (
              <Flex
                cursor="pointer"
                onClick={onClose}
                position="absolute"
                top="30px"
                right="30px"
                w="40px"
                h="40px"
                alignItems="center"
                justifyContent="center"
                bg="rgba(255,255,255,0.2)"
                borderRadius={6}
                backdropFilter="blur(10px)"
                color="white"
              >
                <CloseIcon />
              </Flex>
            )}
          </ModalBody>
          {!isMobile && (
            <ModalBody
              id="info-image"
              borderRadius={`0 ${modalRadius}px ${modalRadius}px 0`}
              borderColor={bg}
              borderWidth={0}
              backgroundSize="cover"
              backgroundPosition="center center"
              backgroundImage={image}
            >
              {!closeLocked && (
                <Flex
                  cursor="pointer"
                  onClick={onClose}
                  position="absolute"
                  top="30px"
                  right="30px"
                  w="40px"
                  h="40px"
                  alignItems="center"
                  justifyContent="center"
                  bg="rgba(255,255,255,0.2)"
                  borderRadius={6}
                  backdropFilter="blur(10px)"
                  color="white"
                >
                  <CloseIcon />
                </Flex>
              )}
            </ModalBody>
          )}
        </Box>
      </ModalContent>
    </Modal>
  );
}
