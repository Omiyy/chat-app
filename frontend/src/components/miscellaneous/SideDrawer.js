import {
  Button,
  Input,
  Box,
  Text,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Tooltip,
  useToast,
  Spinner,
  useDisclosure,
  IconButton,
  Flex,
} from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { useHistory } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import ChatLoading from "../ChatLoading";
import ProfileModal from "./ProfileModal";
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";
import { getSender } from "../../config/ChatLogics";
import UserListItem from "../userAvatar/UserListItem";
import { ChatState } from "../../Context/ChatProvider";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const history = useHistory();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async (userId) => {
    console.log(userId);

    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);

      onClose(); // Close the drawer before updating the page state
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return (
    <>
      <Box
        as="header"
        w="100%"
        bg="transparent"
        borderBottomWidth="1px"
        borderColor="rgba(255,255,255,0.03)"
        px={{ base: 3, md: 6 }}
        py={3}
        boxShadow="none"
        borderRadius="0"
      >
        <Flex align="center" justify="space-between" maxW="1200px" mx="auto">
          <Flex align="center" gap={3}>
            <Tooltip label="Search users" hasArrow>
              <IconButton
                aria-label="Search users"
                icon={<i className="fas fa-search" />}
                variant="ghost"
                color="gray.300"
                onClick={onOpen}
                size="md"
              />
            </Tooltip>
            <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="600" color="gray.100" fontFamily="Work sans">
              ChatApp
            </Text>
          </Flex>

          <Flex align="center" gap={4}>
            <Menu>
              <MenuButton as={IconButton} aria-label="Notifications" variant="ghost" color="gray.300">
                <NotificationBadge count={notification.length} effect={Effect.SCALE} />
                <BellIcon fontSize="20px" />
              </MenuButton>
              <MenuList
                bg="#1B2430"
                borderColor="rgba(255,255,255,0.04)"
                color="whiteAlpha.900"
                minW="xs"
              >
                {!notification.length ? (
                  <Box px={4} py={2} color="gray.400">No new messages</Box>
                ) : (
                  notification.map((notif) => (
                    <MenuItem
                      key={notif._id}
                      bg="transparent"
                      color="whiteAlpha.900"
                      _hover={{ bg: "rgba(255,255,255,0.03)" }}
                      onClick={() => {
                        setSelectedChat(notif.chat);
                        setNotification((prev) => prev.filter((n) => n._id !== notif._id));
                      }}
                    >
                      {notif.chat.isGroupChat
                        ? `New Message in ${notif.chat.chatName}`
                        : `New Message from ${getSender(user, notif.chat.users)}`}
                    </MenuItem>
                  ))
                )}
              </MenuList>
            </Menu>

            <Menu>
              <MenuButton as={Button} variant="ghost" p={0}>
                <Avatar size="sm" name={user.name} src={user.pic} />
              </MenuButton>
              <MenuList
                bg="#1B2430"
                borderColor="rgba(255,255,255,0.04)"
                color="whiteAlpha.900"
              >
                <ProfileModal user={user}>
                  <MenuItem
                    bg="transparent"
                    color="whiteAlpha.900"
                    _hover={{ bg: "rgba(255,255,255,0.03)" }}
                  >
                    My Profile
                  </MenuItem>
                </ProfileModal>
                <MenuDivider borderColor="rgba(255,255,255,0.04)" />
                <MenuItem
                  bg="transparent"
                  color="whiteAlpha.900"
                  _hover={{ bg: "rgba(255,255,255,0.03)" }}
                  onClick={logoutHandler}
                >
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent bg="#0b1220" borderRadius="0">
          <DrawerHeader borderBottomWidth="1px" borderColor="rgba(255,255,255,0.04)" pb={3}>
            Search Users
          </DrawerHeader>
          <DrawerBody>
            <Box d="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" d="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;
