#!/usr/bin/env python3
"""
Build the female models from the Human Reference Atlas (HRA) 3D Reference Object Library
(HuBMAP; https://humanatlas.io/3d-reference-library), both CC BY 4.0, by Kristen Browne and
Heidi Schlehlein, from the Visible Human female:
  - "3D Reference Organ Set for Female, v1.10" (united female), doi:10.48539/HBM637.DWBM.744
    https://cdn.humanatlas.io/digital-objects/ref-organ/united-female/v1.10/assets/3D-VH-F-United.glb
  - "3D Reference Organ for Pelvis, Female v1.3", doi:10.48539/HBM853.VCFM.778 (the united file
    has only the ilium; this one has the whole hip bone: ilium, ischium and pubis)
    https://cdn.humanatlas.io/digital-objects/ref-organ/pelvis-female/v1.3/assets/3d-vh-f-pelvis.glb
The two share one coordinate frame (checked: identical vertices for the bones they both have).

  python3 -I scripts/import-hra-female.py <3D-VH-F-United.glb> <3d-vh-f-pelvis.glb> <out-dir> [--source-build]
  SIMPLIFY_RATIO=… scripts/convert-model.sh <out-dir>/<name>-raw.glb <name>   # see README "3D models"

What it does, with numpy only:
  - picks the nodes listed in PARTS below, composes each node's world transform, and writes one
    mesh per structure under the mesh name used by content (e.g. "uterus_fundus"); the HRA node
    name, label and ontology id go into the node's extras, so every mesh can be traced back;
  - moves the body into atlas space: metres, Y up, the body facing +Z, its left at +X (HRA already
    uses these axes), feet at y = 0 and centred on x = 0 and the pelvis on z = 0 like the male model;
  - keeps positions and indices only (normals are recomputed in the app);
  - makes the skin leaner (scripts/hra_lean.py): the Visible Human female carried a lot of fat, so
    the skin is moved inwards over the soft tissue, towards the bones and organs, which do not move;
    the head, hands, feet and breasts are unchanged. --source-build keeps the skin as in the HRA file.
Nothing is drawn or invented: every vertex comes from the HRA file (the skin's vertices moved).
"""
import json
import re
import struct
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import hra_lean  # noqa: E402

