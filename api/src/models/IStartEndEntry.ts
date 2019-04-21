export interface IStartEndEntry {
    id: string;
    start: Date;
    end: Date;
    ymd: string;
    minutes: number;
    minI: number;
    maxI: number;
    minO: number;
    maxO: number;
    minT: number;
    maxT: number;
    minW: number;
    maxW: number;
    hc: string;
    temperature: number;
    humidity: number;
    records: number;
    missingRecords: boolean;
}
