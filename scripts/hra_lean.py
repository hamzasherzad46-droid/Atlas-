"""
A leaner build of the Human Reference Atlas female skin (numpy only; used by import-hra-female.py).

The Visible Human female, on which the HRA female is built, carried a lot of subcutaneous and
abdominal fat. This makes the outer body lean without touching anything inside it: the bones and
organs stay exactly where they are, and only the skin moves inwards, over the soft tissue between
it and the structures beneath.

  1. Depth. For every skin vertex, the distance to the nearest internal structure of the HRA female
     (vertebrae, sacrum, hip bones, femurs, tibias, fibulas, patellae, sternum, heart and great
     vessels, abdominal and pelvic organs, breasts, brain and eyes). The arms have no bones in the
     source, so their centre lines, traced from cross-sections, stand in for them.
  2. Reduction. Each region keeps a lean depth in full and a share of the depth beyond it
     (PARAMS: by the structure underneath and whether the skin lies in front of it, beside it or
     behind it). The reduction is smoothed over the body, so regions blend without a seam, and moves
     along a smoothed inward direction, so the navel, folds and creases keep their shape.
  3. Untouched. The head, hands, feet and breasts (whose areolae and nipples are separate meshes
     lying on the skin) do not change; the change fades out well before them.
  4. Limits. The skin never comes closer than 8 mm to any structure, and a last check takes it back
     wherever anything inside would come within 4 mm of it (or closer than it was in the source).
  5. Surface. The scan's skin folds are smoothed (Taubin smoothing, which keeps volume), gently on
     the head, hands and feet and not at all where the areolae lie.

Nothing is added: every vertex is a source vertex, moved; the mesh keeps its triangles.
"""
import re

import numpy as np

# label -> regex on HRA node names. 'hipbone' comes from the pelvis file.
CORE = [
    ('vertebra', r'VH_F_(cervical|thoracic|lumbar)_vertebra_\d+$|VH_F_sacrum$|VH_F_coccyx$'),
    ('femur', r'VH_F_femur_[LR]$|condyle.*femur|femur.*condyle'),
    ('leg', r'VH_F_(tibia|fibula|patella)_[LR]$'),
    ('sternum', r'VH_F_sternum$'),
    ('chest', r'VH_F_(ascending_aorta|superior_vena_cava|trachea|thymus_lobe_[LR])$|pulmonary_(trunk|artery_[LR])$'),
    ('heart', r'VH_F_(left|right)_(ventricle|atrium)|VH_F_.*myocardium|VH_F_heart'),
    ('abdomen', r'VH_F_(transverse|ascending|descending|sigmoid)_colon$|VH_F_ileum$|VH_F_(diaphragmatic|visceral)_surface_of_(liver|spleen)|VH_F_(right|left)_lobe_of_liver|VH_F_(head|body|tail)_of_pancreas$|VH_F_kidney_capsule_[LR]$|VH_F_duodenum_|VH_F_cecum|VH_F_rectum|VH_F_jejunum|VH_F_stomach|VH_F_.*_of_stomach$'),
    ('pelvic', r'VH_F_(fundus|body)_of_uterus$|VH_F_fundus_of_urinary_bladder_dome$|VH_F_vagina$'),
    ('breast', r'VH_F_(fat|mammary_lobes|nipple|areola)_[LR]$'),
    ('head', r'Allen_white_matter_of_(fore|hind)brain_[LR]$|VH_F_vitreous_humor_[LR]$|VH_F_thyroid_cartilage$'),
]
PELVIS_CORE = ('hipbone', r'VH_F_(ilium|ischium|pubis)_compact_bone_[LR]$')
ARMS = ['shoulder', 'upperarm', 'forearm', 'hand']
NAMES = [c[0] for c in CORE] + [PELVIS_CORE[0]] + ARMS