# Output file -> { mesh name: [HRA node names whose meshes are merged into it] }.
PARTS = {
    'female-skin': {'skin': ['VH_F_skin']},
    'female-reproductive': {
        # The bony pelvis, from the pelvis file (outer compact bone; the spongy bone inside is not needed).
        'ilium.r': ['pelvis:VH_F_ilium_compact_bone_R'],
        'ilium.l': ['pelvis:VH_F_ilium_compact_bone_L'],
        'ischium.r': ['pelvis:VH_F_ischium_compact_bone_R'],
        'ischium.l': ['pelvis:VH_F_ischium_compact_bone_L'],
        'pubis.r': ['pelvis:VH_F_pubis_compact_bone_R'],
        'pubis.l': ['pelvis:VH_F_pubis_compact_bone_L'],
        'sacrum': ['pelvis:VH_F_sacrum'],
        'coccyx': ['pelvis:VH_F_coccyx'],
        'uterus_fundus': ['VH_F_fundus_of_uterus'],
        'uterus_body': ['VH_F_body_of_uterus', 'VH_F_anterior_wall_of_uterus', 'VH_F_posterior_wall_of_uterus', 'VH_F_lower_uterine_segment'],
        'cervix': ['VH_F_cervix', 'VH_F_internal_cervical_os', 'VH_F_external_cervical_os'],
        'vagina': ['VH_F_vagina', 'VH_F_cervicovaginal_junction'],
        'ovary.l': ['VH_F_left_ovary'],
        'ovary.r': ['VH_F_right_ovary'],
        'uterine_tube_infundibulum.l': ['VH_F_uterine_tube_infundibulum_L', 'VH_F_fibria_of_uterine_tube_L'],
        'uterine_tube_infundibulum.r': ['VH_F_uterine_tube_infundibulum_R', 'VH_F_fibria_of_uterine_tube_R'],
        'uterine_tube_ampulla.l': ['VH_F_ampulla_of_uterine_tube_L'],
        'uterine_tube_ampulla.r': ['VH_F_ampulla_of_uterine_tube_R'],
        'uterine_tube_isthmus.l': ['VH_F_isthmus_of_fallopian_tube_L'],
        'uterine_tube_isthmus.r': ['VH_F_isthmus_of_fallopian_tube_R'],
        'round_ligament.l': ['VH_F_left_round_ligament_of_uterus'],
        'round_ligament.r': ['VH_F_right_round_ligament_of_uterus'],
        'ovarian_ligament.l': ['VH_F_ovarian_ligament_L'],
        'ovarian_ligament.r': ['VH_F_ovarian_ligament_R'],
        'urinary_bladder': ['VH_F_fundus_of_urinary_bladder_dome', 'VH_F_fundus_of_urinary_bladder_base', 'VH_F_trigone_of_urinary_bladder', 'VH_F_urinary_bladder_neck_smooth_muscle'],
        'mammary_lobes.l': ['VH_F_mammary_lobes_L'],
        'mammary_lobes.r': ['VH_F_mammary_lobes_R'],
        'lactiferous_ducts.l': ['VH_F_main_lactiferous_ducts_L', 'VH_F_main_lactiferous_sinuses_L'],
        'lactiferous_ducts.r': ['VH_F_main_lactiferous_ducts_R', 'VH_F_main_lactiferous_sinuses_R'],
        'nipple.l': ['VH_F_nipple_L'],
        'nipple.r': ['VH_F_nipple_R'],
        'areola.l': ['VH_F_areola_L', 'VH_F_areolar_tubercles_L'],
        'areola.r': ['VH_F_areola_R', 'VH_F_areolar_tubercles_R'],
        'breast_fat.l': ['VH_F_fat_L'],
        'breast_fat.r': ['VH_F_fat_R'],
    },
}

COMPONENT = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
WIDTH = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}


def read_glb(path):
    data = Path(path).read_bytes()
    magic, _, _ = struct.unpack_from('<III', data, 0)
    assert magic == 0x46546C67, 'not a GLB'
    off = 12
    doc, binary = None, None
    while off < len(data):
        length, kind = struct.unpack_from('<II', data, off)
        chunk = data[off + 8 : off + 8 + length]
        if kind == 0x4E4F534A:
            doc = json.loads(chunk)
        elif kind == 0x004E4942:
            binary = chunk
        off += 8 + length
    return doc, binary


def accessor(doc, binary, i):
    a = doc['accessors'][i]
    view = doc['bufferViews'][a['bufferView']]
    dtype = COMPONENT[a['componentType']]
    n = WIDTH[a['type']]
    start = view.get('byteOffset', 0) + a.get('byteOffset', 0)
    stride = view.get('byteStride')
    itemsize = np.dtype(dtype).itemsize * n
    if stride and stride != itemsize:
        raw = np.frombuffer(binary, dtype=np.uint8, count=stride * a['count'], offset=start).reshape(a['count'], stride)
        return raw[:, :itemsize].copy().view(dtype).reshape(a['count'], n)
    return np.frombuffer(binary, dtype=dtype, count=a['count'] * n, offset=start).reshape(a['count'], n)


