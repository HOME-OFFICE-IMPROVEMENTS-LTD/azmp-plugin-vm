import { Command } from "commander";
import { ProximityPlacementGroupCLI } from "../highavailability/ppg";
import { HighAvailabilityCLI } from "../highavailability/cluster";
import { LoadBalancerCLI } from "../highavailability/loadbalancer";
/**
 * Register HA CLI commands with parent VM command
 */
export declare function registerHACommands(parentCommand: Command): void;
export { ProximityPlacementGroupCLI, HighAvailabilityCLI, LoadBalancerCLI };
export { VmssCLI } from '../highavailability/vmss';
export { HealthExtensionCLI } from '../highavailability/health';
