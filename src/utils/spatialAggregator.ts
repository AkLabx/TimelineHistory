import { parsePeriodToRange, calculateYCoordinate } from './timeParser';
import { PART_DATA, DYNASTY_DATA, KINGS_DATA } from './contentLoader';

export interface Node3DData {
  id: string; type: 'era' | 'dynasty' | 'king'; title: string; title_en?: string; period: string;
  imageUrl?: string; x: number; y: number; z: number; startY: number; endY: number;
  parentId?: string; children: string[];
}
export function buildSpatialGraph(): { nodes: Record<string, Node3DData>, eras: string[] } {
  const nodes: Record<string, Node3DData> = {};
  const eraList: string[] = [];
  let eraIndex = 0;
  for (const card of (PART_DATA.timelineCards as any[])) {
    const periodStr = card.period_en || card.period || '';
    const [startYear, endYear] = parsePeriodToRange(periodStr);
    const midYear = (startYear + endYear) / 2;
    const startY = calculateYCoordinate(startYear);
    const endY = calculateYCoordinate(endYear);
    const yPos = calculateYCoordinate(midYear);
    const xPos = Math.sin(eraIndex * 1.5) * 20;
    nodes[card.target] = { id: card.target, type: 'era', title: card.title, title_en: card.title_en, period: periodStr, imageUrl: card.imageUrl, x: xPos, y: yPos, z: 0, startY: startY, endY: endY, children: [] };
    eraList.push(card.target);
    eraIndex++;
  }
  for (const [eraId, dynastyData] of Object.entries(DYNASTY_DATA)) {
    if (nodes[eraId]) {
       let parallelOffset = -30;
       for (const item of dynastyData.items || []) {
         if (item.type === 'dynasty-details' && item.summary) {
            const summaryAny = item.summary as any;
            const periodStr = summaryAny.period_en || item.summary.period || '';
            const [startYear, endYear] = parsePeriodToRange(periodStr);
            const midYear = (startYear + endYear) / 2;
            const dynastyId = item.id || '';
            if (dynastyId) {
                nodes[eraId].children.push(dynastyId);
                nodes[dynastyId] = { id: dynastyId, type: 'dynasty', title: item.summary.title, title_en: summaryAny.title_en, period: periodStr, x: nodes[eraId].x + parallelOffset, y: calculateYCoordinate(midYear), z: 50, startY: calculateYCoordinate(startYear), endY: calculateYCoordinate(endYear), parentId: eraId, children: item.subItems || [] };
                parallelOffset += 60;
            }
         }
       }
    }
  }
  for (const [kingId, kingData] of Object.entries(KINGS_DATA)) {
    let parentDynastyId = undefined;
    for (const [nodeId, node] of Object.entries(nodes)) {
        if (node.type === 'dynasty' && node.children.includes(kingId)) {
            parentDynastyId = nodeId; break;
        }
    }
    if (parentDynastyId) {
        const parent = nodes[parentDynastyId];
        const summaryAny = kingData.summary as any;
        const reignStr = summaryAny?.reign_en || kingData.summary?.reign || summaryAny?.period_en || kingData.summary?.period || '';
        let midYearY = parent.y;
        if (reignStr) {
            const [kStart, kEnd] = parsePeriodToRange(reignStr);
            midYearY = calculateYCoordinate((kStart + kEnd) / 2);
        } else {
            const index = parent.children.indexOf(kingId);
            const total = parent.children.length;
            const progress = (index + 1) / (total + 1);
            midYearY = parent.startY + (parent.endY - parent.startY) * progress;
        }
        const index = parent.children.indexOf(kingId);
        const spread = 20;
        const xOffset = (index % 2 === 0 ? 1 : -1) * (spread + (index * 5));
        nodes[kingId] = { id: kingId, type: 'king', title: kingData.summary?.title || '', title_en: summaryAny?.title_en || '', period: reignStr, imageUrl: kingData.imageUrl, x: parent.x + xOffset, y: midYearY, z: 100, startY: midYearY, endY: midYearY, parentId: parentDynastyId, children: [] };
    }
  }
  return { nodes, eras: eraList };
}
