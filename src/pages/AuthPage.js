import { Container, Flex, Text, Tab, TabList, TabPanel, TabPanels, Tabs, Center, FormControl, FormLabel, Input, FormHelperText, Button, Spacer, FormErrorMessage, useToast, HStack, PinInput, PinInputField, Box } from "@chakra-ui/react";
import { observer } from "mobx-react";
import { useState } from "react";
import { authStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";


const AuthPage = observer(() => {

  const [showPin, setShowPin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginErr, setLoginErr] = useState('');
  const [regErr, setRegErr] = useState('');

  const toast = useToast();
  const navigate = useNavigate();

  const onLoginResponse = (result) => {
    setIsLoginLoading(false);
    if (result.err) {
      setLoginErr(result.err);
      return;
    }

    setShowPin(true);
  }
  
  const onCompletePin = async (code) => {
    const result = await authStore.verifyCode({code: code, email: loginEmail})
    if (result.err) {
      setLoginErr(result.err);
      return;
    }
    
    setLoginErr('');
    toast({ title: 'Login succeeded!', status: 'success' });
    navigate('/');
  }

  const onRegisterResponse = (result) => {
    if (result.err) {
      setRegErr(result.err);
      return;
    }
    setRegErr('');
    toast({ title: 'You registered!', status: 'success' });
  }

  const onLogin = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target)
    const data = {
      username: form.get('email'),
      password: form.get('password')
    }

    setLoginEmail(data.username);
    setIsLoginLoading(true);
    await authStore.login(data, onLoginResponse);
  }

  const onRegister = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target)
    const data = {
      email: form.get('email'),
      password: form.get('password')
    }

    if (form.get('password') !== form.get('confirm_password')) {
      setRegErr('Passwords are not equal')
      return;
    }

    await authStore.register(data, onRegisterResponse);
  }


  return (
    <Container maxW={'4xl'}>
      <Tabs>
        <TabList>
          <Tab>Login</Tab>
          <Tab>Register</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Center>
              <Flex w={'70%'}>
                <form onSubmit={onLogin}>
                  <FormControl isInvalid={loginErr}>
                    <FormLabel>Login</FormLabel>
                    {!showPin ? (
                      <>
                        <FormHelperText>Your email:</FormHelperText>
                        <Input type='email' name='email' bg={'gray.100'} placeholder="Your email" borderColor={'gray.200'} />
                        <FormHelperText>Your password:</FormHelperText>
                        <Input type='password' name='password' bg={'gray.100'} placeholder="Your password" borderColor={'gray.200'} />
                      </>
                    ) : (
                      <Box p={3}>
                        <Text fontSize={14}>Message with code was delivered on your email</Text>
                        <HStack mt={5}>
                          <PinInput type='alphanumeric' onComplete={onCompletePin}>
                            <PinInputField />
                            <PinInputField />
                            <PinInputField />
                            <PinInputField />
                            <PinInputField />
                            <PinInputField />
                          </PinInput>
                        </HStack>
                      </Box>
                    )}
                    <FormErrorMessage>{loginErr}</FormErrorMessage>
                  </FormControl>
                  <Button type='submit' my={5} isLoading={isLoginLoading}>Login</Button>
                </form>
              </Flex>
            </Center>
          </TabPanel>
          <TabPanel>
            <Center>
              <Flex w={'70%'}>
                <form onSubmit={onRegister}>
                  <FormControl isInvalid={regErr}>
                    <FormLabel>Login</FormLabel>
                    <FormHelperText>Your email:</FormHelperText>
                    <Input type='email' name='email' bg={'gray.100'} placeholder="Your email" borderColor={'gray.200'} />
                    <FormHelperText>Your password:</FormHelperText>
                    <Input type='password' name='password' bg={'gray.100'} placeholder="Your password" borderColor={'gray.200'} />
                    <FormHelperText>Repeat password:</FormHelperText>
                    <Input type='password' name='confirm_password' bg={'gray.100'} placeholder="Repeat password" borderColor={'gray.200'} />
                    <FormErrorMessage>{regErr}</FormErrorMessage>
                  </FormControl>
                  <Button type='submit' my={5}>Register</Button>
                </form>
              </Flex>
            </Center>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
});

export default AuthPage;