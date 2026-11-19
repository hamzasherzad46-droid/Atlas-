# Models

Compressed GLB files, named as in `content/catalog.json` (`model.file`).

- `skeleton.glb`: BodyParts3D 4.0, © The Database Center for Life Science, CC BY 4.0. Modified
  (bones selected and renamed, epicondyles split, approximate coccyx added, Draco-compressed) by
  `scripts/import-bodyparts3d.mjs`.

- `female-reproductive.glb` and `female-skin.glb`: the female body from the Human Reference Atlas
  3D Reference Object Library (HuBMAP, https://humanatlas.io/3d-reference-library), CC BY 4.0:
  - source: “3D Reference Organ Set for Female, v1.10” (the united female body),
    doi:10.48539/HBM637.DWBM.744, and “3D Reference Organ for Pelvis, Female v1.3”,
    doi:10.48539/HBM853.VCFM.778 (the united body has only the ilium; the pelvis set has the whole
    hip bone), both from the Visible Human female (U.S. National Library of Medicine);
  - authors: Kristen Browne and Heidi Schlehlein; publisher: HuBMAP;
  - licence: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), as stated in the HRA
    catalogue for both sets (`dct:license`), checked on 18 November 2026;
  - changes: structures selected and renamed (the HRA node, label and ontology id are kept in each
    mesh's extras), moved to stand on the floor (feet at y = 0), simplified and Draco-compressed by
    `scripts/import-hra-female.py` and `scripts/convert-model.sh` (skin `SIMPLIFY_RATIO=0.15
    SIMPLIFY_ERROR=0.001`, organs and pelvis `SIMPLIFY_RATIO=0.08 SIMPLIFY_ERROR=0.0008`).

If a module's GLB is missing, the app renders primitive placeholders from
`content/<module>.placeholder.json`, so the quiz still works.

See "3D models" in the project README for converting Z-Anatomy files.
Models from Z-Anatomy / BodyParts3D are CC BY-SA, and the female body is CC BY: keep the Credits screen attribution.