def trs(node):
    if 'matrix' in node:
        return np.array(node['matrix'], dtype=np.float64).reshape(4, 4).T
    t = np.array(node.get('translation', [0, 0, 0]), dtype=np.float64)
    x, y, z, w = node.get('rotation', [0, 0, 0, 1])
    s = np.array(node.get('scale', [1, 1, 1]), dtype=np.float64)
    r = np.array(
        [
            [1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
            [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
            [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)],
        ]
    )
    m = np.eye(4)
    m[:3, :3] = r * s
    m[:3, 3] = t
    return m


def world_matrices(doc):
    out = {}
    parent = {}
    for i, n in enumerate(doc['nodes']):
        for c in n.get('children', []):
            parent[c] = i

    def world(i):
        if i not in out:
            m = trs(doc['nodes'][i])
            out[i] = world(parent[i]) @ m if i in parent else m
        return out[i]

    for i in range(len(doc['nodes'])):
        world(i)
    return out


def geometry(doc, binary, worlds, index):
    node = doc['nodes'][index]
    positions, indices, base = [], [], 0
    for p in doc['meshes'][node['mesh']]['primitives']:
        assert p.get('mode', 4) == 4, 'triangles only'
        pos = accessor(doc, binary, p['attributes']['POSITION']).astype(np.float64)
        pos = (np.c_[pos, np.ones(len(pos))] @ worlds[index].T)[:, :3]
        idx = accessor(doc, binary, p['indices']).reshape(-1).astype(np.uint32) if 'indices' in p else np.arange(len(pos), dtype=np.uint32)
        # A mirrored transform flips the winding; keep triangles facing outwards.
        if np.linalg.det(worlds[index][:3, :3]) < 0:
            idx = idx.reshape(-1, 3)[:, ::-1].reshape(-1)
        positions.append(pos)
        indices.append(idx + base)
        base += len(pos)
    return np.vstack(positions), np.concatenate(indices)


def write_glb(path, meshes):
    """meshes: list of (name, positions float32 Nx3, indices uint32, extras)."""
    blob = bytearray()
    doc = {'asset': {'version': '2.0', 'generator': 'scripts/import-hra-female.py'}, 'scene': 0, 'scenes': [{'nodes': []}], 'nodes': [], 'meshes': [], 'accessors': [], 'bufferViews': []}
    for name, pos, idx, extras in meshes:
        pos = pos.astype(np.float32)
        idx = idx.astype(np.uint32)
        for arr, target, kind in ((pos, 34962, 'VEC3'), (idx, 34963, 'SCALAR')):
            while len(blob) % 4:
                blob.append(0)
            doc['bufferViews'].append({'buffer': 0, 'byteOffset': len(blob), 'byteLength': arr.nbytes, 'target': target})
            blob += arr.tobytes()
            acc = {'bufferView': len(doc['bufferViews']) - 1, 'componentType': 5126 if kind == 'VEC3' else 5125, 'count': len(arr) if kind == 'VEC3' else arr.size, 'type': kind}
            if kind == 'VEC3':
                acc['min'] = pos.min(axis=0).tolist()
                acc['max'] = pos.max(axis=0).tolist()
            doc['accessors'].append(acc)
        a = len(doc['accessors'])
        doc['meshes'].append({'name': name, 'primitives': [{'attributes': {'POSITION': a - 2}, 'indices': a - 1}]})
        doc['nodes'].append({'name': name, 'mesh': len(doc['meshes']) - 1, 'extras': extras})
        doc['scenes'][0]['nodes'].append(len(doc['nodes']) - 1)
    doc['buffers'] = [{'byteLength': len(blob)}]
    js = json.dumps(doc, separators=(',', ':')).encode()
    js += b' ' * (-len(js) % 4)
    blob += b'\0' * (-len(blob) % 4)
    out = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(blob))
    out += struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(blob), 0x004E4942) + bytes(blob)
    Path(path).write_bytes(out)


