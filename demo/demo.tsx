import React, { useEffect, useState } from "react";
import { Scellop } from "../src/ScellopComponent";
import { loadHuBMAPData } from "../src/dataLoading/dataHuBMAP";
import { ScellopData } from "../src/scellop-schema";
import { testData } from "./testData";

import ScatterPlot from "@mui/icons-material/ScatterPlot";
import TableChartIcon from "@mui/icons-material/TableChartRounded";
import { GridSizeTuple } from "../src/contexts/DimensionsContext";

function Demo() {
  const [data, setData] = useState<ScellopData>(testData);

  // data
  const uuids = [
    "ad693f99fb9006e68a53e97598da1509",
    "173de2e80adf6a73ac8cff5ccce20dfc",
    "b95f34761c252ebbd1e482cd9afae73f",
    "5a5ca03fa623602d9a859224aa40ace4",
    "3c1b10bc912c60c9afc36b7423695236",
    "1dc16eb0270ff73291dd45b6a96aa3c0",
    "b05c21f9c94ce1a22a9694cd0fe0291e",
    "8cdb42ed1194255c74c8462b99bbd7ef",
    "fe0ded5fc0355c95239f9c040dd31e99",
    "367fee3b40cba682063289505b922be1",
    "b99fc30c4195958fbef217fa9ed9ec8f",
    "898138b7f45a67c574e9955fb400e9be",
    "f220c9e7bcaea3a87162cbe61287ea4d",
    "e5f7a14d93659bd0b8dc2819ffa9bc4b",
    "56cbda4789f04d79c0c3dffe21816d48",
    "0b6f63f2bd61a8c091fc7afc0f318ad1",
    "62efbe0a6abd0bcf53ab9ab29e7cd73f",
    "4b62d9d2c248323ce029859f953fdc57",
    "c81b0dc9d16eb825a7d6bce6e1b3678f",
    "5ee240959c96b49d960702755478b9fc",
    "7c9e07c96d144536525b1f889acee14d",
    "dd7ccbc306692fc5ff5e61c22845da21",
    "9a7e6be288b27ddbd3366c4ae41bbcd2",
    "018a905cdbdff684760859f594d3fd77",
    "af5741dad7aecf7960a129c3d2ae642a",
    "6e1db473492095ccc2f1393d7259b9c0",
    "fae9a1f2e7abefca2203765a3c7a5ba1",
    "8d631eee88855ac59155edca2a3bc1ca",
    "1ea6c0ac5ba60fe35bf63af8699b6fbe",
    "224e01ccfc20977ee5a6a6a5b96aa7d7",
    "33b9c54d7c295897826e1e5271d4fc24",
    "a48ab0bf5d8084da24859c4e64336e9c",
  ];

  // useEffect to make sure the data only loads once
  // The `!data` check allows us to plug in test data as desired
  useEffect(() => {
    if (!data) {
      loadHuBMAPData(uuids)
        .then((data) => {
          setData(data!);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        width: "90vw",
        height: "90vh",
        margin: "auto",
        marginTop: "5vh",
      }}
    >
      <Scellop
        data={data}
        theme={"light"}
        yAxis={{
          label: "Dataset",
          createHref: (row) =>
            `https://portal.hubmapconsortium.org/browse/${row}`,
          createSubtitle: (_, metadataValues) => {
            const anatomy = metadataValues?.["anatomy"];
            const assay = metadataValues?.["assay"];
            return `${anatomy} | ${assay}`;
          },
          icon: <TableChartIcon />,
        }}
        xAxis={{
          label: "Cell Type",
          createHref: (col) =>
            `https://www.ebi.ac.uk/ols4/search?q=${col}&ontology=cl`,
          createSubtitle: (_, metadataValues) => {
            return String(metadataValues?.["Cell Ontology Label"] ?? "");
          },
          icon: <ScatterPlot />,
        }}
        initialProportions={[
          [0.35, 0.55, 0.1] as GridSizeTuple,
          [0.3, 0.6, 0.1] as GridSizeTuple,
        ]}
        tooltipFields={["Cell Ontology Label"]}
      />
    </div>
  );
}

export default Demo;
