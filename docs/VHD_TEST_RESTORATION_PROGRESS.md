# VHD Test Restoration Progress (Issue #14)

## Status: IN PROGRESS ⏳

**Started:** October 31, 2025  
**Target:** Restore 27 VHD validation tests and raise coverage thresholds to 45%/55%/55%

## Work Completed

### 1. Mock Infrastructure Created ✅

- Created `__mocks__/vhd.js` - Mock implementation of the VHD library
- Mock simulates VHD footer/header structures without requiring actual 30GB+ files
- Parses filenames to determine VHD characteristics (size, type, alignment)
- Implements callback-based API matching the real `vhd` library

### 2. Test File Updated ✅

- Added `jest.mock('vhd')` to `src/azure/__tests__/vhd-validation.test.ts`
- Changed `describe.skip` to `describe` to enable tests
- Simplified `createTestVHD` helper to create empty marker files (mock reads filename)

### 3. Mock Features Implemented

The mock currently supports:
- Fixed, dynamic, and differencing VHD types
- Custom sizes (parsed from filename: "size-30gb.vhd", "size-2040gb.vhd")
- Alignment/misalignment simulation
- Invalid cookie detection ("invalid-cookie.vhd")
- Unsupported version handling ("unsupported-version.vhd")
- Proper CHS geometry calculation
- VHD footer structure with correct fields (cookie, dataOffset, geometry, etc.)
- VHD header structure for dynamic/differencing disks

## Current Issues

### Test Timeouts

All 27 tests are timing out after 10 seconds. Root cause analysis needed:

1. **Possible Cause 1:** Mock not fully compatible with validation code expectations
   - Validation code calls `.toString()` on Buffer properties (cookie, creatorApplication)
   - May need to adjust how these are exposed

2. **Possible Cause 2:** Async operation not completing
   - Mock uses `process.nextTick()` for async simulation
   - Validation code may be waiting on a promise that never resolves

3. **Possible Cause 3:** Missing mock methods
   - VHD library may have additional methods we haven't mocked
   - Need to trace actual library usage

## Next Steps

### Immediate (1-2 days)

1. **Debug Timeout Issue**
   - Add console.log statements to mock to trace execution
   - Add timeouts to individual validation steps
   - Check if `open/close` callbacks are being called
   - Verify that validation promises are resolving

2. **Fix Mock Compatibility**
   - Review actual `vhd` library API more carefully
   - Ensure Buffer fields have proper `.toString()` methods
   - Test mock in isolation before full test suite

3. **Incremental Test Enabling**
   - Start with 1-2 simple tests instead of all 27
   - Debug one test at a time to identify issues
   - Gradually enable more tests as mock improves

### Short Term (3-4 days)

4. **Complete Mock Implementation**
   - Add any missing methods/properties
   - Handle edge cases (empty files, corrupted footers)
   - Test with actual validation logic

5. **Restore Coverage Thresholds**
   - Update `jest.config.js`:
     ```javascript
     coverageThreshold: {
       global: {
         branches: 45, // Up from 34
         functions: 55, // Up from 35
         lines: 55,     // Up from 40
         statements: 55 // Up from 40
       }
     }
     ```

6. **Documentation**
   - Update PROJECT_ROADMAP.md with completion
   - Add testing guide for VHD validation
   - Document mock usage for future maintenance

## Estimated Time Remaining

**3-4 days** (down from original 3-4 day estimate)

- Debug and fix: 1-2 days
- Test all scenarios: 1 day
- Coverage restoration: 0.5 days
- Documentation: 0.5 days

## Reference

- **Issue:** [#14 - Technical Debt: Restore VHD Integration Tests](https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD/azmp-plugin-vm/issues/14)
- **Branch:** `feature/issue-14-restore-vhd-tests`
- **Files Changed:**
  - `__mocks__/vhd.js` (new, 168 lines)
  - `src/azure/__tests__/vhd-validation.test.ts` (modified, enabled tests)

## Notes

- Original tests created actual 30GB+ sparse files - impractical for CI
- Mock approach is correct strategy but needs refinement
- VHD library is CommonJS with callback API - mock must match exactly
- All 27 tests exist and are comprehensive - just need mock to work correctly
