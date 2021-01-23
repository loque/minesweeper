import { atom, atomFamily, selector } from "recoil";

export const tileSizeAtom = atom({
  key: "tileSizeAtom",
  default: 0,
});

export const tileIsScanned = atomFamily({
  key: "tileIsScanned",
  default: false,
});

export const tileState = atomFamily({
  key: "tileState",
  default: "HIDDEN",
});

export const tileValue = atomFamily({
  key: "tileValue",
  default: 0,
});

export const tileHasMine = atomFamily({
  key: "tileHasMine",
  default: false,
});

/**
 * 0 = none
 * 1 = scanning one
 * 2 = scanning multi
 */
export const scanState = atom({
  key: "scanState",
  default: 0,
});

/**
 * Array of absIdx including target tile and adjacent tiles, in case of scanning
 * multiple tiles.
 */
export const scanTargets = atom({
  key: "scanTargets",
  default: [],
});

export const scanTargetsSelector = selector({
  key: "scanTargetsSelector",
  set: ({ set, get }, newTargets) => {
    const currScanState = get(scanState);
    if (currScanState) {
      // When scanning only one assume the first item is the tile at the center
      // of the cluster
      if (currScanState === 1) newTargets = newTargets.slice(0, 1);

      const prevTargets = get(scanTargets);
      const [toTrue, toFalse] = getSetDiff(newTargets, prevTargets);

      set(scanTargets, newTargets);

      toTrue.forEach((absIdx) => {
        set(tileIsScanned(absIdx), true);
      });

      toFalse.forEach((absIdx) => {
        set(tileIsScanned(absIdx), false);
      });
    }
  },
});

function getSetDiff(arr1, arr2) {
  const acc1 = {};
  const acc2 = [];

  for (let item1 of arr1) {
    acc1[item1] = item1;
  }

  for (let item2 of arr2) {
    if (acc1.hasOwnProperty(item2)) {
      delete acc1[item2];
    } else {
      acc2.push(item2);
    }
  }
  return [Object.values(acc1), acc2];
}
