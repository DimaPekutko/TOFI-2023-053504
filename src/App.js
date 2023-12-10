import { Route, BrowserRouter as Router, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import AuthPage from './pages/AuthPage';
import { Text, Container, Flex, HStack, Heading, Link, Popover, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Portal, Spacer, VStack, useToast, Slider, SliderMark, SliderTrack, SliderFilledTrack, SliderThumb, Button, useStatStyles } from '@chakra-ui/react';
import {Link as RLink} from 'react-router-dom';
import { observer } from 'mobx-react';
import { authStore } from './store/authStore';
import HomePage from './pages/HomePage';
import { useEffect, useState } from 'react';

const App = observer(() => {

  const [economyPercent, setEconomyPercent] = useState(0);
  const toast = useToast();

  useEffect(() => {
    const initAuth = async () => await authStore.initAuth();
    initAuth();
  }, [])

  useEffect(() => {
    if (authStore.user?.account) {
      console.log("hello", authStore.user.account.economy_percent)
      setEconomyPercent(authStore.user.account.economy_percent)
    }
  }, [authStore.user?.account]);

  const onLogout = async () => {
    const success = await authStore.logout();
    if (success) {
      toast({ title: 'Logged out', status: 'success' });
    }
  }

  const onChangeEconomyPercent = async (value) => {
    setEconomyPercent(value);
  }

  const onSubmitPercent = async () => {
    await authStore.setEconomyPercent({ percent: economyPercent });
  }
  
  return (
    <div className="App">
      <Router>
        <Container maxW='8xl' bgGradient='linear(to-br, gray.200, blue.100, green.100)' minH='100vh'>
          <VStack>
            <Flex as={'nav'} w={'100%'} alignItems={'center'}>
              <Heading>Bank</Heading>
              <Spacer/>
              <HStack>
                {authStore.isLogged ? (
                  <>
                    <Popover placement='bottom-start'>
                      {!authStore.isAdmin ? (
                        <PopoverTrigger>
                          <Link>
                            {authStore.user?.email}
                          </Link>
                        </PopoverTrigger>
                      ) : (
                        <Link>
                          {authStore.user?.email}
                        </Link>
                      )}
                      <Portal>
                        <PopoverContent bg={'gray.200'} borderRadius={15}>
                          <PopoverHeader fontWeight={'bold'}>Economy Settings</PopoverHeader>
                          <PopoverCloseButton />
                          <PopoverBody>
                            <VStack alignItems='left'>
                              <Text display={'flex'} gap={1}>
                                Allowed to use {economyPercent}% of <Text fontWeight='bold' color='green.500'>{authStore.user?.account?.balance} $</Text>
                              </Text>
                              <Text>
                                Money left over: {(authStore.user?.account?.balance * (economyPercent / 100)).toFixed(1)} $
                              </Text>
                              <Slider mt={10} mb={10} w={'85%'} alignSelf={'center'} onChange={onChangeEconomyPercent}>
                                <SliderMark pt={2} value={15}>20%</SliderMark>
                                <SliderMark pt={2} value={50}>50%</SliderMark>
                                <SliderMark pt={2} value={85}>85%</SliderMark>
                                <SliderMark
                                  value={economyPercent}
                                  textAlign='center'
                                  bg='blue.500'
                                  color='white'
                                  fontWeight='bold'
                                  mt='-10'
                                  ml='-5'
                                  w='12'
                                  borderRadius={15}
                                >
                                  {economyPercent}%
                                </SliderMark>
                                <SliderTrack color={'blue.800'}>
                                  <SliderFilledTrack />
                                </SliderTrack>
                                <SliderThumb />
                              </Slider>
                              <HStack>
                                <Spacer />
                                <Button size={'sm'} colorScheme='blue' onClick={onSubmitPercent}>
                                  Set Economy Mode
                                </Button>
                              </HStack>
                            </VStack>
                          </PopoverBody>
                        </PopoverContent>
                      </Portal>
                    </Popover>
                    <Link onClick={onLogout}>
                      Logout
                    </Link>
                  </>
                ) : (
                  <Link>
                    <RLink to={'/auth'}>Authenticate</RLink>
                  </Link>
                )}
              </HStack>
            </Flex>
          </VStack>
            <Routes>
              <Route
                exact
                path='/auth'
                Component={AuthPage}
              />
              <Route
                path='/'
                Component={HomePage}
              />
            </Routes>
        </Container>
      </Router>
    </div>
  );
});

export default App;