def main():
    src, pelvis_src, out_dir = sys.argv[1], sys.argv[2], Path(sys.argv[3])
    out_dir.mkdir(parents=True, exist_ok=True)
    doc, binary = read_glb(src)
    worlds = world_matrices(doc)
    by_name = {n.get('name'): i for i, n in enumerate(doc['nodes'])}
    pdoc, pbinary = read_glb(pelvis_src)
    pworlds = world_matrices(pdoc)
    pby_name = {n.get('name'): i for i, n in enumerate(pdoc['nodes'])}

    def source(name):
        """(doc, binary, worlds, node index) for 'pelvis:<node>' or '<node>' in the united file."""
        if name.startswith('pelvis:'):
            n = name.split(':', 1)[1]
            return (pdoc, pbinary, pworlds, pby_name[n]) if n in pby_name else None
        return (doc, binary, worlds, by_name[name]) if name in by_name else None

    # Atlas space: feet at y = 0, centred left to right on the skin, and front to back on the pelvis.
    skin_pos, _ = geometry(doc, binary, worlds, by_name['VH_F_skin'])
    sacrum_pos, _ = geometry(doc, binary, worlds, by_name['VH_F_sacrum'])
    hips = np.vstack([geometry(doc, binary, worlds, by_name[n])[0] for n in ('VH_F_ilium_compact_bone_R', 'VH_F_ilium_compact_bone_L')])
    shift = np.array([-(skin_pos[:, 0].min() + skin_pos[:, 0].max()) / 2, -skin_pos[:, 1].min(), -(np.vstack([hips, sacrum_pos])[:, 2].min() + hips[:, 2].max()) / 2])
    height = skin_pos[:, 1].max() - skin_pos[:, 1].min()
    print(f'skin height {height:.3f} m; shift {np.round(shift, 4).tolist()}')

    built = {}
    for file, parts in PARTS.items():
        meshes = []
        for name, sources in parts.items():
            pos_all, idx_all, base, found = [], [], 0, []
            for s in sources:
                src_ = source(s)
                if not src_ or 'mesh' not in src_[0]['nodes'][src_[3]]:
                    print(f'  missing: {s}')
                    continue
                pos, idx = geometry(*src_)
                pos_all.append(pos + shift)
                idx_all.append(idx + base)
                base += len(pos)
                e = src_[0]['nodes'][src_[3]].get('extras', {})
                found.append({'hra': s.split(':')[-1], 'file': 'pelvis-female v1.3' if s.startswith('pelvis:') else 'united-female v1.10', 'label': e.get('label'), 'ontology': e.get('ontologyid')})
            if not pos_all:
                continue
            pos = np.vstack(pos_all)
            meshes.append((name, pos, np.concatenate(idx_all), {'source': 'Human Reference Atlas, HuBMAP (CC BY 4.0)', 'parts': found}))
            size = pos.max(axis=0) - pos.min(axis=0)
            print(f'  {file}: {name:30s} {len(pos):7d} verts  size {np.round(size * 100, 1).tolist()} cm')
        built[file] = meshes

    if '--source-build' not in sys.argv:
        print('leaner skin (scripts/hra_lean.py)')
        united = {n: geometry(doc, binary, worlds, i)[0] + shift for n, i in by_name.items() if n and 'mesh' in doc['nodes'][i] and any(re.search(rx, n) for _, rx in hra_lean.CORE)}
        pelvis_nodes = {n: geometry(pdoc, pbinary, pworlds, i)[0] + shift for n, i in pby_name.items() if n and 'mesh' in pdoc['nodes'][i] and re.search(hra_lean.PELVIS_CORE[1], n)}
        core, labels = hra_lean.core_points(united, pelvis_nodes)
        # The areolae, nipples and ducts lie on the skin, which does not move there.
        shipped = np.vstack([pos for name, pos, _, _ in built['female-reproductive'] if not name.startswith(('nipple', 'areola', 'lactiferous'))])
        name, pos, idx, extras = built['female-skin'][0]
        lean_pos, lean_tri, summary = hra_lean.lean_skin(pos, idx, core, labels, shipped)
        extras = {**extras, 'changes': 'made leaner by scripts/hra_lean.py: ' + summary}
        built['female-skin'][0] = (name, lean_pos, lean_tri.reshape(-1), extras)

    for file, meshes in built.items():
        write_glb(out_dir / f'{file}-raw.glb', meshes)
        print(f'{file}-raw.glb written')


if __name__ == '__main__':
    main()