# (lean depth kept in full, cm; share of the depth beyond it that stays), by the direction from the
# structure to the skin where that matters: front, side, back.
PARAMS = {
    'vertebra': {'front': (1.0, 0.72), 'side': (3.0, 0.7), 'back': (1.0, 0.75)},
    'femur': (3.0, 0.66),
    'leg': (0.6, 0.84),
    'sternum': (1.0, 0.9),
    'chest': (1.5, 0.9),
    'heart': (2.0, 1.0),  # the side of the chest: no ribs or lungs in the source to measure from
    'abdomen': {'front': (1.8, 0.12), 'side': (1.6, 0.2), 'back': (4.0, 0.62)},
    'pelvic': {'front': (1.8, 0.15), 'side': (2.0, 0.4), 'back': (3.0, 0.7)},
    'breast': (0.0, 1.0),
    'head': (0.0, 1.0),
    'hipbone': {'front': (1.8, 0.2), 'side': (2.0, 0.45), 'back': (4.0, 0.8)},
    'shoulder': (2.5, 0.85),
    'upperarm': (2.5, 0.64),
    'forearm': (1.8, 0.85),
    'hand': (0.0, 1.0),
}
MIN_GAP = 0.008  # the skin never comes closer than this to any structure
CHECK_GAP = 0.004  # the last check: nothing inside within this of the skin


def core_points(united, pelvis, cell=0.004):
    """{name: positions} (atlas space) of the united file's meshes and the pelvis file's. Returns points, labels."""
    pts, labs = [], []
    for li, (_, rx) in enumerate(CORE + [PELVIS_CORE]):
        for name, pos in (pelvis if li == len(CORE) else united).items():
            if re.search(rx, name):
                pts.append(pos)
                labs.append(np.full(len(pos), li))
    P, L = np.vstack(pts), np.concatenate(labs)
    _, first = np.unique(np.floor(P / cell).astype(np.int64), axis=0, return_index=True)
    return P[first], L[first]


# --- mesh helpers -------------------------------------------------------------------------------

def weld(pos, tri):
    k = np.round(pos / 1e-6).astype(np.int64)
    _, first, inv = np.unique(k, axis=0, return_index=True, return_inverse=True)
    return pos[first], inv.reshape(-1)[tri]


def edges_of(tri):
    e = np.sort(np.vstack([tri[:, [0, 1]], tri[:, [1, 2]], tri[:, [2, 0]]]), axis=1)
    return np.unique(e, axis=0)


def neighbour_mean(x, e, deg):
    acc = np.zeros_like(x)
    np.add.at(acc, e[:, 0], x[e[:, 1]])
    np.add.at(acc, e[:, 1], x[e[:, 0]])
    return acc / deg.reshape(-1, *([1] * (x.ndim - 1)))


def diffuse(x, e, deg, n):
    for _ in range(n):
        x = 0.5 * x + 0.5 * neighbour_mean(x, e, deg)
    return x


def taubin(p, e, deg, n, w, lam=0.5, mu=-0.53):
    for _ in range(n):
        for f in (lam, mu):
            p = p + f * (neighbour_mean(p, e, deg) - p) * w[:, None]
    return p


def normals(p, tri):
    fn = np.cross(p[tri[:, 1]] - p[tri[:, 0]], p[tri[:, 2]] - p[tri[:, 0]])
    vn = np.zeros_like(p)
    for i in range(3):
        np.add.at(vn, tri[:, i], fn)
    return vn / np.linalg.norm(vn, axis=1, keepdims=True)


def ramp(x, a, b):
    return np.clip((x - a) / (b - a), 0, 1)


