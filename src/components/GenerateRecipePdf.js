import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

// Colors & Style
const primary = "#B33333";

const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontSize: 11,
    fontFamily: "Helvetica",
    lineHeight: 1.4,
  },

  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 70,   
    height: 70,  
  },

  logo: {
    width: 50,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: primary,
    padding: 1,
    borderRadius: 4,
    marginBottom: 20,
    position: "relative",
  },

  title: {
    fontSize: 20,
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    position: "absolute",
    left: 0,
    right: 0,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: primary,
    marginBottom: 8,
    marginTop: 15,
  },

  rowDivider: {
    backgroundColor: '#FFB300',
    flexDirection: "row",
    // borderBottom: "1px solid #ccc",
    paddingVertical: 6,
    textAlign: "center",
    fontWeight: 'bold',
    borderRadius: 4,
  },

  row: {
    flexDirection: "row",
    // borderBottom: "1px solid #ccc",
    borderBottomWidth: '1px',
    borderBottomColor: '#ccc',
    paddingVertical: 6,
  },

  cellHeader: {
    flex: 1,
    fontWeight: "bold",
    backgroundColor: primary,
    color: "white",
    padding: 6,
    alignItems: "center",
  },

  cell: {
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },

  cellNotes: {
    fontSize: 8
  },

  notesBox: {
    padding: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginTop: 10,
  },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    // fontSize: 8,
    // color: primary,
  },
});

export default function GenerateRecipePdf({ recipe }) {
    const logo = 'icons/logo-doc.png';
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap >        

        {/* HEADER */}
        <View style={styles.header}>
          {logo && <View style={styles.logoContainer}><Image src={logo} style={styles.logo} /></View>}
          <Text style={styles.title}>{recipe.name}</Text>
        </View>

        {/* CATEGORY */}
        <Text>
          <Text style={{ fontWeight: "bold" }}>Category: </Text>
          {recipe.recipecat}
        </Text>

        {/* WEIGHT */}
        <Text style={{ marginBottom: 10 }}>
          <Text style={{ fontWeight: "bold" }}>Final Weight: </Text>
          {recipe.quantity} {recipe.mu}
        </Text>

        {/* INGREDIENTS TABLE */}
        {/* <Text style={styles.sectionTitle}>Ingredients</Text> */}

        {/* Table Header */}
        <View style={{ flexDirection: "row", borderRadius: 4, overflow: "hidden", alignItems: "center" }}>
          <Text style={styles.cellHeader}>Ingredient</Text>
          <Text style={styles.cellHeader}>Amount</Text>
          <Text style={styles.cellHeader}>Unit</Text>
        </View>

        {/* Table Rows */}
        {recipe.ingredients.map((ing, i) => {
            return ing.mu === 'div' ? (
            <View style={styles.rowDivider} key={i}>
                <Text style={styles.cell}>{ing.name}</Text>
                {/* <Text style={styles.cell}>{ing.quantity}</Text> */}
                {/* <Text style={styles.cell}>{ing.mu}</Text> */}
            </View>
          ) : (
            <View style={styles.row} key={i}>
                <Text style={styles.cell}>{ing.name} {ing.percentage && ' ('+ing.percentage+' %)'} {'\n'}
                    <Text style={styles.cellNotes}>{ing.notes}</Text>
                </Text>
                <Text style={styles.cell}>{ing.quantity}</Text>
                <Text style={styles.cell}>{ing.mu}</Text>
            </View>)
          }
        )}

        {/* NOTES */}
        {recipe.notes ? (
          <>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesBox}>
              <Text>{recipe.notes}</Text>
            </View>
          </>
        ) : (
            <>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesBox}>
              <Text>There are no notes for this recipe.</Text>
            </View>
            </>
        )}

        {/* FOOTER */}
        {/* <Text style={styles.footer} render={({ pageNumber, totalPages }) => 'Document created with Vlapp — Page '+pageNumber+' of '+totalPages} /> */}
        {<Text style={styles.footer} fixed >Document created with Vlapp</Text>}
        {/* <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
            `${pageNumber} / ${totalPages}`
        )} fixed />
        <Text style={styles.footer} render={(pageNumber, totalPages) => {
            return `${pageNumber} / ${totalPages}`
        }} fixed />
        <View render={({ pageNumber }) => (
            pageNumber % 2 === 0 && (
                <View style={{ background: 'red' }}>
                    <Text>I'm only visible in odd pages!</Text>
                </View>
            )
        )} /> */}
      </Page>
    </Document>
  );
}
