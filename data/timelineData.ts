import { TimelineVisualData } from '../types';

export const TIMELINE_VISUAL_DATA: Record<string, TimelineVisualData> = {
    "magadha": {
        "start": 544,
        "end": 321,
        "dynasties": [
            { "name": "Haryanka", "start": 544, "end": 413, "detailsId": "haryanka-dynasty", "color": "#ef4444" },
            { "name": "Shishunaga", "start": 413, "end": 345, "detailsId": "shishunaga-dynasty", "color": "#22c55e" },
            { "name": "Nanda", "start": 345, "end": 321, "detailsId": "nanda-dynasty", "color": "#f97316" }
        ]
    },
    "invasions": {
        "start": -560,
        "end": -300,
        "dynasties": [
            { "name": "Achaemenid Empire", "start": -550, "end": -330, "detailsId": "iranian-greek-invasions", "color": "#a855f7" },
            { "name": "Macedonian Invasion", "start": -326, "end": -323, "detailsId": "greek-invasion", "color": "#ef4444" }
        ]
    },
    "maurya": {
        "start": 322,
        "end": 185,
        "dynasties": [
            { "name": "Mauryan Empire", "start": 322, "end": 185, "detailsId": "maurya-dynasty-details", "color": "#eab308" }
        ]
    },
    "post-maurya-sangam": {
        "start": 185,
        "end": 300,
        "dynasties": [
             { "name": "Shunga", "start": 185, "end": 73, "detailsId": "shunga-dynasty", "color": "#8b5cf6" },
             { "name": "Kanva", "start": 73, "end": 28, "detailsId": "kanva-dynasty", "color": "#14b8a6" },
             { "name": "Satavahana", "start": -50, "end": 220, "detailsId": "satavahana-dynasty", "color": "#06b6d4" },
             { "name": "Sangam Age", "start": -300, "end": 300, "detailsId": "sangam-age-intro", "color": "#f43f5e" }
        ]
    },
    "gupta-post-gupta": {
        "start": 300,
        "end": 750,
        "dynasties": [
            { "name": "Gupta Empire", "start": 319, "end": 550, "detailsId": "gupta-dynasty", "color": "#3b82f6" },
            { "name": "Vakataka", "start": 250, "end": 500, "detailsId": "vakataka-dynasty", "color": "#a855f7" },
            { "name": "Vardhana", "start": 550, "end": 647, "detailsId": "vardhana-dynasty-parent", "color": "#ec4899" },
            { "name": "Maukhari", "start": 550, "end": 606, "detailsId": "maukhari-dynasty", "color": "#f59e0b" }
        ]
    },
    "early-medieval": {
        "start": 700,
        "end": 1300,
        "dynasties": [
            { "name": "Gurjara-Pratihara", "start": 730, "end": 1036, "detailsId": "tripartite-struggle", "color": "#f97316" },
            { "name": "Pala", "start": 750, "end": 1161, "detailsId": "pala-dynasty", "color": "#3b82f6" },
            { "name": "Rashtrakuta", "start": 753, "end": 982, "detailsId": "rashtrakuta-dynasty", "color": "#ec4899" },
            { "name": "Imperial Chola", "start": 850, "end": 1279, "detailsId": "imperial-chola-dynasty", "color": "#eab308" },
            { "name": "Chandela", "start": 950, "end": 1250, "detailsId": "chandela-dynasty", "color": "#8b5cf6" }
        ]
    },
    "sultanate": {
        "start": 1150,
        "end": 1800,
        "dynasties": [
            { "name": "Delhi Sultanate", "start": 1206, "end": 1526, "detailsId": "delhi-sultanate-intro", "color": "#10b981" },
            { "name": "Ahom Kingdom", "start": 1228, "end": 1826, "detailsId": "ahom-dynasty", "color": "#ef4444" },
            { "name": "Vijayanagara", "start": 1336, "end": 1646, "detailsId": "vijayanagara-empire", "color": "#f59e0b" },
            { "name": "Sharqi", "start": 1394, "end": 1479, "detailsId": "sharqi-dynasty", "color": "#6366f1" }
        ]
    },
    "sultanate-dynasties": {
        "start": 1206,
        "end": 1526,
        "dynasties": [
            { "name": "Mamluk", "start": 1206, "end": 1290, "detailsId": "mamluk-dynasty", "color": "#ef4444" },
            { "name": "Khilji", "start": 1290, "end": 1320, "detailsId": "khilji-dynasty", "color": "#f97316" },
            { "name": "Tughlaq", "start": 1320, "end": 1414, "detailsId": "tughlaq-dynasty", "color": "#eab308" },
            { "name": "Sayyid", "start": 1414, "end": 1451, "detailsId": "sayyid-dynasty", "color": "#10b981" },
            { "name": "Lodi", "start": 1451, "end": 1526, "detailsId": "lodi-dynasty", "color": "#3b82f6" }
        ]
    },
    "mughal": {
        "start": 1526,
        "end": 1857,
        "dynasties": [
            { "name": "Mughal Empire", "start": 1526, "end": 1857, "detailsId": "mughal-empire", "color": "#10b981" }
        ]
    },
    "regional": {
        "start": 1000,
        "end": 1950,
        "dynasties": [
            { "name": "Kachwaha (Jaipur)", "start": 1100, "end": 1949, "detailsId": "kachwaha-dynasty", "color": "#ec4899" },
            { "name": "Jaintia", "start": 1500, "end": 1835, "detailsId": "jaintia-kingdom", "color": "#06b6d4" }
        ]
    }
};