class Nearest:
    """Nearest point of a set for any query, through a jump-flooded voxel grid."""

    def __init__(self, P, lo, hi, h=0.006):
        self.P, self.h, self.lo = P, h, np.asarray(lo, float)
        self.n = np.ceil((np.asarray(hi) - self.lo) / h).astype(int) + 1
        g = np.full(tuple(self.n), -1, np.int64)
        k = np.clip(np.floor((P - self.lo) / h).astype(int), 0, self.n - 1)
        g[k[:, 0], k[:, 1], k[:, 2]] = np.arange(len(P))
        C = (np.indices(tuple(self.n), dtype=np.float32) * h).transpose(1, 2, 3, 0) + self.lo.astype(np.float32)
        Pf = P.astype(np.float32)

        def dist(idx):
            d = np.full(idx.shape, np.inf, np.float32)
            m = idx >= 0
            d[m] = ((Pf[idx[m]] - C[m]) ** 2).sum(-1)
            return d

        best = dist(g)
        step, steps = 1 << int(np.ceil(np.log2(self.n.max()))), []
        while step >= 1:
            steps.append(step)
            step //= 2
        for s in steps + [1, 1]:
            for off in np.array(np.meshgrid([-s, 0, s], [-s, 0, s], [-s, 0, s])).T.reshape(-1, 3):
                if not off.any() or (np.abs(off) >= self.n).any():
                    continue
                cand = np.full_like(g, -1)
                src = tuple(slice(max(0, -d), n - max(0, d)) for d, n in zip(off, self.n))
                dst = tuple(slice(max(0, d), n - max(0, -d)) for d, n in zip(off, self.n))
                cand[dst] = g[src]
                dc = dist(cand)
                better = dc < best
                g[better], best[better] = cand[better], dc[better]
        self.g = g

    def query(self, Q):
        k = np.clip(np.floor((Q - self.lo) / self.h + 0.5).astype(int), 0, self.n - 1)
        best_i, best_d = np.full(len(Q), -1), np.full(len(Q), np.inf)
        for off in np.array(np.meshgrid([-1, 0, 1], [-1, 0, 1], [-1, 0, 1])).T.reshape(-1, 3):
            kk = np.clip(k + off, 0, self.n - 1)
            i = self.g[kk[:, 0], kk[:, 1], kk[:, 2]]
            d = np.linalg.norm(self.P[i] - Q, axis=1)
            b = d < best_d
            best_i[b], best_d[b] = i[b], d[b]
        return best_i, best_d


def inside(points, pos, tri, cell=0.01):
    """Whether each point is inside the closed mesh (parity of crossings along +Z)."""
    a, b, c = pos[tri[:, 0]], pos[tri[:, 1]], pos[tri[:, 2]]
    lo = np.floor(np.minimum(np.minimum(a, b), c)[:, :2] / cell).astype(np.int64)
    hi = np.floor(np.maximum(np.maximum(a, b), c)[:, :2] / cell).astype(np.int64)
    span = hi - lo + 1
    cells, ids = [], []
    for dx in range(span[:, 0].max()):
        for dy in range(span[:, 1].max()):
            m = (dx < span[:, 0]) & (dy < span[:, 1])
            cells.append(lo[m] + [dx, dy])
            ids.append(np.nonzero(m)[0])
    cells, ids = np.vstack(cells), np.concatenate(ids)
    key = cells[:, 0] * 100003 + cells[:, 1]
    order = np.argsort(key)
    key, ids = key[order], ids[order]
    qk = np.floor(points[:, :2] / cell).astype(np.int64)
    qkey = qk[:, 0] * 100003 + qk[:, 1]
    start, end = np.searchsorted(key, qkey, 'left'), np.searchsorted(key, qkey, 'right')
    count = np.zeros(len(points), int)
    off = 0
    while True:
        live = start + off < end
        if not live.any():
            break
        qi = np.nonzero(live)[0]
        t = ids[start[qi] + off]
        P, A, B, C = points[qi], a[t], b[t], c[t]
        v0, v1, v2 = (B - A)[:, :2], (C - A)[:, :2], (P - A)[:, :2]
        den = v0[:, 0] * v1[:, 1] - v1[:, 0] * v0[:, 1]
        with np.errstate(divide='ignore', invalid='ignore'):
            s = (v2[:, 0] * v1[:, 1] - v1[:, 0] * v2[:, 1]) / den
            r = (v0[:, 0] * v2[:, 1] - v2[:, 0] * v0[:, 1]) / den
            ok = (den != 0) & (s >= 0) & (r >= 0) & (s + r < 1)
            ok &= A[:, 2] + s * (B - A)[:, 2] + r * (C - A)[:, 2] > P[:, 2]
        np.add.at(count, qi[ok], 1)
        off += 1
    return count % 2 == 1


# --- cross-sections (arm centre lines) ------------------------------------------------------------

def slice_points(pos, tri, y):
    """Points where the mesh crosses the plane Y = y (XZ), two per crossed triangle."""
    p = pos[tri]
    d = p[:, :, 1] - y
    s = np.where(d >= 0, 1, -1)
    cut = ~((s[:, 0] == s[:, 1]) & (s[:, 1] == s[:, 2]))
    p, d, s = p[cut], d[cut], s[cut]
    out = []
    for a, b in ((0, 1), (1, 2), (2, 0)):
        m = s[:, a] != s[:, b]
        f = d[m, a] / (d[m, a] - d[m, b])
        out.append((p[m, a] + (p[m, b] - p[m, a]) * f[:, None])[:, [0, 2]])
    return np.vstack(out)


