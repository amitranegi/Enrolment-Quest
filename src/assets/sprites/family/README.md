# Family front packs

Front-facing 6-frame strips (384×64). Unique idle + gesture baked in.

| File | Relation | Gender |
|------|----------|--------|
| `spouse_male.png` | spouse | male |
| `spouse_female.png` | spouse | female |
| `spouse_other.png` | spouse | other |
| `child_male.png` | child | male |
| `child_female.png` | child | female |
| `child_other.png` | child | other |
| `parent_male.png` | parent | male |
| `parent_female.png` | parent | female |
| `parent_other.png` | parent | other (currently = male) |

Resolved at runtime via `Sprites.familyFramesFor(relation, gender)`.
Focus Zone form includes a Look (gender) picker so the correct strip shows.
