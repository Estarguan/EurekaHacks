// ────────────────��────────────────────────────────���───────────────────────────
// [TEST MODE] Hardcoded lecture data — swap TEST_MODE to false to re-enable
// Groq API calls for real transcription + note generation.
// ─────────────────────────────────────────────────────────────────────────────

export const TEST_MODE = true;

export const SAMPLE_TRANSCRIPT = `
Alright everyone, settle down, let's get started. Today we're going to be talking about naming alkanes,
which is part of our unit on organic chemistry nomenclature. This is IUPAC naming, so the International
Union of Pure and Applied Chemistry — they set the rules that chemists worldwide follow so everyone's
on the same page.

So first things first, what is an alkane? Alkanes are hydrocarbons — meaning they only contain carbon
and hydrogen — and they have only single bonds between carbons. We call them saturated hydrocarbons
because they're saturated with hydrogen. The general formula is C n H 2n plus 2. So for one carbon,
methane, you get CH4. Two carbons, ethane, C2H6. Three carbons, propane, C3H8. You see the pattern.

Now the first four names — methane, ethane, propane, butane — those you just have to memorize, they're
from old common names. From five carbons onwards, the prefix is Greek: penta, hexa, hepta, octa, nona,
deca. Five carbons is pentane, six is hexane, and so on.

Okay so how do we name a branched alkane? Here are the steps. Step one: find the longest carbon chain.
That becomes your parent chain and tells you the base name. If your longest chain is seven carbons,
you're looking at heptane. Step two: number the carbons in that chain so that the substituents — the
branches — get the lowest possible numbers. So if you have a branch, you start numbering from the end
closest to it.

Step three: name the substituents. A branch that's just one carbon is called a methyl group. Two carbons
is ethyl. And you put the number of the carbon it's attached to as a prefix, like 2-methyl or 3-ethyl.

Step four: if you have multiple substituents of the same type, use di, tri, tetra as prefixes. So two
methyl groups is dimethyl, three is trimethyl.

Step five — and this one students always forget — when you have different substituents, you list them
in alphabetical order. Not based on their position numbers, alphabetical. So ethyl comes before methyl.
The di and tri prefixes don't count for alphabetical order, by the way.

Finally you put it all together: substituents listed alphabetically with their position numbers,
then the parent chain name. Like 3-ethyl-2-methylpentane. The parent chain is pentane, five carbons,
there's an ethyl group on carbon 3 and a methyl group on carbon 2.

One common mistake: students sometimes choose a shorter chain because the longer chain is harder to
see when the molecule is drawn in a zig-zag. Always make sure you've found the absolute longest chain.

Alright, we'll do some practice problems next.
`.trim();

export const SAMPLE_AI_NOTES = `
## Alkanes — Definition and Formula

- **Alkanes** are saturated hydrocarbons: contain only C and H, single bonds only
- General formula: **CₙH₂ₙ₊₂**
- First four names are memorized: **methane, ethane, propane, butane**
- C5 onwards use Greek prefixes: penta-, hexa-, hepta-, octa-, nona-, deca-

## IUPAC Naming Steps for Branched Alkanes

1. **Find the longest carbon chain** → this is the parent chain (gives the base name)
2. **Number the chain** from the end closest to a substituent (lowest locants rule)
3. **Name substituents** with their position number (e.g. 2-methyl, 3-ethyl)
   - 1 C branch = **methyl**, 2 C branch = **ethyl**
4. **Multiple identical substituents** → use di-, tri-, tetra- prefixes
5. **List substituents alphabetically** (di/tri prefixes are ignored for alphabetical order)

## Putting It Together

- Format: *[substituents alphabetically with locants]-[parent chain name]*
- Example: **3-ethyl-2-methylpentane**
  - Parent chain: pentane (5 C)
  - Ethyl on C3, methyl on C2
  - Ethyl listed before methyl (alphabetical)

## Common Mistakes

- **Missing the longest chain** — always double-check zig-zag drawn structures
- Forgetting alphabetical order and using numerical order instead
- Counting di/tri when alphabetizing (don't — ignore them)
`.trim();
