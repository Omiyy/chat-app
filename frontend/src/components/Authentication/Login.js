import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack, useToast, Text } from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider";

const Login = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [loading, setLoading] = useState(false);

  const history = useHistory();
  const { setUser } = ChatState();

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toast({
        title: "Please Fill all the Feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/user/login",
        { email, password },
        config
      );

      toast({
        title: "Login Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      history.push("/chats");
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <FormControl id="email" isRequired>
        <FormLabel className="small-muted">Email</FormLabel>
        <Input
          value={email}
          type="email"
          placeholder="you@example.com"
          variant="filled"
          bg="rgba(255,255,255,0.04)"
          _placeholder={{ color: "gray.400" }}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>

      <FormControl id="password" isRequired>
        <FormLabel className="small-muted">Password</FormLabel>
        <InputGroup>
          <Input
            value={password}
            type={show ? "text" : "password"}
            placeholder="••••••••"
            variant="filled"
            bg="rgba(255,255,255,0.04)"
            _placeholder={{ color: "gray.400" }}
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement>
            <Button size="sm" onClick={handleClick} variant="ghost" color="gray.300">
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <Button colorScheme="brand" width="100%" onClick={submitHandler} isLoading={loading}>
        Login
      </Button>

      <Button variant="outline" width="100%" onClick={() => { setEmail("guest@example.com"); setPassword("123456"); }}>
        Quick Guest
      </Button>
    </VStack>
  );
};

export default Login;