def clusters(pts, gap=0.015):
    """Split cross-section points into separate limbs and trunk (connected grid cells)."""
    key = np.floor(pts / gap).astype(int)
    uniq, inv = np.unique(key, axis=0, return_inverse=True)
    index = {tuple(k): i for i, k in enumerate(uniq)}
    parent = list(range(len(uniq)))

    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    for (cx, cz), i in index.items():
        for dx in (-1, 0, 1):
            for dz in (-1, 0, 1):
                j = index.get((cx + dx, cz + dz))
                if j is not None:
                    parent[find(i)] = find(j)
    lab = np.array([find(i) for i in range(len(uniq))])[inv.reshape(-1)]
    return [pts[lab == v] for v in np.unique(lab)]


def arm_axes(p, tri):
    """Each arm's centre line, from cross-sections below the armpit, then up to the shoulder joint."""
    seeds, labs = [], []
    for side in (-1, 1):
        line = []
        for y in np.arange(0.745, 1.145, 0.005):
            for c in clusters(slice_points(p, tri, y)):
                if len(c) > 20 and side * c[:, 0].mean() > 0.2 and np.ptp(c[:, 0]) < 0.15:
                    line.append([c[:, 0].mean(), y, c[:, 1].mean()])
        line = np.array(sorted(line, key=lambda q: q[1]))
        top, shoulder = line[-1], np.array([side * 0.185, 1.30, 0.0])
        line = np.vstack([line] + [top + (shoulder - top) * t for t in np.linspace(0, 1, 30)[1:]])
        for q in line:
            seeds.append(q)
            labs.append(NAMES.index('shoulder' if q[1] > 1.25 else 'upperarm' if q[1] > 1.035 else 'forearm' if q[1] > 0.905 else 'hand'))
    return np.array(seeds), np.array(labs)


# --- the leaner skin ------------------------------------------------------------------------------

def params(lab, u):
    """Per vertex (lean depth in metres, share kept), blended by the direction structure -> skin."""
    w_front = np.clip(u[:, 2] / 0.6, 0, 1) ** 1.5
    w_back = np.clip(-u[:, 2] / 0.6, 0, 1) ** 1.5
    w_side = 1 - w_front - w_back
    lmin, keep = np.zeros(len(lab)), np.ones(len(lab))
    for li, n in enumerate(NAMES):
        m = lab == li
        v = PARAMS[n]
        if not m.any():
            continue
        if isinstance(v, tuple):
            lmin[m], keep[m] = v[0] / 100, v[1]
        else:
            for key, w in (('front', w_front), ('side', w_side), ('back', w_back)):
                lmin[m] += w[m] * v[key][0] / 100
                keep[m] += w[m] * (v[key][1] - 1)
    return lmin, keep


