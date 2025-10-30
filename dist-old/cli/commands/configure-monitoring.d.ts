/**
 * CLI Command: Configure VM Monitoring
 *
 * Configures Azure VM monitoring, alert rules, and auto-shutdown.
 * Implements P1-4: Monitoring and Alerts Support.
 *
 * Usage:
 *   azmp vm configure-monitoring --vm-name <name> --email <email> --preset production
 *   azmp vm configure-monitoring --vm-name <name> --email <email> --alert-cpu --alert-memory
 */
import { Command } from 'commander';
declare const configureMonitoringCommand: Command;
export default configureMonitoringCommand;
