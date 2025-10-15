import { AnnDataSource, ObsSetsAnndataLoader } from "@vitessce/zarr";
import {
  DataOrdering,
  HuBMAPSearchHit,
  Metadata,
  ObsSets,
} from "../scellop-schema";
import { getCountsAndMetadataFromObsSetsList } from "./dataLoaders";
import { loadDataWithCounts } from "./dataWrangling";

export function loadHuBMAPData(uuids: string[], ordering?: DataOrdering) {
  const urls = uuids.map(getHubmapURL);

  const obsSetsListPromises = getPromiseData(urls);
  const obsSetsPromiseData = Promise.allSettled(obsSetsListPromises)
    .then((obsSetsListWrapped) => {
      // filter out rejected
      const obsSetsList = obsSetsListWrapped
        .filter((o) => o.status === "fulfilled")
        .map((o) => o.value.data.obsSets);
      const filtering = obsSetsListWrapped.map((o) =>
        o.status === "fulfilled" ? 1 : 0,
      );
      const uuidsRemoved = uuids.filter((_, index) => filtering[index] === 0);
      if (uuidsRemoved.length > 0) {
        console.warn(`The following uuids were removed: ${uuidsRemoved}`);
      }
      return [obsSetsList, filtering] as [ObsSets[], number[]];
    })
    .catch((error) => {
      console.error(error);
    });

  const hubmapData = Promise.all([
    obsSetsPromiseData,
    getPromiseMetadata(uuids),
  ])
    .then((values) => {
      if (values[0] && values[1]) {
        const obsSetsList = values[0][0];
        const filtering = values[0][1];
        const uuidsFiltered = uuids.filter(
          (_, index) => filtering[index] === 1,
        );
        const uuidToHubmapId = values[1][0];
        const hubmapIDsFiltered = uuidsFiltered.map(
          (uuid) => uuidToHubmapId[uuid],
        );
        const metadata = values[1][1];
        const { counts, metadata: datasetMetadata } =
          getCountsAndMetadataFromObsSetsList(obsSetsList, hubmapIDsFiltered);
        const data = loadDataWithCounts(counts, undefined, ordering);
        data.metadata = { rows: metadata, cols: datasetMetadata } as Metadata;
        return data;
      }
    })
    .catch((error) => {
      console.error(error);
    });

  return hubmapData;
}

// get hubmap url to zarr
function getHubmapURL(uuid: string) {
  return `https://assets.hubmapconsortium.org/${uuid}/hubmap_ui/anndata-zarr/secondary_analysis.zarr`;
}

// Get one Promise with all ObsSets
function getPromiseData(urls: string[]) {
  const obsSetsListPromises = [];
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const source = new AnnDataSource({ url, fileType: "obsSets.anndata.zarr" });
    const config = {
      url,
      fileType: "obsSets.anndata.zarr",
      options: {
        obsSets: [
          {
            name: "Cell Ontology CLID",
            path: "obs/predicted_CLID",
          },
          {
            name: "Cell Ontology Label",
            path: "obs/predicted_label",
          },
        ],
      },
      type: "obsSets",
    } as const;
    const loader = new ObsSetsAnndataLoader(source, config);
    obsSetsListPromises.push(loader.load());
  }
  return obsSetsListPromises;
}

// get metadata
function getPromiseMetadata(
  uuids: string[],
): Promise<
  | void
  | [Record<string, string>, Record<string, Record<string, string | number>>]
> {
  const searchApi = "https://search.api.hubmapconsortium.org/v3/portal/search";
  const queryBody = {
    size: 10000,
    query: { ids: { values: uuids } },
  };

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(queryBody),
  };

  const promiseMetadata = fetch(searchApi, requestOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((queryBody) => {
      const listAll = queryBody.hits.hits;
      const metadata = {} as Record<string, unknown>;
      const uuidToHubmapId = {} as Record<string, string>;
      for (let i = 0; i < listAll.length; i++) {
        const l = listAll[i] as HuBMAPSearchHit;
        const ls = l._source;
        const dmm = l._source.donor.mapped_metadata;
        uuidToHubmapId[ls.uuid] = ls.hubmap_id;
        metadata[ls.hubmap_id] = {
          title: ls?.title,
          assay: ls?.assay_display_name,
          anatomy: ls?.anatomy_2?.[0] ?? ls?.anatomy_1?.[0],
          donor_age: dmm?.age_value?.[0],
          donor_sex: dmm?.sex?.[0],
          donor_height: dmm?.height_value[0],
          donor_weight: dmm?.weight_value[0],
          donor_race: dmm?.race?.[0],
          donor_body_mass_index: dmm?.body_mass_index_value?.[0],
          donor_blood_group: dmm?.abo_blood_group_system?.[0],
          donor_medical_history: dmm?.medical_history?.[0],
          donor_cause_of_death: dmm?.cause_of_death?.[0],
          donor_death_event: dmm?.death_event?.[0],
          donor_mechanism_of_injury: dmm?.mechanism_of_injury?.[0],
        };
      }
      return [uuidToHubmapId, metadata] as [
        Record<string, string>,
        Record<string, Record<string, string | number>>,
      ];
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  return promiseMetadata;
}
