import { observer } from "mobx-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { authStore } from "../store/authStore";
import { Container, VStack, Text, Divider, Heading, HStack, Spacer, FormControl, Input, Button, ListItem, OrderedList, FormErrorMessage, Tabs, Tab, TabList, TabPanel, TabPanels, Flex, Center } from "@chakra-ui/react";
import { transactionStore } from "../store/transactionStore";
import { AddIcon, ArrowForwardIcon, CheckIcon, DownloadIcon, RepeatClockIcon } from "@chakra-ui/icons";
import { PDFDownloadLink } from "@react-pdf/renderer";
import StatReport from "../pdf/StatReport";


const CREDIT_PERCENTS = {
  6: 20,
  12: 18,
  18: 12
}


const TransactionSection = observer(() => {

    const [createErr, setCreateErr] = useState('');

    useEffect(() => {
      const fetchTransactions = async () => authStore.isLogged && await transactionStore.getTransactions()
      fetchTransactions()
    }, [])

    const onSubmitCreate = async (e) => {
      e.preventDefault();

      const form = new FormData(e.target)
      const data = {
        to_acc_id: form.get('accId'),
        amount: form.get('amount')
      }

      const res = await transactionStore.createTransaction(data);
      if (res.err) {
        setCreateErr(res.err);
        return;
      }
      setCreateErr('')
    }

    const onApproveTransaction = async (trId) => {
      await transactionStore.approveTransaction(trId);
    }

    const getIcon = (tr) => {
      const executed = tr.status === 'EXECUTED';
      if (executed) {
        return <CheckIcon />;
      }

      if (!authStore.isAdmin) {
        return <RepeatClockIcon />;
      }

      return <AddIcon cursor='pointer' onClick={() => onApproveTransaction(tr.id)} />
    }

    return (
      <>
        <Heading size='sm'>Transactions:</Heading>
        <OrderedList>
          {transactionStore.transactions.map(tr => (
            <ListItem bg={tr.status === 'EXECUTED' ? 'green.100' : 'yellow.100'} p={1} my={5} borderRadius={10}>
              <Text>{tr.date}</Text>
              <HStack px={5} borderRadius={5}>
                <Text>{tr.user_from_email} </Text>
                <Spacer />
                <ArrowForwardIcon />
                <Text color='green.500'>{tr.amount}$</Text>
                <ArrowForwardIcon />
                <Spacer />
                <Text>{tr.user_to_email}</Text>
                <Spacer />
                {getIcon(tr)}
              </HStack>
            </ListItem>
          ))}
        </OrderedList>
        {!authStore.isAdmin && (
          <form onSubmit={onSubmitCreate}>
            <FormControl mt={2} isInvalid={createErr} p={3} borderColor={'blue.500'} borderWidth={2} borderStyle={'dashed'} borderRadius={10}>
              <HStack>
                <Input name="accId" placeholder="Account id" />
                <Spacer />
                <Input type="number" min="5.0" name="amount" placeholder="Amount" />
              </HStack>
              <FormErrorMessage>{createErr}</FormErrorMessage>
              <Button mt={5} type="submit">Transfer</Button>
            </FormControl>
          </form>
        )}
      </>
    );

})

