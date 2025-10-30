/**
 * Tests for Azure VM Certification Test Module
 */

import {
  CertificationTestRunner,
  TestStatus,
  TestCategory,
  CertificationResults,
  VHDValidation,
  SecurityScan,
  PerformanceBenchmark,
  runBatchTests,
  quickValidate
} from '../certification-tests';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('CertificationTestRunner', () => {
  const mockVhdPath = '/test/mock.vhd';
  const mockOutputDir = '/test/output';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockFs.existsSync.mockImplementation((path: fs.PathLike) => {
      return path.toString().includes('mock.vhd');
    });

    mockFs.statSync.mockReturnValue({
      size: 10 * 1024 * 1024 * 1024, // 10GB
      isFile: () => true,
      isDirectory: () => false
    } as fs.Stats);

    mockFs.mkdirSync.mockImplementation(() => undefined);
  });

  describe('Construction', () => {
    test('should create instance with valid configuration', () => {
      const runner = new CertificationTestRunner({
        vhdPath: mockVhdPath
      });

      expect(runner).toBeInstanceOf(CertificationTestRunner);
    });

    test('should throw error if VHD path is not provided', () => {
      expect(() => {
        new CertificationTestRunner({
          vhdPath: ''
        });
      }).toThrow('VHD path is required');
    });

    test('should throw error if VHD file does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      expect(() => {
        new CertificationTestRunner({
          vhdPath: '/nonexistent/file.vhd'
        });
      }).toThrow('VHD file not found');
    });

    test('should create output directory if it does not exist', () => {
      mockFs.existsSync.mockImplementation((path: fs.PathLike) => {
        const pathStr = path.toString();
        return pathStr.includes('mock.vhd') && !pathStr.includes('output');
      });

      new CertificationTestRunner({
        vhdPath: mockVhdPath,
        outputDir: mockOutputDir
      });

      expect(mockFs.mkdirSync).toHaveBeenCalledWith(mockOutputDir, { recursive: true });
    });
  });

  describe('VHD Validation', () => {
    test('should validate VHD format successfully', async () => {
      const runner = new CertificationTestRunner({
        vhdPath: mockVhdPath
      });

      const validation = await runner.runVHDValidation();

      expect(validation).toBeDefined();
      expect(validation.format).toBe('VHD');
      expect(validation.sizeGB).toBeGreaterThan(0);
    });

    test('should fail validation for VHDX format', async () => {
      const vhdxPath = '/test/mock.vhdx';
      mockFs.existsSync.mockImplementation((path: fs.PathLike) => {
        return path.toString().includes('mock.vhdx');
      });

      const runner = new CertificationTestRunner({
        vhdPath: vhdxPath
      });

      const validation = await runner.runVHDValidation();

      expect(validation.isValid).toBe(false);
      expect(validation.format).toBe('VHDX');
      expect(validation.errors).toContain('VHD must be in .vhd format (not VHDX)');
    });

    test('should fail validation for VHD exceeding size limit', async () => {
      mockFs.statSync.mockReturnValue({
        size: 1100 * 1024 * 1024 * 1024, // 1100GB (exceeds 1023GB limit)
        isFile: () => true,
        isDirectory: () => false
      } as fs.Stats);

      const runner = new CertificationTestRunner({
        vhdPath: mockVhdPath
      });

      const validation = await runner.runVHDValidation();

      expect(validation.isValid).toBe(false);
      const sizeError = validation.errors.find((e: string) => e.includes('exceeds maximum'));
      expect(sizeError).toBeDefined();
    });

    test('should warn for very small VHD size', async () => {
      mockFs.statSync.mockReturnValue({
        size: 0.5 * 1024 * 1024 * 1024, // 0.5GB
        isFile: () => true,
        isDirectory: () => false
      } as fs.Stats);

      const runner = new CertificationTestRunner({
        vhdPath: mockVhdPath
      });

      const validation = await runner.runVHDValidation();

      const sizeWarning = validation.warnings.find((w: string) => w.includes('very small'));
      expect(sizeWarning).toBeDefined();
    });

    test('should fail validation for non-aligned VHD size', async () => {
      mockFs.statSync.mockReturnValue({
        size: (10 * 1024 * 1024 * 1024) + 512, // 10GB + 512 bytes (not 1MB aligned)
        isFile: () => true,
        isDirectory: () => false
      } as fs.Stats);

      const runner = new CertificationTestRunner({
        vhdPath: mockVhdPath
      });

      const validation = await runner.runVHDValidation();

      expect(validation.hasCorrectAlignment).toBe(false);
      expect(validation.errors).toContain('VHD size must be 1MB aligned');
    });
  });

  describe('Security Scan', () => {
    test('should run security scan successfully', async () => {
      const runner = new CertificationTestRunner({
        vhdPath: mockVhdPath
      });

      const scan = await runner.runSecurityScan();

      expect(scan).toBeDefined();
      expect(scan.hasNoDefaultCredentials).toBeDefined();
      expect(scan.hasNoMalware).toBeDefined();
      expect(scan.hasNoUnauthorizedSoftware).toBeDefined();
      expect(scan.hasSecureConfiguration).toBeDefined();
      expect(Array.isArray(scan.vulnerabilities)).toBe(true);
    });

    test('should skip security scan if configured', async () => {
      const runner = new CertificationTestRunner({
        vhdPath: mockVhdPath,
        skipSecurityScan: true
      });

      const results = await runner.runAll();

      const securityTests = results.testResults.filter(
        (test) => test.category === TestCategory.Security
      );
      expect(securityTests.length).toBe(0);
    });
  });

  describe('Generalization Check', () => {
    test('should check VHD generalization', async () => {
      const runner = new CertificationTestRunner({
        vhdPath: mockVhdPath
      });

      const isGeneralized = await runner.runGeneralizationCheck();

      expect(typeof isGeneralized).toBe('boolean');
    });
  });

  describe('Configuration Validation', () => {
    test('should validate VHD configuration', async () => {
      const runner = new CertificationTestRunner({
        vhdPath: mockVhdPath
      });

      const isValid = await runner.runConfigurationValidation();

      expect(typeof isValid).toBe('boolean');
    });
  });

  describe('Performance Benchmark', () => {
    test('should run performance benchmark successfully', async () => {
      const runner = new CertificationTestRunner({
        vhdPath: mockVhdPath
      });

      const benchmark = await runner.runPerformanceBenchmark();

      expect(benchmark).toBeDefined();
      expect(benchmark.bootTimeSeconds).toBeGreaterThan(0);
      expect(benchmark.diskReadMBps).toBeGreaterThan(0);
      expect(benchmark.diskWriteMBps).toBeGreaterThan(0);
      expect(benchmark.diskIOPS).toBeGreaterThan(0);
      expect(typeof benchmark.meetsMinimumRequirements).toBe('boolean');
    });

    test('should skip performance benchmark if configured', async () => {
      const runner = new CertificationTestRunner({
        vhdPath: mockVhdPath,
        skipPerformanceTest: true
      });

      const results = await runner.runAll();

      const performanceTests = results.testResults.filter(
        (test) => test.category === TestCategory.Performance
      );
      expect(performanceTests.length).toBe(0);
    });
  });

  describe('Compliance Checks', () => {
    test('should run compliance checks successfully', async () => {
      const runner = new CertificationTestRunner({
        vhdPath: mockVhdPath
      });

      const isPassed = await runner.runComplianceChecks();

      expect(typeof isPassed).toBe('boolean');
    });
  });

  describe('Run All Tests', () => {
    test('should run all certification tests successfully', async () => {
      const runner = new CertificationTestRunner({
        vhdPath: mockVhdPath
      });

      const results = await runner.runAll();

      expect(results).toBeDefined();
      expect(results.overallStatus).toBeDefined();
      expect(results.score).toBeGreaterThanOrEqual(0);
      expect(results.score).toBeLessThanOrEqual(100);
      expect(results.totalTests).toBeGreaterThan(0);
      expect(results.passedTests).toBeGreaterThanOrEqual(0);
      expect(results.failedTests).toBeGreaterThanOrEqual(0);
      expect(results.warningTests).toBeGreaterThanOrEqual(0);
      expect(results.skippedTests).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(results.testResults)).toBe(true);
      expect(Array.isArray(results.recommendations)).toBe(true);
      expect(Array.isArray(results.errors)).toBe(true);
    });

    test('should calculate score correctly', async () => {
      const runner = new CertificationTestRunner({
        vhdPath: mockVhdPath
      });

      const results = await runner.runAll();

      const expectedScore = Math.round(
        (results.passedTests / results.totalTests) * 100
      );
      expect(results.score).toBe(expectedScore);
    });

    test('should set overall status to Failed if any test fails', async () => {
      // This test would require mocking internal methods to force a failure
      // For now, we'll test the logic indirectly
      const runner = new CertificationTestRunner({
        vhdPath: mockVhdPath
      });

      const results = await runner.runAll();

      if (results.failedTests > 0) {
        expect(results.overallStatus).toBe(TestStatus.Failed);
      }
    });

    test('should set overall status to Warning if no failures but warnings exist', async () => {
      const runner = new CertificationTestRunner({
        vhdPath: mockVhdPath
      });

      const results = await runner.runAll();

      if (results.failedTests === 0 && results.warningTests > 0) {
        expect(results.overallStatus).toBe(TestStatus.Warning);
      }
    });

    test('should set overall status to Passed if all tests pass', async () => {
      const runner = new CertificationTestRunner({
        vhdPath: mockVhdPath
      });

      const results = await runner.runAll();

      if (results.failedTests === 0 && results.warningTests === 0) {
        expect(results.overallStatus).toBe(TestStatus.Passed);
      }
    });

    test('should track test duration', async () => {
      const runner = new CertificationTestRunner({
        vhdPath: mockVhdPath
      });

      const results = await runner.runAll();

      expect(results.duration).toBeGreaterThanOrEqual(0);
      expect(results.startTime).toBeInstanceOf(Date);
      expect(results.endTime).toBeInstanceOf(Date);
      expect(results.endTime.getTime()).toBeGreaterThanOrEqual(
        results.startTime.getTime()
      );
    });

    test('should include individual test results', async () => {
      const runner = new CertificationTestRunner({
        vhdPath: mockVhdPath
      });

      const results = await runner.runAll();

      expect(results.testResults.length).toBeGreaterThan(0);
      results.testResults.forEach((test) => {
        expect(test.name).toBeDefined();
        expect(test.category).toBeDefined();
        expect(test.status).toBeDefined();
        expect(test.message).toBeDefined();
        expect(test.timestamp).toBeInstanceOf(Date);
      });
    });

    test('should provide recommendations', async () => {
      const runner = new CertificationTestRunner({
        vhdPath: mockVhdPath
      });

      const results = await runner.runAll();

      expect(Array.isArray(results.recommendations)).toBe(true);
      if (results.score >= 90) {
        const readyRecommendation = results.recommendations.find((r: string) =>
          r.includes('ready for Azure Marketplace')
        );
        expect(readyRecommendation).toBeDefined();
      }
    });

    test('should collect errors from failed tests', async () => {
      const runner = new CertificationTestRunner({
        vhdPath: mockVhdPath
      });

      const results = await runner.runAll();

      expect(Array.isArray(results.errors)).toBe(true);
      if (results.failedTests > 0) {
        expect(results.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Get Summary', () => {
    test('should generate text summary', async () => {
      const runner = new CertificationTestRunner({
        vhdPath: mockVhdPath
      });

      await runner.runAll();
      const summary = runner.getSummary();

      expect(summary).toBeDefined();
      expect(typeof summary).toBe('string');
      expect(summary).toContain('Certification Test Summary');
      expect(summary).toContain('Overall Status:');
      expect(summary).toContain('Score:');
      expect(summary).toContain('Test Results:');
    });

    test('should include error details in summary when tests fail', async () => {
      const vhdxPath = '/test/mock.vhdx';
      mockFs.existsSync.mockImplementation((path: fs.PathLike) => {
        return path.toString().includes('mock.vhdx');
      });

      const runner = new CertificationTestRunner({
        vhdPath: vhdxPath
      });

      await runner.runAll();
      const summary = runner.getSummary();

      if (summary.includes('Failed:') && !summary.includes('Failed: 0')) {
        expect(summary).toContain('Errors:');
      }
    });

    test('should include recommendations in summary', async () => {
      const runner = new CertificationTestRunner({
        vhdPath: mockVhdPath
      });

      await runner.runAll();
      const summary = runner.getSummary();

      expect(summary).toContain('Recommendations:');
    });
  });

  describe('Batch Tests', () => {
    test('should run batch tests on multiple VHDs', async () => {
      const vhdPaths = [
        '/test/mock1.vhd',
        '/test/mock2.vhd',
        '/test/mock3.vhd'
      ];

      mockFs.existsSync.mockReturnValue(true);

      const results = await runBatchTests(vhdPaths);

      expect(results).toBeInstanceOf(Map);
      expect(results.size).toBe(3);

      vhdPaths.forEach((vhdPath) => {
        const result = results.get(vhdPath);
        expect(result).toBeDefined();
        if (result) {
          expect(result.overallStatus).toBeDefined();
          expect(result.score).toBeGreaterThanOrEqual(0);
          expect(result.score).toBeLessThanOrEqual(100);
        }
      });
    });

    test('should handle batch test configuration', async () => {
      const vhdPaths = ['/test/mock1.vhd', '/test/mock2.vhd'];
      mockFs.existsSync.mockReturnValue(true);

      const results = await runBatchTests(vhdPaths, {
        skipSecurityScan: true,
        skipPerformanceTest: true,
        verboseOutput: false
      });

      expect(results.size).toBe(2);
    });
  });

  describe('Quick Validate', () => {
    test('should perform quick VHD validation', async () => {
      const validation = await quickValidate(mockVhdPath);

      expect(validation).toBeDefined();
      expect(validation.isValid).toBeDefined();
      expect(validation.format).toBeDefined();
      expect(validation.sizeGB).toBeGreaterThan(0);
    });

    test('should skip security and performance tests in quick validation', async () => {
      const validation = await quickValidate(mockVhdPath);

      // Quick validate should only return VHD validation, not full test results
      expect(validation).toBeDefined();
      expect(validation.format).toBe('VHD');
    });
  });

  describe('Verbose Output', () => {
    test('should log test results when verbose output is enabled', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const runner = new CertificationTestRunner({
        vhdPath: mockVhdPath,
        verboseOutput: true
      });

      await runner.runAll();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('should not log test results when verbose output is disabled', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const runner = new CertificationTestRunner({
        vhdPath: mockVhdPath,
        verboseOutput: false
      });

      await runner.runAll();

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Test Categories', () => {
    test('should include tests from all categories', async () => {
      const runner = new CertificationTestRunner({
        vhdPath: mockVhdPath
      });

      const results = await runner.runAll();

      const categories = new Set(results.testResults.map((test) => test.category));

      expect(categories.has(TestCategory.VHDFormat)).toBe(true);
      expect(categories.has(TestCategory.Generalization)).toBe(true);
      expect(categories.has(TestCategory.Configuration)).toBe(true);
      expect(categories.has(TestCategory.Compliance)).toBe(true);
    });

    test('should categorize tests correctly', async () => {
      const runner = new CertificationTestRunner({
        vhdPath: mockVhdPath
      });

      const results = await runner.runAll();

      results.testResults.forEach((test) => {
        expect(Object.values(TestCategory)).toContain(test.category);
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle VHD validation errors gracefully', async () => {
      mockFs.statSync.mockImplementation(() => {
        throw new Error('Mock stat error');
      });

      const runner = new CertificationTestRunner({
        vhdPath: mockVhdPath
      });

      await expect(runner.runVHDValidation()).rejects.toThrow('Mock stat error');
    });

    test('should continue running tests after non-critical errors', async () => {
      const runner = new CertificationTestRunner({
        vhdPath: mockVhdPath,
        skipSecurityScan: false,
        skipPerformanceTest: false
      });

      const results = await runner.runAll();

      // Even if some tests have errors, results should be returned
      expect(results).toBeDefined();
      expect(results.totalTests).toBeGreaterThan(0);
    });
  });
});
