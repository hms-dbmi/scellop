/**
 * ObsSets data structure from AnnData/Zarr format
 */
export type ObsSets = {
  version: string;
  datatype: string;
  tree: {
    name: string;
    children: {
      name: string;
      set: [unknown, unknown][];
    }[];
  }[];
};

/**
 * HuBMAP search API response structure
 */
interface HuBMAPSearchSource {
  uuid: string;
  hubmap_id: string;
  title: string;
  assay_display_name: string;
  anatomy_1: string[];
  anatomy_2: string[];
  donor: {
    mapped_metadata: {
      age_value: string[];
      age_unit: string[];
      height_value: string[];
      height_unit: string[];
      race: string[];
      sex: string[];
      weight_value: string[];
      weight_unit: string[];
      body_mass_index_value: string[];
      body_mass_index_unit: string[];
      medical_history: string[];
      cause_of_death: string[];
      mechanism_of_injury: string[];
      abo_blood_group_system: string[];
      death_event: string[];
    };
  };
}

export type HuBMAPSearchHit = {
  _id: string;
  _index?: string;
  _score?: number;
  _type?: string;
  _source: HuBMAPSearchSource;
};
