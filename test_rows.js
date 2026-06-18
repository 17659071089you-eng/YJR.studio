const REAL_ASPECT_RATIOS = {
  1: 1, 2: 0.707, 3: 1.791, 4: 1, 5: 1.776, 6: 1.6, 7: 0.945, 8: 1.593, 
  9: 1.791, 10: 0.826, 11: 1.833, 12: 1.777, 13: 1.791, 14: 2.098, 15: 0.707, 
  16: 2.002, 17: 0.805, 101: 1.791, 102: 0.707, 103: 0.746, 104: 0.707, 105: 1, 
  106: 0.707, 107: 1.967, 108: 1, 109: 0.707, 110: 1, 111: 1, 112: 1.6, 113: 1.6, 
  114: 1.6, 115: 1.6, 117: 0.945, 118: 0.8, 119: 1.967, 120: 1.802,
};

const optimizedGalleryOrder = [
  1, 7, 2, 8, 12, 3, 10, 4, 5, 17, 6, 11, 15, 9, 13, 14, 16
];

const galleryItems = optimizedGalleryOrder.map(id => ({id}));
const items = [
  ...galleryItems,
  { id: 101 }, { id: 102 }, { id: 103 }, { id: 104 }, { id: 105 }, { id: 106 }, { id: 107 }, { id: 108 },
  { id: 109 }, { id: 110 }, { id: 111 }, { id: 112 }, { id: 113 }, { id: 114 }, { id: 115 }, { id: 117 },
  { id: 118 }, { id: 119 }, { id: 120 }
];

const filteredItems = items.filter(item => item.id !== 119);

const stableItemARs = filteredItems.map(item => REAL_ASPECT_RATIOS[item.id] || 1.77);
const totalStableAR = stableItemARs.reduce((sum, ar) => sum + ar, 0);

const targetRowAR = 1.8;
const optimalRowCount = Math.max(1, Math.round(totalStableAR / targetRowAR));
const optimalTargetAR = totalStableAR / optimalRowCount;

const modalRows = [];
let currentRow = [];
let currentAR = 0;

filteredItems.forEach((item, index) => {
  currentRow.push(item);
  currentAR += stableItemARs[index];
  if (currentAR >= optimalTargetAR - (stableItemARs[index] * 0.4) && modalRows.length < optimalRowCount - 1) {
    modalRows.push([...currentRow]);
    currentRow = [];
    currentAR = 0;
  }
});
if (currentRow.length > 0) {
    if (currentAR < optimalTargetAR - 0.5) modalRows.push([{id: "upcoming"}]);
    modalRows.push([...currentRow]);
}

modalRows.forEach((row, idx) => {
  console.log(`row ${idx + 1}: ${row.map(i=>i.id).join(', ')}`);
});
