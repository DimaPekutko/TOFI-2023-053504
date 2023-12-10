import { Document, PDFViewer, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import { max } from "lodash";


const styles = StyleSheet.create({
  page: {
    backgroundColor: 'lightgray',
    textAlign: 'center',
  },
  section: {
    color: 'black',
    textAlign: 'center',
    marginVertical: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingBottom: 10
  },
  heading: {
    fontSize: 35,
    marginTop: 10,
    marginBottom: 5,
  },
  sub_heading: {
    fontSize: 25,
    marginBottom: 15,
  }
});

const StatReport = ({ accId, email, transactions, credits }) => {

  const myTrAmounts = transactions.filter(t => t.acc_from_id === accId).map(t => t.amount);
  const recievedTrAmounts = transactions.filter(t => t.acc_to_id === accId).map(t => t.amount);
  const myCreditsAmounts = credits.map(cr => cr.amount);

  const maxTrTransfered = Math.max(...myTrAmounts, 0);
  const maxTrRecieved = Math.max(...recievedTrAmounts, 0);
  const averageTrAmount = Number(Math.max(...myTrAmounts, 0) / (myTrAmounts.length || 1)).toFixed(4);
  const totalTrAmountRecieved = recievedTrAmounts.reduce((prev, sum) => sum + prev, 0);

  const maxCreditAmount = Math.max(...myCreditsAmounts, 0);
  const totalCreditsAmount = myCreditsAmounts.reduce((prev, sum) => sum + prev, 0); 

  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.heading}>Finance Activity Report</Text>
        <Text style={styles.sub_heading}>For {email}</Text>
        <View style={styles.section}>
          <Text style={styles.header}>Max transaction amount transfered:</Text>
          <Text>{maxTrTransfered} $</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.header}>Max transaction amount recieved:</Text>
          <Text>{maxTrRecieved} $</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.header}>Average transfered transaction amount:</Text>
          <Text>{averageTrAmount} $</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.header}>Total Transaction amount recieved:</Text>
          <Text>{totalTrAmountRecieved} $</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.header}>Max credit amount:</Text>
          <Text>{maxCreditAmount} $</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.header}>Total credits amount requested:</Text>
          <Text>{totalCreditsAmount} $</Text>
        </View>
      </Page>
  </Document>
  )
}

export default StatReport;