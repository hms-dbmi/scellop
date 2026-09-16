import {
  BaseDataLoader,
  type DataLoaderParams,
  type DataOrdering,
  loadDataWithCounts,
  type Metadata,
  type ScellopData,
} from "@scellop/data-loading";
import { AnnDataSource, ObsSetsAnndataLoader } from "@vitessce/zarr";
import type { HuBMAPSearchHit } from "./types";
import { getCountsAndMetadataFromObsSetsList } from "./utils";

/**
 * Parameters for HuBMAP data loader
 */
export interface HuBMAPDataLoaderParams extends DataLoaderParams {
  /** Array of HuBMAP dataset UUIDs to load */
  uuids: string[];
  /** Optional ordering for rows and columns */
  ordering?: DataOrdering;
}

/**
 * Data loader for HuBMAP portal datasets.
 * Fetches data from HuBMAP via Zarr format and converts to ScellopData.
 */
export class HuBMAPDataLoader extends BaseDataLoader<HuBMAPDataLoaderParams> {
  async load(params: HuBMAPDataLoaderParams): Promise<ScellopData | undefined> {
    this.validateParams(params);

    const { uuids, ordering } = params;
    const urls = uuids.map(getHubmapURL);

    try {
      const obsSetsListPromises = getPromiseData(urls);
      const obsSetsPromiseData = await Promise.allSettled(obsSetsListPromises);

      // Filter out rejected promises
      const obsSetsList = obsSetsPromiseData
        .filter((o) => o.status === "fulfilled")
        .map((o) => o.value.data.obsSets);

      const filtering = obsSetsPromiseData.map((o) =>
        o.status === "fulfilled" ? 1 : 0,
      );

      const uuidsRemoved = uuids.filter((_, index) => filtering[index] === 0);
      if (uuidsRemoved.length > 0) {
        console.warn(`The following uuids were removed: ${uuidsRemoved}`);
      }

      const metadataResult = await getPromiseMetadata(uuids);
      if (!metadataResult) {
        throw new Error("Failed to fetch metadata");
      }

      const uuidsFiltered = uuids.filter((_, index) => filtering[index] === 1);
      const [uuidToHubmapId, metadata] = metadataResult;
      const hubmapIDsFiltered = uuidsFiltered.map(
        (uuid) => uuidToHubmapId[uuid],
      );

      const { counts, metadata: datasetMetadata } =
        getCountsAndMetadataFromObsSetsList(obsSetsList, hubmapIDsFiltered);

      const data = loadDataWithCounts(counts, undefined, ordering);
      data.metadata = { rows: metadata, cols: datasetMetadata } as Metadata;

      return data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  protected validateParams(params: HuBMAPDataLoaderParams): void {
    super.validateParams(params);
    if (
      !params.uuids ||
      !Array.isArray(params.uuids) ||
      params.uuids.length === 0
    ) {
      throw new Error("Invalid parameters: uuids must be a non-empty array");
    }
  }
}

/**
 * Convenience function for loading HuBMAP data.
 * Creates a HuBMAPDataLoader instance and loads data.
 *
 * @param uuids - Array of HuBMAP dataset UUIDs
 * @param ordering - Optional ordering for rows and columns
 * @returns Promise resolving to ScellopData or undefined
 */
export function loadHuBMAPData(
  uuids: string[],
  ordering?: DataOrdering,
): Promise<ScellopData | undefined> {
  const loader = new HuBMAPDataLoader();
  return loader.load({ uuids, ordering });
}

// Get HuBMAP URL to Zarr
function getHubmapURL(uuid: string): string {
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

// Get metadata from HuBMAP search API
function getPromiseMetadata(
  uuids: string[],
): Promise<
  | undefined
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
      return undefined;
    });
  return promiseMetadata;
}