const CreditSection = observer(() => {

  const [createErr, setCreateErr] = useState('');
  const [amountPerMonth, setAmountPerMonth] = useState(0);
  const [percent, setPercent] = useState(CREDIT_PERCENTS[6]);
  const formRef = useRef();

  
  useEffect(() => {
    const fetchCredits = async () => authStore.isLogged && await transactionStore.getCredits()
    fetchCredits()
  }, [])

  const getFormData = () => {
    const form = new FormData(formRef.current);
    const data = {
      amount: form.get('amount'),
      months: form.get('months'),
      percent: percent,
    }
    return data;
  }

  const calculatePerMonth = (amount, months, percent) => Number((amount / months) * (1 + percent / 100)).toFixed(4)

  const updateAmountPerMonth = () => {
    const data = getFormData();
    
    if (data.months) {
      const p = CREDIT_PERCENTS[data.months - data.months % 6] ?? CREDIT_PERCENTS[6];
      setPercent(p)
      setAmountPerMonth(calculatePerMonth(data.amount, data.months, p));
    }
  }

  const onSubmitCreate = async (e) => {
    e.preventDefault();

    const data = getFormData();

    const res = await transactionStore.createCredit(data);
    if (res.err) {
      setCreateErr(res.err);
      return;
    }
    setCreateErr('')
  }

  const onApproveCredit = async (crId) => {
    await transactionStore.approveCredit(crId);
  }

  const getIcon = (cr) => {
    const executed = cr.status === 'EXECUTED';
    if (executed) {
      return <CheckIcon />;
    }

    if (!authStore.isAdmin) {
      return <RepeatClockIcon />;
    }

    return <AddIcon cursor='pointer' onClick={() => onApproveCredit(cr.id)} />
  }

  return (
    <>
      <Heading size='sm'>Credits:</Heading>
      <OrderedList>
        {transactionStore.credits.map(cr => console.log(JSON.parse(JSON.stringify(cr))) || (
          <ListItem bg={cr.status === 'EXECUTED' ? 'green.100' : 'yellow.100'} p={1} my={5} borderRadius={10}>
            <HStack px={5} borderRadius={5}>
              <Text display='flex' gap={2}>
                Request <Text color='green.500'>{cr.amount} $</Text> for {cr.months} months,
                <Text color='pink.500'>{calculatePerMonth(cr.amount, cr.months, cr.percent)} $</Text> / month ({cr.percent}%)
              </Text>
              <Spacer />
              {getIcon(cr)}
            </HStack>
          </ListItem>
        ))}
      </OrderedList>
      {!authStore.isAdmin && (
        <form onSubmit={onSubmitCreate} ref={formRef} onChange={updateAmountPerMonth}>
          <FormControl mt={2} isInvalid={createErr} p={3} borderColor={'blue.500'} borderWidth={2} borderStyle={'dashed'} borderRadius={10}>
            <VStack alignItems={'left'} px={10}>
              <Text>Request a credit with sum</Text>
              <Input type="number" min="200.0" name="amount" placeholder="Amount" />
              <Text>via {percent}% per month for</Text>
              <Input type="number" min="1" max="36" name="months" placeholder="Months" />
              <Text>will be {amountPerMonth} $ per month.</Text>
              <FormErrorMessage>{createErr}</FormErrorMessage>
              <Button mt={5} type="submit">Request a credit</Button>
            </VStack>
          </FormControl>
        </form>
      )}
    </>
  );

})


const HomePage = observer(() => {

  const store = transactionStore;
  const pdfDocument = <StatReport accId={authStore.account?.id} email={authStore.user?.email} transactions={store.transactions} credits={store.credits} />;

  if (!authStore.isLogged) {
    return (
      <Container h={'100vh'}>
        <Center h={'80%'}>
          <Heading size={'md'}>Login for using Bank System.</Heading>
        </Center>
      </Container>
    )
  }

  return (
    <Container maxW='2xl'>
      <VStack alignItems={'left'} my={3}>
        <HStack>
          <Heading size={'md'} fontWeight={'bold'} color={'green.500'}>
            {authStore.user?.account?.fakeBalance} $
          </Heading>
          <Spacer/>
          {!authStore.isAdmin && (
            <>
              <Button h='30px' colorScheme='blue'>
                <Flex>
                <PDFDownloadLink document={pdfDocument} fileName="report.pdf">  
                  <DownloadIcon cursor='pointer' />
                </PDFDownloadLink>
                </Flex>
              </Button>
            </>
          )}
        </HStack>
        <Divider borderColor='gray.500' orientation='horizontal' />

        <Tabs>
          <TabList>
            <Tab>{authStore.isAdmin && 'All '}Transactions</Tab>
            <Tab>{authStore.isAdmin && 'All '}Credits</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <TransactionSection />
            </TabPanel>
            <TabPanel>
              <CreditSection />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );

});


export default HomePage;