def lean_skin(skin_pos, skin_tri, core, core_labels, shipped, log=print):
    """
    skin_pos, skin_tri: the source skin (atlas space). core, core_labels: from core_points().
    shipped: points of every structure drawn inside this skin in Atlas (they must stay inside).
    Returns the welded, leaner skin (positions, triangles) and a summary.
    """
    p, tri = weld(skin_pos, skin_tri.reshape(-1, 3))
    e = edges_of(tri)
    deg = np.bincount(e.ravel(), minlength=len(p)).astype(float)
    y = p[:, 1]
    box = (p.min(0) - 0.02, p.max(0) + 0.02)

    A, alab = arm_axes(p, tri)
    seeds, slab = np.vstack([core, A]), np.concatenate([core_labels, alab])
    i, D = Nearest(seeds, *box).query(p)
    lab = slab[i]
    is_ = lambda *n: np.isin(lab, [NAMES.index(x) for x in n])

    # 1-2. How much each vertex moves.
    lmin, keep = params(lab, (p - seeds[i]) / np.maximum(D, 1e-9)[:, None])
    # No ribs in the source: above the costal margin (xiphoid about y 1.16, falling to about 1.06 at
    # the side) the upper abdomen keeps the depth of the rib cage and its muscles.
    rib = ramp(y, 1.13 - 0.6 * np.abs(p[:, 0]), 1.19 - 0.6 * np.abs(p[:, 0])) * is_('abdomen')
    lmin, keep = lmin * (1 - rib) + 0.03 * rib, keep * (1 - rib) + 0.6 * rib
    lmin, keep = diffuse(lmin, e, deg, 150), diffuse(keep, e, deg, 150)
    m = (1 - keep) * np.maximum(0, diffuse(D, e, deg, 120) - lmin)
    m *= (1 - ramp(y, 1.30, 1.40)) * ramp(y, 0.08, 0.16)  # head, neck and feet unchanged

    # 3. The breasts, hands and head keep their shape; the change fades out well before them.
    breast = is_('breast')
    soft = np.clip(diffuse(((breast & (D < 0.03)) | is_('hand', 'head')).astype(float), e, deg, 120) * 1.6, 0, 1)
    hard = np.clip(diffuse(((breast & (D < 0.012)) | is_('hand', 'head')).astype(float), e, deg, 20) * 2, 0, 1)
    m = diffuse(m * (1 - soft), e, deg, 200) * (1 - hard)

    # 4. Never closer than MIN_GAP to anything inside.
    _, Dall = Nearest(np.vstack([seeds, shipped]), *box).query(p)
    cap = np.maximum(0, Dall - MIN_GAP) * 0.8
    for _ in range(6):
        m = diffuse(np.minimum(m, cap), e, deg, 15)
    m = np.minimum(m, cap)

    n_dir = diffuse(normals(p, tri), e, deg, 200)
    n_dir /= np.linalg.norm(n_dir, axis=1, keepdims=True)
    q = p - m[:, None] * n_dir

    # 5. Smooth the scan's skin folds, gently on the head, hands and feet, not where the areolae lie.
    w = (1 - 0.75 * ramp(y, 1.40, 1.48)) * (0.3 + 0.7 * ramp(y, 0.06, 0.12))
    w[is_('hand')] = 0.15
    near = breast & (D < 0.03)
    w[near] = np.minimum(w[near], 0.35)
    w = diffuse(w, e, deg, 25)
    w[breast & (D < 0.008)] = 0
    q = taubin(q, e, deg, 150, w)

    # 4 again: wherever anything inside comes within CHECK_GAP of the skin (or closer than it was in
    # the source), take the skin back towards where it was, in a smooth patch.
    _, first = np.unique(np.floor(shipped / 0.003).astype(np.int64), axis=0, return_index=True)
    test = shipped[first]
    in0 = inside(test, p, tri)

    def gap(points, verts):
        """Distance to the nearest skin vertex: the grid's answer, made exact where it is small."""
        vi, d = Nearest(verts, *box, h=0.008).query(points)
        order = np.argsort(verts[:, 0])
        xs = verts[order, 0]
        for j in np.nonzero(d < 0.012)[0]:
            a, b = np.searchsorted(xs, points[j, 0] - 0.02), np.searchsorted(xs, points[j, 0] + 0.02)
            near = verts[order[a:b]]
            d[j] = np.linalg.norm(near - points[j], axis=1).min()
        return vi, d

    _, d0 = gap(test, p)
    floor = np.where(in0, np.minimum(CHECK_GAP, d0 - 0.0005), -np.inf)  # already outside in the source: no check
    for it in range(10):
        vi, dq = gap(test, q)
        bad = in0 & (~inside(test, q, tri) | (dq < floor))
        log(f'  check {it}: {bad.sum()} of {len(test)} inner points too close to the skin')
        if not bad.any():
            break
        b = np.zeros(len(p))
        b[np.unique(vi[bad])] = 1
        b = np.clip(diffuse(b, e, deg, 30) * 4, 0, 1)
        q = q - b[:, None] * (q - p) * 0.6
    else:
        raise SystemExit('lean skin: inner structures still too close to the skin')

    moved = np.linalg.norm(q - p, axis=1)
    summary = f'skin moved up to {moved.max() * 100:.1f} cm (mean {moved.mean() * 100:.2f} cm); {len(p)} vertices'
    log('  ' + summary)
    return q, tri, summary
