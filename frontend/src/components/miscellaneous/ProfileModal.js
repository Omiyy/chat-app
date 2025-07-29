import React, { useEffect } from "react";
import { ViewIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  IconButton,
  Text,
  Image,
  Box,
} from "@chakra-ui/react";

const ProfileModal = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Add this effect to ensure modal closes on component unmount
  useEffect(() => {
    return () => {
      onClose();
    };
  }, [onClose]);

  return (
    <>
      {children ? (
        // If children is a valid React element (e.g. Chakra <MenuItem />),
        // clone it and attach onOpen so it stays a MenuItem (keeps styling)
        React.isValidElement(children) ? (
          React.cloneElement(children, {
            onClick: (e) => {
              // call original onClick if present (preserve behavior)
              if (typeof children.props.onClick === "function") {
                children.props.onClick(e);
              }
              onOpen();
            },
          })
        ) : (
          <span onClick={onOpen}>{children}</span>
        )
      ) : (
        <IconButton
          d={{ base: "flex" }}
          icon={<ViewIcon />}
          aria-label="View profile"
          variant="ghost"
          color="gray.200"
          onClick={onOpen}
        />
      )}

      <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent
          h="410px"
          bg="#0b1220"                /* dark panel */
          color="whiteAlpha.900"      /* ensure text visible */
          borderRadius="0"            /* flush edges to match theme */
          border="1px solid rgba(255,255,255,0.03)"
        >
          <ModalHeader
            fontSize="36px"
            fontFamily="Work sans"
            d="flex"
            justifyContent="center"
            color="whiteAlpha.900"
          >
            {user.name}
          </ModalHeader>
          <ModalCloseButton color="gray.300" />
          <ModalBody
            d="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="space-between"
            pb={6}
          >
            <Box>
              <Image
                borderRadius="full"
                boxSize="150px"
                src={user.pic}
                alt={user.name}
                mb={4}
                border="2px solid rgba(255,255,255,0.04)"
              />
              <Text
                fontSize={{ base: "18px", md: "20px" }}
                fontFamily="Work sans"
                textAlign="center"
                mb={2}
                color="whiteAlpha.900"
              >
                Email: {user.email}
              </Text>
              <Text
                fontSize="sm"
                color="rgba(230,238,246,0.6)"
                textAlign="center"
              >
                {user.bio || ""} {/* optional bio / placeholder */}
              </Text>
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button onClick={onClose} colorScheme="brand" variant="solid">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
