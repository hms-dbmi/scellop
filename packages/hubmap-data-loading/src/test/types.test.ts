import { describe, expect, it } from "vitest";
import type { HuBMAPSearchHit, ObsSets } from "../types";

describe("types", () => {
  describe("ObsSets type", () => {
    it("should accept valid ObsSets structure", () => {
      const obsSets: ObsSets = {
        version: "0.1.0",
        datatype: "obs-sets",
        tree: [
          {
            name: "Cell Ontology CLID",
            children: [
              {
                name: "CL:0000084",
                set: [[0], [1], [2]],
              },
              {
                name: "CL:0000236",
                set: [[3], [4]],
              },
            ],
          },
        ],
      };

      expect(obsSets.version).toBe("0.1.0");
      expect(obsSets.datatype).toBe("obs-sets");
      expect(obsSets.tree).toHaveLength(1);
      expect(obsSets.tree[0].children).toHaveLength(2);
    });

    it("should accept multiple trees in ObsSets", () => {
      const obsSets: ObsSets = {
        version: "0.1.0",
        datatype: "obs-sets",
        tree: [
          {
            name: "Cell Ontology CLID",
            children: [
              {
                name: "CL:0000001",
                set: [[0], [1]],
              },
            ],
          },
          {
            name: "Cell Ontology Label",
            children: [
              {
                name: "T cell",
                set: [[0], [1]],
              },
            ],
          },
        ],
      };

      expect(obsSets.tree).toHaveLength(2);
      expect(obsSets.tree[0].name).toBe("Cell Ontology CLID");
      expect(obsSets.tree[1].name).toBe("Cell Ontology Label");
    });

    it("should accept empty children array", () => {
      const obsSets: ObsSets = {
        version: "0.1.0",
        datatype: "obs-sets",
        tree: [
          {
            name: "Cell Ontology CLID",
            children: [],
          },
        ],
      };

      expect(obsSets.tree[0].children).toHaveLength(0);
    });

    it("should accept empty set array", () => {
      const obsSets: ObsSets = {
        version: "0.1.0",
        datatype: "obs-sets",
        tree: [
          {
            name: "Cell Ontology CLID",
            children: [
              {
                name: "CL:0000001",
                set: [],
              },
            ],
          },
        ],
      };

      expect(obsSets.tree[0].children[0].set).toHaveLength(0);
    });
  });

  describe("HuBMAPSearchHit type", () => {
    it("should accept valid HuBMAP search result structure", () => {
      const searchHit: HuBMAPSearchHit = {
        _id: "test-id-123",
        _index: "hm_consortium_portal",
        _score: 1.0,
        _type: "_doc",
        _source: {
          uuid: "abc123def456",
          hubmap_id: "HBM123.ABCD.456",
          title: "Test Dataset",
          assay_display_name: "scRNA-seq",
          anatomy_1: ["Blood"],
          anatomy_2: ["Peripheral blood"],
          donor: {
            mapped_metadata: {
              age_value: ["45"],
              age_unit: ["years"],
              height_value: ["175"],
              height_unit: ["cm"],
              race: ["White"],
              sex: ["Male"],
              weight_value: ["75"],
              weight_unit: ["kg"],
              body_mass_index_value: ["24.5"],
              body_mass_index_unit: ["kg/m^2"],
              medical_history: ["None"],
              cause_of_death: ["N/A"],
              mechanism_of_injury: ["N/A"],
              abo_blood_group_system: ["O+"],
              death_event: ["N/A"],
            },
          },
        },
      };

      expect(searchHit._id).toBe("test-id-123");
      expect(searchHit._source.uuid).toBe("abc123def456");
      expect(searchHit._source.hubmap_id).toBe("HBM123.ABCD.456");
    });

    it("should accept minimal HuBMAP search result", () => {
      const searchHit: HuBMAPSearchHit = {
        _id: "test-id",
        _source: {
          uuid: "uuid-123",
          hubmap_id: "HBM001",
          title: "Dataset",
          assay_display_name: "scRNA-seq",
          anatomy_1: [],
          anatomy_2: [],
          donor: {
            mapped_metadata: {
              age_value: [],
              age_unit: [],
              height_value: [],
              height_unit: [],
              race: [],
              sex: [],
              weight_value: [],
              weight_unit: [],
              body_mass_index_value: [],
              body_mass_index_unit: [],
              medical_history: [],
              cause_of_death: [],
              mechanism_of_injury: [],
              abo_blood_group_system: [],
              death_event: [],
            },
          },
        },
      };

      expect(searchHit._source.anatomy_1).toHaveLength(0);
      expect(searchHit._source.donor.mapped_metadata.age_value).toHaveLength(0);
    });

    it("should accept donor metadata with multiple values", () => {
      const searchHit: HuBMAPSearchHit = {
        _id: "test",
        _source: {
          uuid: "uuid",
          hubmap_id: "HBM",
          title: "Test",
          assay_display_name: "scRNA-seq",
          anatomy_1: ["Tissue1", "Tissue2"],
          anatomy_2: ["SubTissue1", "SubTissue2"],
          donor: {
            mapped_metadata: {
              age_value: ["45", "46"],
              age_unit: ["years"],
              height_value: ["175"],
              height_unit: ["cm"],
              race: ["White", "Asian"],
              sex: ["Male"],
              weight_value: ["75"],
              weight_unit: ["kg"],
              body_mass_index_value: ["24.5"],
              body_mass_index_unit: ["kg/m^2"],
              medical_history: ["Condition1", "Condition2"],
              cause_of_death: ["N/A"],
              mechanism_of_injury: ["N/A"],
              abo_blood_group_system: ["O+"],
              death_event: ["N/A"],
            },
          },
        },
      };

      expect(searchHit._source.anatomy_1).toHaveLength(2);
      expect(
        searchHit._source.donor.mapped_metadata.medical_history,
      ).toHaveLength(2);
    });

    it("should support complete donor metadata fields", () => {
      const searchHit: HuBMAPSearchHit = {
        _id: "complete-test",
        _source: {
          uuid: "complete-uuid",
          hubmap_id: "HBM.COMPLETE.123",
          title: "Complete Dataset",
          assay_display_name: "scRNA-seq [10x Genomics]",
          anatomy_1: ["Kidney"],
          anatomy_2: ["Renal cortex"],
          donor: {
            mapped_metadata: {
              age_value: ["62"],
              age_unit: ["years"],
              height_value: ["180"],
              height_unit: ["cm"],
              race: ["Black or African American"],
              sex: ["Female"],
              weight_value: ["85"],
              weight_unit: ["kg"],
              body_mass_index_value: ["26.2"],
              body_mass_index_unit: ["kg/m^2"],
              medical_history: ["Hypertension", "Type 2 Diabetes"],
              cause_of_death: ["Cardiovascular disease"],
              mechanism_of_injury: ["Natural causes"],
              abo_blood_group_system: ["A+"],
              death_event: ["Expected"],
            },
          },
        },
      };

      const metadata = searchHit._source.donor.mapped_metadata;
      expect(metadata.age_value[0]).toBe("62");
      expect(metadata.sex[0]).toBe("Female");
      expect(metadata.abo_blood_group_system[0]).toBe("A+");
      expect(metadata.cause_of_death[0]).toBe("Cardiovascular disease");
    });
  });

  describe("Integration: Complete data flow types", () => {
    it("should represent complete HuBMAP API response with ObsSets", () => {
      const obsSets: ObsSets = {
        version: "0.1.0",
        datatype: "obs-sets",
        tree: [
          {
            name: "Cell Ontology CLID",
            children: [
              {
                name: "CL:0000084",
                set: [[0], [1], [2], [3]],
              },
              {
                name: "CL:0000236",
                set: [[4], [5]],
              },
            ],
          },
          {
            name: "Cell Ontology Label",
            children: [
              {
                name: "T cell",
                set: [[0], [1], [2], [3]],
              },
              {
                name: "B cell",
                set: [[4], [5]],
              },
            ],
          },
        ],
      };

      const searchHit: HuBMAPSearchHit = {
        _id: "integrated-test",
        _source: {
          uuid: "integration-uuid-123",
          hubmap_id: "HBM789.XYZ.123",
          title: "Integrated Test Dataset",
          assay_display_name: "scRNA-seq",
          anatomy_1: ["PBMC"],
          anatomy_2: ["Peripheral blood mononuclear cells"],
          donor: {
            mapped_metadata: {
              age_value: ["35"],
              age_unit: ["years"],
              height_value: ["170"],
              height_unit: ["cm"],
              race: ["White"],
              sex: ["Male"],
              weight_value: ["70"],
              weight_unit: ["kg"],
              body_mass_index_value: ["24.2"],
              body_mass_index_unit: ["kg/m^2"],
              medical_history: ["None"],
              cause_of_death: ["N/A"],
              mechanism_of_injury: ["N/A"],
              abo_blood_group_system: ["O+"],
              death_event: ["N/A"],
            },
          },
        },
      };

      // Verify both types work together
      expect(obsSets.tree[0].children).toHaveLength(2);
      expect(searchHit._source.hubmap_id).toBe("HBM789.XYZ.123");

      // These would be linked in the actual data flow
      const cellTypeCount = obsSets.tree[0].children[0].set.length;
      const donorAge = searchHit._source.donor.mapped_metadata.age_value[0];

      expect(cellTypeCount).toBe(4);
      expect(donorAge).toBe("35");
    });
  });
});
