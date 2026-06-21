export { Cartogram, type CartogramProps } from "./Cartogram";
export { ElectorateCell, type ElectorateCellProps } from "./ElectorateCell";
export { ParliamentArc, type ParliamentArcProps } from "./ParliamentArc";
export {
  ResultsTable,
  type ResultsTableProps,
  type ResultsColumn,
} from "./ResultsTable";

// --- Charts (ported from wallofadvantage) ---
export {
  default as VotesChart,
  type VotesParty,
  type VotesDefault,
  type VotesChartProps,
} from "./charts/VotesChart";
export {
  default as SeatsChart,
  type SeatsParty,
  type SeatsDefault,
  type SeatsChartProps,
} from "./charts/SeatsChart";
export {
  default as PartyBar,
  type PartyBarParty,
  type PartyBarAria,
  type PartyBarWhisker,
  type PartyBarProps,
} from "./charts/PartyBar";
export {
  default as OverUnderIndicator,
  type OverUnderIndicatorProps,
} from "./charts/OverUnderIndicator";
export { ChamberCharts, type ChamberChartsProps } from "./charts/ChamberCharts";
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./charts/Tooltip";
export {
  useBarDrag,
  useBarKeyboard,
  useElementWidth,
  barEdgeCSS,
  barCenterRightMarginCSS,
  rowStyleVars,
  applyPlateau,
  BADGE_PX,
} from "./charts/chartUtils";

// Sample fixtures (VIC 2022 lower house) for demos/consumers
export {
  SAMPLE_PARTIES,
  SAMPLE_SEATS,
  SAMPLE_TOTAL_SEATS,
  SAMPLE_MAJORITY,
  SAMPLE_VOTES,
  sampleSeatsParties,
  sampleVotesParties,
  type SampleParty,
} from "./charts/sampleData";
